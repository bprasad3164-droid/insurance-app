from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Claim, Policy, Document, UserPolicy
from .serializers import PolicySerializer, UserPolicySerializer, ClaimSerializer
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
    aadhaar = request.FILES.get('aadhaar')
    pan = request.FILES.get('pan')
    selfie = request.FILES.get('selfie')
    
    if aadhaar and pan and selfie:
        from .models import KYC
        kyc, created = KYC.objects.get_or_create(user=user)
        kyc.aadhaar_file = aadhaar
        kyc.pan_file = pan
        kyc.selfie_file = selfie
        kyc.status = 'Pending'
        kyc.save()

        user.kyc_status = 'Pending'
        user.save()
    return Response({"msg": "All three documents (Aadhaar, PAN, Selfie) are required"}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_kyc(request):
    if request.user.role != 'admin':
        return Response({"msg": "Unauthorized"}, status=403)
    from .models import KYC
    kycs = KYC.objects.filter(status='Pending')
    data = []
    for k in kycs:
        data.append({
            "id": k.id,
            "user_id": k.user.id,
            "username": k.user.username,
            "email": k.user.email,
            "aadhaar": k.aadhaar_file.url if k.aadhaar_file else None,
            "pan": k.pan_file.url if k.pan_file else None,
            "selfie": k.selfie_file.url if k.selfie_file else None,
            "submitted_at": k.submitted_at
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_kyc(request, id):
    if request.user.role != 'admin':
        return Response({"msg": "Unauthorized"}, status=403)
    from .models import KYC
    try:
        kyc = KYC.objects.get(id=id)
        status = request.data.get('status', 'Verified')
        kyc.status = status
        kyc.save()
        
        kyc.user.kyc_status = status
        kyc.user.save()
        return Response({"msg": f"KYC {status}"})
    except KYC.DoesNotExist:
        return Response({"msg": "KYC not found"}, status=404)

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
        base_premium=request.data.get('premium'),
        coverage=request.data.get('coverage', 0),
        category=request.data.get('category', 'health')
    )
    return Response({"msg": "Policy Added"})

@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_premium(request):
    try:
        age = int(request.data['age'])
        salary = int(request.data['salary'])
        policy_id = request.data['policy_id']

        policy = Policy.objects.get(id=policy_id)

        risk_factor = 1.2 if age > 40 else 1.0
        premium = policy.base_premium * risk_factor + (salary * 0.01)

        return Response({
            "premium": premium,
            "policy_name": policy.name
        })
    except Exception as e:
        return Response({"msg": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_policy(request):
    policy_id = request.data.get('policy_id')
    premium = request.data.get('premium', 0)
    try:
        policy = Policy.objects.get(id=policy_id)
    except Policy.DoesNotExist:
        return Response({"msg": "Policy not found"}, status=404)
    cert_id = f"CERT-{uuid.uuid4().hex[:8].upper()}"
    UserPolicy.objects.create(
        user=request.user,
        policy=policy,
        premium=premium,
        certificate_id=cert_id,
        status='Active'
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
@permission_classes([IsAuthenticated])
def create_claim(request):
    try:
        claim = Claim.objects.create(
            user=request.user,
            policy_id=request.data['policy'],
            amount=request.data.get('amount', 0)
        )
        return Response({"msg": "Claim Submitted", "claim_id": claim.id})
    except Exception as e:
        return Response({"msg": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_claims(request):
    claims = Claim.objects.filter(user=request.user)
    serializer = ClaimSerializer(claims, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def all_claims(request):
    return Response(list(Claim.objects.all().values()))

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def agent_approve(request, id):
    if request.user.role != 'agent':
        return Response({"msg": "Unauthorized"}, status=403)
    try:
        claim = Claim.objects.get(id=id)
        status = request.data.get('status', 'Approved')
        claim.agent_status = status
        claim.save()
        return Response({"msg": f"Agent {status}"})
    except Claim.DoesNotExist:
        return Response({"msg": "Claim not found"}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_approve(request, id):
    if request.user.role != 'admin':
        return Response({"msg": "Unauthorized"}, status=403)
    try:
        claim = Claim.objects.get(id=id)
        if claim.agent_status != 'Approved':
            return Response({"msg": "Agent approval required first"}, status=400)
        
        status = request.data.get('status', 'Approved')
        claim.status = status
        claim.save()
        
        if status == 'Approved':
            send_mail(
                "Claim Approved",
                f"Your claim #{id} for policy {claim.policy.name} has been fully approved.",
                "admin@proinsurance.com",
                [claim.user.email]
            )
        
        return Response({"msg": f"Admin {status} and Notification Processed"})
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
@permission_classes([IsAuthenticated])
def analytics(request):
    if request.user.role != 'admin':
        return Response({"msg": "Unauthorized"}, status=403)
        
    total_users = User.objects.count()
    total_policies = UserPolicy.objects.count()
    total_claims = Claim.objects.count()
    approved_claims = Claim.objects.filter(status='Approved').count()

    return Response({
        "users": total_users,
        "policies": total_policies,
        "claims": total_claims,
        "approved": approved_claims
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
