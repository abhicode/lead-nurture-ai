from typing import Iterable, List
from crm.repositories import DjangoORMLeadRepository, DjangoORMCampaignRepository, BaseLeadRepository, BaseCampaignRepository
from crm.notifications import EmailNotifier, WhatsAppNotifier, Notifier
from crm.models import Leads, Campaign
import logging

logger = logging.getLogger(__name__)


class CampaignService:
    """Service responsible for campaign creation and notification."""

    def __init__(
        self,
        lead_repo: BaseLeadRepository | None = None,
        campaign_repo: BaseCampaignRepository | None = None,
        notifier_map: dict | None = None,
    ):
        self.lead_repo = lead_repo or DjangoORMLeadRepository()
        self.campaign_repo = campaign_repo or DjangoORMCampaignRepository()
        # notifier_map is a mapping like {'email': EmailNotifier(), 'whatsapp': WhatsAppNotifier()}
        self.notifier_map = notifier_map or {
            "email": EmailNotifier(),
            "whatsapp": WhatsAppNotifier(),
        }

    def create_campaign(self, name: str, project_name: str, sales_offer_details: str, nurturing_channel: str, lead_ids: Iterable[int]) -> Campaign:
        # resolve leads
        leads = self.lead_repo.get_by_ids(lead_ids)

        # create campaign
        campaign = self.campaign_repo.create(name, project_name, sales_offer_details, nurturing_channel)
        self.campaign_repo.set_leads(campaign, leads)

        # notify leads according to channel
        channel_key = (nurturing_channel or "").lower()
        notifier: Notifier | None = self.notifier_map.get(channel_key)
        if notifier:
            # For now we use emails list; real whatsapp would use phone numbers
            emails = [l.email for l in leads if l.email]
            subject = f"{name} - {project_name}"
            notifier.notify(emails, subject, sales_offer_details)
        else:
            logger.debug("No notifier configured for channel %s", nurturing_channel)

        return campaign
