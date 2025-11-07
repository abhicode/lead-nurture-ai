from ninja import Router
from ninja import Schema
from crm.services import CampaignService
from typing import List
from crm.models import Campaign, Message
from crm.auth import JWTAuth

auth = JWTAuth()

router = Router(tags=["Campaigns"])

class CampaignIn(Schema):
    name: str
    project_name: str
    sales_offer_details: str
    nurturing_channel: str
    lead_ids: List[int]

class CampaignOut(Schema):
    id: int
    name: str
    project_name: str
    sales_offer_details: str
    nurturing_channel: str
    lead_ids: List[int]

class CampaignSummary(Schema):
    id: int
    name: str
    project_name: str
    leads_count: int
    messages_sent: int
    created_at: str

# Endpoint to create campaign and send emails (delegates to service layer)
@router.post("/", response=CampaignOut, auth=auth)
def create_campaign(request, data: CampaignIn):
    service = CampaignService()
    campaign = service.create_campaign(
        name=data.name,
        project_name=data.project_name,
        sales_offer_details=data.sales_offer_details,
        nurturing_channel=data.nurturing_channel,
        lead_ids=data.lead_ids,
    )

    # return a lightweight DTO
    lead_ids = [l.id for l in campaign.leads.all()]
    return CampaignOut(
        id=campaign.id,
        name=campaign.name,
        project_name=campaign.project_name,
        sales_offer_details=campaign.sales_offer_details,
        nurturing_channel=campaign.nurturing_channel,
        lead_ids=lead_ids,
    )

@router.get("/metrics", response=List[CampaignSummary], auth=auth)
def list_campaign_metrics(request):
    campaigns = Campaign.objects.all().prefetch_related("leads")
    results = []

    for campaign in campaigns:
        leads_count = campaign.leads.count()
        messages_sent = Message.objects.filter(conversation__campaign=campaign).count()

        results.append(
            CampaignSummary(
                id=campaign.id,
                name=campaign.name,
                project_name=campaign.project_name,
                leads_count=leads_count,
                messages_sent=messages_sent,
                created_at=campaign.created_at.isoformat(),
            )
        )

    return results