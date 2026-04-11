from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import User

@api_view(['POST'])
def admin_login(request):
    user = authenticate(username=request.data.get('email'), password=request.data.get('password'))
    if user and user.role == 'admin':
        return Response({"msg": "Admin Login Success"})
    return Response({"msg": "Invalid Admin Credentials"}, status=400)

@api_view(['POST'])
def user_login(request):
    user = authenticate(username=request.data.get('email'), password=request.data.get('password'))
    if user and user.role == 'user':
        return Response({"msg": "User Login Success"})
    return Response({"msg": "Invalid User Credentials"}, status=400)

@api_view(['POST'])
def agent_login(request):
    user = authenticate(username=request.data.get('email'), password=request.data.get('password'))
    if user and user.role == 'agent':
        return Response({"msg": "Agent Login Success"})
    return Response({"msg": "Invalid Agent Credentials"}, status=400)
