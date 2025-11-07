from ninja import Router
from ninja import Schema
from crm.models import Leads, Campaign
from crm.services import CampaignService
from typing import List, Optional
from decimal import Decimal
from datetime import date
from django.contrib.auth import authenticate
from ninja.errors import HttpError
from crm.auth import JWTAuth, create_jwt_for_user
from django.contrib.auth import get_user_model


auth = JWTAuth()

router = Router(tags=["Leads"])

class LeadIn(Schema):
    lead_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    country_code: Optional[str] = None
    phone: Optional[str] = None
    project_name: Optional[str] = None
    unit_type: Optional[str] = None
    min_budget: Optional[Decimal] = None
    max_budget: Optional[Decimal] = None
    lead_status: Optional[str] = None
    last_conversation_date: Optional[date] = None
    last_conversation_summary: Optional[str] = None

class LeadOut(LeadIn):
    id: int


class TokenIn(Schema):
    username: str
    password: str


class TokenOut(Schema):
    access: str


class RegisterIn(Schema):
    username: str
    password: str
    email: Optional[str] = None


@router.post("/register", response=TokenOut)
def register(request, data: RegisterIn):
    User = get_user_model()
    if User.objects.filter(username=data.username).exists():
        raise HttpError(400, "User already exists")
    user = User.objects.create_user(username=data.username, password=data.password, email=data.email)
    token = create_jwt_for_user(user)
    return {"access": token}

@router.get("/leads", response=List[LeadOut], auth=auth)
def list_leads(request):
    return list(Leads.objects.all())

@router.get("/leads/{lead_id}", response=LeadOut, auth=auth)
def get_lead(request, lead_id: str):
    return Leads.objects.get(lead_id=lead_id)

@router.post("/leads", response=LeadOut, auth=auth)
def create_lead(request, data: LeadIn):
    lead = Leads.objects.create(**data.dict())
    return lead

@router.put("/leads/{lead_id}", response=LeadOut, auth=auth)
def update_lead(request, lead_id: str, data: LeadIn):
    lead = Leads.objects.get(lead_id=lead_id)
    for attr, value in data.dict(exclude_unset=True).items():
        setattr(lead, attr, value)
    lead.save()
    return lead

@router.delete("/leads/{lead_id}", auth=auth)
def delete_lead(request, lead_id: str):
    Leads.objects.get(lead_id=lead_id).delete()
    return {"success": True}


@router.post("/token", response=TokenOut)
def token(request, data: TokenIn):
    user = authenticate(username=data.username, password=data.password)
    if not user:
        raise HttpError(401, "Invalid credentials")
    token = create_jwt_for_user(user)
    return {"access": token}
