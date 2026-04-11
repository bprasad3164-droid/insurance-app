from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        user = User.objects.create_user(
            username=request.data['email'],
            email=request.data['email'],
            password=request.data['password'],
            role=request.data['role']
        )
        return Response({"msg": "User Created"})
    except Exception as e:
        return Response({"msg": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_with_token(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(username=email, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "role": user.role,
            "msg": "Login Success"
        })
    return Response({"msg": "Invalid Credentials"}, status=401)

# Keep the role-specific ones for backward compatibility if needed, 
# but the unified one is preferred now.
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

# ================= POLICY MODULE =================

@api_view(['GET'])
@permission_classes([AllowAny])
def get_policies(request):
    from .models import Policy
    policies = Policy.objects.all().values()
    return Response(policies)

@api_view(['POST'])
@permission_classes([AllowAny]) # In production, restrict to admin
def add_policy(request):
    from .models import Policy
    Policy.objects.create(**request.data)
    return Response({"msg": "Policy Added"})

# ================= CLAIM SYSTEM =================

@api_view(['POST'])
@permission_classes([AllowAny]) # In production, restrict to authenticated user
def create_claim(request):
    from .models import Claim
    Claim.objects.create(user_id=request.data['user'], policy_id=request.data['policy'])
    return Response({"msg": "Claim Submitted"})

@api_view(['GET'])
@permission_classes([AllowAny]) # In production, restrict to admin
def all_claims(request):
    from .models import Claim
    return Response(Claim.objects.all().values())
