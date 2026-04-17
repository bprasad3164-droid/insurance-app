from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register),
    path('login/', views.login_with_token),
    path('kyc-update/', views.update_kyc),
    path('kyc-pending/', views.get_pending_kyc),
    path('kyc-verify/<int:id>/', views.verify_kyc),
    path('agents/', views.get_agents),
    
    path('policies/', views.get_policies),
    path('add-policy/', views.add_policy),
    path('calculate/', views.calculate_premium),
    path('buy-policy/', views.buy_policy),
    path('portfolio-stats/', views.get_portfolio_stats),
    path('my-policies/', views.get_user_policies),
    path('download-cert/<str:cert_id>/', views.download_certificate),
    
    path('claim/', views.create_claim),
    path('claim/my/', views.my_claims),
    path('claims/', views.all_claims),
    path('approve-agent/<int:id>/', views.agent_approve),
    path('approve-admin/<int:id>/', views.admin_approve),
    path('payment/', views.create_payment),
    path('payment/verify/', views.verify_payment),
    path('analytics/', views.analytics),
    path('notify/', views.send_notification),
    
    # Workflow Paths
    path('appointments/create/', views.create_appointment),
    path('appointments/my/', views.my_appointments),
    path('renewals/create/', views.create_renewal),
    path('tasks/open/', views.get_open_tasks),
    path('tasks/assign/', views.assign_task),
    path('tasks/complete-survey/', views.complete_survey),

    # New Payment & Invoice paths
    path('make-payment/', views.make_payment),
    path('payment-detail/<int:id>/', views.get_payment_detail),
    path('invoice/create/', views.generate_invoice),
    path('invoice/download/<int:id>/', views.download_invoice),

    # Claim Reporting & Details
    path('claim-detail/<int:id>/', views.get_claim_detail),
    path('claim/report/<int:id>/', views.download_claim_report),
    path('claim/upload-evidence/<int:id>/', views.upload_document),
    path('activities/', views.get_activities),
]
