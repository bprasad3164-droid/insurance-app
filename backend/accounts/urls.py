from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register),
    path('login/', views.login_with_token),
    path('kyc-update/', views.update_kyc),
    
    path('policies/', views.get_policies),
    path('calculate/', views.calculate_premium),
    path('buy-policy/', views.buy_policy),
    path('my-policies/', views.get_user_policies),
    path('download-cert/<str:cert_id>/', views.download_certificate),
    
    path('claim/', views.create_claim),
    path('claim/my/', views.my_claims),
    path('claims/', views.all_claims),
    path('approve-agent/<int:id>/', views.agent_approve),
    path('approve-admin/<int:id>/', views.admin_approve),
    path('payment/', views.create_payment),
    path('analytics/', views.analytics),
    path('notify/', views.send_notification),
]
