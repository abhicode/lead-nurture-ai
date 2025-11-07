from typing import List
from crm.models import Conversation, Message
from crm.auth import JWTAuth
from django.db.models import Count
from ninja import Router

auth = JWTAuth()

router = Router(tags=["Conversations"])

@router.get("/", auth=auth)
def list_conversations(request):
    conversations = (
        Conversation.objects
        .select_related("lead", "campaign")
        .annotate(message_count=Count("message"))
    )
    data = [
        {
            "id": conv.id,
            "lead_name": conv.lead.name,
            "lead_email": conv.lead.email,
            "campaign_name": conv.campaign.name,
            "message_count": conv.message_count,
        }
        for conv in conversations
    ]
    return data

@router.get("/{conversation_id}/messages/", auth=auth)
def get_conversation_messages(request, conversation_id: int):
    messages = Message.objects.filter(conversation_id=conversation_id).order_by("timestamp")
    data = [
        {
            "sender": msg.sender,
            "content": msg.content,
            "timestamp": msg.timestamp,
        }
        for msg in messages
    ]
    return {"conversation_id": conversation_id, "messages": data}
