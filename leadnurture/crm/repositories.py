from abc import ABC, abstractmethod
from typing import Iterable, List

from crm.models import Leads, Campaign


class BaseLeadRepository(ABC):
    @abstractmethod
    def get_by_ids(self, ids: Iterable[int]) -> List[Leads]:
        pass


class BaseCampaignRepository(ABC):
    @abstractmethod
    def create(self, name: str, project_name: str, sales_offer_details: str, nurturing_channel: str) -> Campaign:
        pass

    @abstractmethod
    def set_leads(self, campaign: Campaign, leads: Iterable[Leads]) -> None:
        pass


class DjangoORMLeadRepository(BaseLeadRepository):
    def get_by_ids(self, ids: Iterable[int]) -> List[Leads]:
        return list(Leads.objects.filter(id__in=ids))


class DjangoORMCampaignRepository(BaseCampaignRepository):
    def create(self, name: str, project_name: str, sales_offer_details: str, nurturing_channel: str) -> Campaign:
        campaign = Campaign.objects.create(
            name=name,
            project_name=project_name,
            sales_offer_details=sales_offer_details,
            nurturing_channel=nurturing_channel,
        )
        return campaign

    def set_leads(self, campaign: Campaign, leads: Iterable[Leads]) -> None:
        campaign.leads.set(leads)
        campaign.save()
