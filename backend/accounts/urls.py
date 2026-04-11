from django.urls import path
from .views import (
    admin_login, user_login, agent_login, register, login_with_token,
    get_policies, add_policy, create_claim, all_claims
)

urlpatterns = [
    path('register/', register),
    path('login/', login_with_token),
    path('admin/login/', admin_login),
    path('user/login/', user_login),
    path('agent/login/', agent_login),
    # Policy routes
    path('policies/', get_policies),
    path('add-policy/', add_policy),
    # Claim routes
    path('claim/', create_claim),
    path('claims/', all_claims),
]
