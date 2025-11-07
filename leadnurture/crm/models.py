from django.db import models


class Leads(models.Model):
    lead_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    country_code = models.CharField(max_length=10, blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    project_name = models.CharField(max_length=200, blank=True, null=True)
    unit_type = models.CharField(max_length=100, blank=True, null=True)
    min_budget = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    max_budget = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    lead_status = models.CharField(max_length=100, blank=True, null=True)
    last_conversation_date = models.DateField(blank=True, null=True)
    last_conversation_summary = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.lead_id})"


# Campaign model for storing campaign details and shortlisted leads
class Campaign(models.Model):
    name = models.CharField(max_length=200)
    project_name = models.CharField(max_length=200)
    sales_offer_details = models.TextField()
    nurturing_channel = models.CharField(max_length=50)
    leads = models.ManyToManyField(Leads, related_name="campaigns")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Conversation(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    lead = models.ForeignKey(Leads, on_delete=models.CASCADE)
    state = models.CharField(max_length=50, default="active")  # active, closed, etc.
    last_conversation_summary = models.TextField(blank=True, null=True)
    last_conversation_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    sender = models.CharField(max_length=50, choices=[("ai", "AI"), ("lead", "Lead")])
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
