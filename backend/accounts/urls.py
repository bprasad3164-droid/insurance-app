from django.urls import path
from .views import admin_login, user_login, agent_login

urlpatterns = [
    path('admin/login/', admin_login),
    path('user/login/', user_login),
    path('agent/login/', agent_login),
]
