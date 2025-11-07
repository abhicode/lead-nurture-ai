"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI
from crm.api.leads import router as crm_router
from crm.api.ai import router as ai_router
from crm.api.ingestion import router as ingestion_router
from crm.api.campaigns import router as campaigns_router
from crm.api.conversations import router as conversations_router

api = NinjaAPI(title="Lead Nurturing API")
api.add_router("/crm/", crm_router)
api.add_router("/ai/", ai_router)
api.add_router("/documents/", ingestion_router)
api.add_router("/campaigns/", campaigns_router)
api.add_router("/conversations/", conversations_router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
]
