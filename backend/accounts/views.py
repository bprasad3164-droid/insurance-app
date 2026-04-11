from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Claim, Policy, Document, UserPolicy
from .serializers import PolicySerializer, UserPolicySerializer
from django.core.mail import send_mail
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
import razorpay
import io
import uuid

# ================= AUTH =================

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        user = User.objects.create_user(
            username=request.data['email'],
            email=request.data['email'],
            password=request.data['password'],
            role=request.data.get('role', 'user')
        )
        return Response({"msg": "Registration Successful"})
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
            "refresh": str(refresh),
            "role": user.role,
            "kyc_status": user.kyc_status,
            "msg": "Login Success"
        })
    return Response({"msg": "Invalid Credentials"}, status=401)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_kyc(request):
    user = request.user
    file = request.FILES.get('file')
    if file:
        Document.objects.create(user=user, file=file)
        user.kyc_status = 'Pending'
        user.save()
        return Response({"msg": "KYC Documents Uploaded for Review"})
    return Response({"msg": "No file provided"}, status=400)

# ================= POLICY ENGINE =================

@api_view(['GET'])
@permission_classes([AllowAny])
def get_policies(request):
    category = request.query_params.get('category')
    policies = Policy.objects.all()
    if category:
        policies = policies.filter(category=category)
    serializer = PolicySerializer(policies, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def add_policy(request):
    Policy.objects.create(
        name=request.data.get('name'),
        description=request.data.get('description'),
        premium=request.data.get('premium'),
        category=request.data.get('category', 'health')
    )
    return Response({"msg": "Policy Added"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_policy(request):
    policy_id = request.data.get('policy_id')
    try:
        policy = Policy.objects.get(id=policy_id)
    except Policy.DoesNotExist:
        return Response({"msg": "Policy not found"}, status=404)
    cert_id = f"CERT-{uuid.uuid4().hex[:8].upper()}"
    UserPolicy.objects.create(
        user=request.user,
        policy=policy,
        certificate_id=cert_id
    )
    return Response({"msg": "Purchase Successful", "certificate_id": cert_id})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_policies(request):
    policies = UserPolicy.objects.filter(user=request.user)
    serializer = UserPolicySerializer(policies, many=True)
    return Response(serializer.data)

# ================= CERTIFICATE (PDF) =================

@api_view(['GET'])
@permission_classes([AllowAny])
def download_certificate(request, cert_id):
    try:
        user_policy = UserPolicy.objects.get(certificate_id=cert_id)
        template = get_template('certificate_template.html')
        context = {
            'user': user_policy.user,
            'policy': user_policy.policy,
            'cert_id': cert_id,
            'date': user_policy.purchase_date
        }
        html = template.render(context)
        result = io.BytesIO()
        pdf = pisa.pisaDocument(io.BytesIO(html.encode("UTF-8")), result)
        if not pdf.err:
            response = HttpResponse(result.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="certificate_{cert_id}.pdf"'
            return response
        return Response({"msg": "PDF generation error"}, status=500)
    except UserPolicy.DoesNotExist:
        return Response({"msg": "Certificate not found"}, status=404)

# ================= CLAIMS =================

@api_view(['POST'])
@permission_classes([AllowAny])
def create_claim(request):
    try:
        Claim.objects.create(
            user_id=request.data.get('user', 1),
            policy_id=request.data['policy']
        )
        return Response({"msg": "Claim Submitted"})
    except Exception as e:
        return Response({"msg": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def all_claims(request):
    return Response(list(Claim.objects.all().values()))

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
            send_mail(
                "Claim Approved",
                f"Your claim #{id} has been fully approved and is being processed.",
                "admin@proinsurance.com",
                [claim.user.email]
            )
            return Response({"msg": "Admin Approved and Email Sent"})
        return Response({"msg": "Agent approval required first"}, status=400)
    except Claim.DoesNotExist:
        return Response({"msg": "Claim not found"}, status=404)

# ================= PAYMENTS =================

@api_view(['POST'])
@permission_classes([AllowAny])
def create_payment(request):
    try:
        client = razorpay.Client(auth=("rzp_test_KEY", "rzp_test_SECRET"))
        payment = client.order.create({
            "amount": int(request.data.get('amount', 5000)) * 100,
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
    return Response({
        "total_claims": Claim.objects.count(),
        "approved": Claim.objects.filter(status='Approved').count(),
        "pending": Claim.objects.filter(status='Pending').count()
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
    return Response({"msg": "Notification sent (check console)"})
