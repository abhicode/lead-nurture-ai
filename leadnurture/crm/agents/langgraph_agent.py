from langgraph.graph import StateGraph, END, START
from typing import TypedDict, List, Dict, Optional
from openai import OpenAI
from concurrent.futures import ProcessPoolExecutor, as_completed
from crm.models import Leads, Campaign
from .chroma_client import get_chroma_collection
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class OrchestratorState(TypedDict):
    leads: List[Dict]
    campaign: Dict
    messages: List[Dict]
    conversation_id: Optional[int]
    lead_reply: Optional[str]
    summary: Optional[str]
    ai_reply: Optional[str]

def generate_single_message(lead, campaign_data, brochure_data):
    lead_data = {
        "name": lead["name"],
        "unit_type": lead.get("unit_type"),
        "min_budget": lead.get("min_budget"),
        "max_budget": lead.get("max_budget"),
        "last_conversation_summary": lead.get("last_conversation_summary", ""),
    }

    prompt = f"""You are an expert real estate sales agent.
    Generate a short, personalized message for {lead_data['name']}
    about the project {campaign_data['project_name']}.
    Keep the message concise (max 150 words), professional, and engaging.

    Offer details: {campaign_data['sales_offer_details']}
    Lead interest: {lead_data['unit_type']}
    Budget: {lead_data['min_budget']} - {lead_data['max_budget']}
    Brochure details: {brochure_data}"""

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=200,
    )
    msg = completion.choices[0].message.content.strip()
    return {"lead": lead_data["name"], "message": msg}

def fetch_brochure_data(state: OrchestratorState):
    campaign = state["campaign"]
    if state.get("lead_reply"):
        query_text = state["lead_reply"] + " " + campaign["project_name"]
    else:
        query_text = campaign["project_name"]
    collection = get_chroma_collection("brochures")
    result = collection.query(query_texts=[query_text], n_results=1)
    brochure_data = result["documents"][0][0] if result["documents"] else ""
    state["campaign"]["brochure_data"] = brochure_data
    return state

def generate_messages_for_leads(state: OrchestratorState):
    campaign_data = state["campaign"]
    leads = state["leads"]
    brochure_data = campaign_data.get("brochure_data", "")
    messages = []

    with ProcessPoolExecutor() as executor:
        futures = [
            executor.submit(generate_single_message, lead, campaign_data, brochure_data)
            for lead in leads
        ]
        for future in as_completed(futures):
            try:
                messages.append(future.result())
            except Exception as e:
                print(f"Error generating message for {future.result()}: {e}")

    state["messages"] = messages
    return state

def generate_ai_reply(state: OrchestratorState):
    if not state.get("lead_reply"):
        return state  # Skip if no reply to respond to

    brochure_data = state["campaign"].get("brochure_data", "")
    summary = state.get("summary", "No previous summary")

    prompt = f"""You are an AI real estate assistant continuing a chat with a potential buyer.

    Lead message: {state['lead_reply']}
    Context summary: {summary}
    Brochure details: {brochure_data}

    Reply professionally and persuasively, keeping it short and relevant."""

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    ai_reply = completion.choices[0].message.content.strip()
    state["ai_reply"] = ai_reply
    return state

def summarize_conversation(state: OrchestratorState):
    conversation_text = "\n".join(
        [m.get("content", "") for m in state.get("messages", [])]
    ) + f"\nLatest lead reply: {state.get('lead_reply', '')}\nAI reply: {state.get('ai_reply', '')}"

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a CRM assistant summarizing a client conversation."},
            {"role": "user", "content": f"Summarize this conversation briefly:\n{conversation_text}"}
        ],
        temperature=0.3,
    )

    state["summary"] = completion.choices[0].message.content.strip()
    return state


graph = StateGraph(OrchestratorState)

graph.add_node("fetch_brochure_data", fetch_brochure_data)
graph.add_node("generate_messages_for_leads", generate_messages_for_leads)
graph.add_node("generate_ai_reply", generate_ai_reply)
graph.add_node("summarize_conversation", summarize_conversation)

graph.add_edge(START, "fetch_brochure_data")
graph.add_edge("fetch_brochure_data", "generate_messages_for_leads")
graph.add_edge("generate_messages_for_leads", "generate_ai_reply")
graph.add_edge("generate_ai_reply", "summarize_conversation")
graph.add_edge("summarize_conversation", END)

agent = graph.compile()