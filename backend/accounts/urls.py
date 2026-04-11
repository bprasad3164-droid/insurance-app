from django.urls import path
from .views import (
    register, login_with_token,
    get_policies, add_policy, 
    create_claim, all_claims, agent_approve, admin_approve,
    create_payment, analytics, send_notification
)

urlpatterns = [
    # Auth
    path('register/', register),
    path('login/', login_with_token),
    
    # Policies
    path('policies/', get_policies),
    path('add-policy/', add_policy),
    
    # Claims & Approvals
    path('claim/', create_claim),
    path('claims/', all_claims),
    path('approve-agent/<int:id>/', agent_approve),
    path('approve-admin/<int:id>/', admin_approve),
    
    # Systems
    path('payment/', create_payment),
    path('analytics/', analytics),
    path('notify/', send_notification),
]
