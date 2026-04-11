from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Claim, Policy, Document
from django.core.mail import send_mail
import razorpay

# Unified Login & Registration
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

# ================= POLICY MODULE =================

@api_view(['GET'])
@permission_classes([AllowAny])
def get_policies(request):
    policies = Policy.objects.all().values()
    return Response(policies)

@api_view(['POST'])
@permission_classes([AllowAny])
def add_policy(request):
    Policy.objects.create(**request.data)
    return Response({"msg": "Policy Added"})

# ================= CLAIM SYSTEM & WORKFLOW =================

@api_view(['POST'])
@permission_classes([AllowAny])
def create_claim(request):
    Claim.objects.create(user_id=request.data['user'], policy_id=request.data['policy'])
    return Response({"msg": "Claim Submitted"})

@api_view(['GET'])
@permission_classes([AllowAny])
def all_claims(request):
    return Response(Claim.objects.all().values())

@api_view(['POST'])
@permission_classes([AllowAny])
def agent_approve(request, id):
    try:
        claim = Claim.objects.get(id=id)
        claim.agent_status = 'Approved'
        claim.save()
        return Response({"msg": "Agent Approved"})
    except Claim.DoesNotExist:
        return Response({"msg": "Claim not found"}, status=404)

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_approve(request, id):
    try:
        claim = Claim.objects.get(id=id)
        if claim.agent_status == 'Approved':
            claim.status = 'Approved'
            claim.save()
            # Notify user
            send_mail("Claim Update", f"Your claim #{id} has been fully approved.", "admin@proinsurance.com", [claim.user.email])
            return Response({"msg": "Admin Approved and Email Sent"})
        return Response({"msg": "Agent approval required first"}, status=400)
    except Claim.DoesNotExist:
        return Response({"msg": "Claim not found"}, status=404)

# ================= PAYMENTS (RAZORPAY) =================

@api_view(['POST'])
@permission_classes([AllowAny])
def create_payment(request):
    # Dummy keys for simulation
    try:
        client = razorpay.Client(auth=("rzp_test_KEY", "rzp_test_SECRET"))
        payment = client.order.create({
            "amount": int(request.data.get('amount', 5000)) * 100, # Amount in paise
            "currency": "INR",
            "payment_capture": 1
        })
        return Response(payment)
    except Exception as e:
        return Response({"msg": str(e)}, status=500)

# ================= ANALYTICS =================

@api_view(['GET'])
@permission_classes([AllowAny])
def analytics(request):
    total = Claim.objects.count()
    approved = Claim.objects.filter(status='Approved').count()
    pending = Claim.objects.filter(status='Pending').count()
    return Response({
        "total_claims": total,
        "approved": approved,
        "pending": pending
    })

# ================= NOTIFICATIONS =================

@api_view(['POST'])
@permission_classes([AllowAny])
def send_notification(request):
    send_mail(
        request.data.get('subject', "Policy Update"),
        request.data.get('message', "Check your dashboard for updates."),
        "admin@proinsurance.com",
        [request.data.get('email', "user@test.com")]
    )
    return Response({"msg": "Notification processing in console"})
