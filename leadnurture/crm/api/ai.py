# api/ai.py
from ninja import Router
from typing import List
from crm.models import Campaign, Leads, Conversation, Message
from crm.auth import JWTAuth
from ninja import Schema
from asgiref.sync import sync_to_async
import asyncio
from ..notifications import EmailNotifier
from django.utils import timezone
from ..agents.langgraph_agent import agent
import asyncio
from dotenv import load_dotenv
import os

load_dotenv()

FROM_EMAIL = os.getenv("FROM_EMAIL", "test@gmail.com")

router = Router(tags=["AI"])

auth = JWTAuth()

class AutoNurtureIn(Schema):
    campaign_id: int
    lead_ids: List[int]

class GeneratedMessageOut(Schema):
    lead: str
    message: str

class GenerateMessagesResponse(Schema):
    status: str
    messages: List[GeneratedMessageOut]

class SendMessageIn(Schema):
    conversation_id: int
    content: str

class SendMessageOut(Schema):
    status: str
    ai_message: str
    new_summary: str

@router.post("/send_message/", response=SendMessageOut, auth=auth)
async def send_message(request, data: SendMessageIn):
    # Fetch conversation & related lead and campaign
    conv = await sync_to_async(
        Conversation.objects.select_related("lead", "campaign").get
    )(id=data.conversation_id)
    lead = conv.lead
    campaign = conv.campaign

    # Save lead message
    await sync_to_async(Message.objects.create)(
        conversation=conv, sender="lead", content=data.content
    )

    # Prepare initial state for LangGraph
    state = {
        "leads": [
            {
                "name": lead.name,
                "unit_type": lead.unit_type,
                "min_budget": lead.min_budget,
                "max_budget": lead.max_budget,
                "last_conversation_summary": lead.last_conversation_summary or "",
            }
        ],
        "campaign": {
            "project_name": campaign.project_name,
            "sales_offer_details": campaign.sales_offer_details,
        },
        "lead_reply": data.content,
        "conversation_id": conv.id,
        "summary": lead.last_conversation_summary or "",
    }

    # Run LangGraph agent (brochure → ai_reply → summary)
    try:
        result = await asyncio.to_thread(agent.invoke, state)
    except Exception as e:
        print(f"Error running LangGraph: {e}")
        return {"status": "error", "message": "AI generation failed"}
    
    print("result\n",result)
    print("ai_message\n",result.get("ai_reply"))
    print("summary\n",result.get("summary"))

    ai_message = result.get("ai_reply") or "Thank you for your message! We'll get back shortly."
    new_summary = result.get("summary") or lead.last_conversation_summary

    # Save AI reply to DB
    await sync_to_async(Message.objects.create)(
        conversation=conv, sender="ai", content=ai_message
    )

    # Update lead summary + timestamp
    lead.last_conversation_summary = new_summary
    lead.last_conversation_date = timezone.now()
    await sync_to_async(lead.save)(
        update_fields=["last_conversation_summary", "last_conversation_date"]
    )

    # Return structured response
    return {
        "status": "success",
        "ai_message": ai_message,
        "new_summary": new_summary,
    }

@router.post("/auto_nurture/", response=GenerateMessagesResponse, auth=auth)
async def generate_messages(request, data: AutoNurtureIn):
    campaign = await sync_to_async(Campaign.objects.get)(id=data.campaign_id)
    leads = await sync_to_async(lambda: list(Leads.objects.filter(id__in=data.lead_ids)))()

    # Persist conversations and messages
    persisted = []
    notifier = EmailNotifier(from_email=FROM_EMAIL)

    for lead in leads:
        try:
            # Run the LangGraph workflow
            result = await asyncio.to_thread(
                agent.invoke,
                {
                    "campaign": {
                        "project_name": campaign.project_name,
                        "sales_offer_details": campaign.sales_offer_details,
                    },
                    "leads": [
                        {
                            "name": l.name,
                            "unit_type": l.unit_type,
                            "min_budget": l.min_budget,
                            "max_budget": l.max_budget,
                            "last_conversation_summary": l.last_conversation_summary or "",
                        }
                        for l in leads
                    ],
                },
            )
            messages = result.get("messages", [])
            ai_message = messages[0]["message"] if messages else "Hi, we have a great offer for you!"

            # Persist conversation + message
            conv = await sync_to_async(Conversation.objects.create)(
                campaign=campaign, lead=lead, state="active"
            )
            await sync_to_async(Message.objects.create)(
                conversation=conv, sender="ai", content=ai_message
            )

            persisted.append({"lead": lead.name, "message": ai_message})

            # Send via email (optional)
            subject, body = split_subject_and_body(ai_message)
            await sync_to_async(notifier.notify)(
                [lead.email or "test@gmail.com"], subject, body
            )

        except Exception as e:
            print(f"Error generating message for {lead.name}: {e}")
            persisted.append({"lead": lead.name, "message": "Error generating message"})

    return {"status": "success", "messages": persisted}

def split_subject_and_body(message: str):
    """Extracts subject and body from an AI-generated email-like message."""
    if not message:
        return "", ""

    # Normalize line endings and strip leading/trailing spaces
    msg = message.strip().replace("\r\n", "\n")

    # Check if it starts with "Subject:"
    if msg.lower().startswith("subject:"):
        # Split once at the first newline after "Subject:"
        parts = msg.split("\n", 1)
        subject_line = parts[0]
        subject = subject_line[len("Subject:"):].strip()

        # The rest is the body (after optional extra newline)
        body = parts[1].lstrip("\n") if len(parts) > 1 else ""
        return subject, body

    # Fallback: no "Subject:" prefix found
    return "", msg.strip()
