from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Claim, Policy, Document, UserPolicy, Appointment, RenewalRequest, Payment, Invoice, KYC, Activity
from .serializers import PolicySerializer, UserPolicySerializer, ClaimSerializer, ActivitySerializer
from django.core.mail import send_mail
from django.template.loader import get_template
from django.utils import timezone
from datetime import timedelta
from django.db import transaction, models
from django.db.models import Sum
from xhtml2pdf import pisa
import os
import razorpay
import io
from django.core.mail import send_mail
from twilio.rest import Client
import uuid
from django.http import HttpResponse, FileResponse
from reportlab.pdfgen import canvas
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_agents(request):
    if request.user.role != 'admin':
        return Response({"msg": "Unauthorized"}, status=403)
    agents = User.objects.filter(role='agent')
    return Response(list(agents.values('id', 'username')))

# ================= AUTH =================

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        if not email or not password:
            return Response({"msg": "Email and password are required"}, status=400)
            
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
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
        kyc, created = KYC.objects.get_or_create(user=user)
        kyc.aadhaar_file = aadhaar
        kyc.pan_file = pan
        kyc.selfie_file = selfie
        kyc.status = 'Pending'
        kyc.save()

        user.kyc_status = 'Pending'
        user.save()
        return Response({"msg": "KYC Documents Uploaded for Review"})
    return Response({"msg": "All three documents (Aadhaar, PAN, Selfie) are required"}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_kyc(request):
    if request.user.role != 'admin':
        return Response({"msg": "Unauthorized"}, status=403)
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
@permission_classes([IsAuthenticated])
def add_policy(request):
    if request.user.role != 'admin':
        return Response({"msg": "Unauthorized"}, status=403)
        
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
        # Harden inputs
        age_val = request.data.get('age')
        salary_val = request.data.get('salary')
        policy_id = request.data.get('policy_id')

        if not all([age_val, salary_val, policy_id]):
            return Response({"msg": "Missing age, salary, or policy_id"}, status=400)

        try:
            age = int(float(age_val))
            salary = int(float(salary_val))
        except (ValueError, TypeError):
            return Response({"msg": "Invalid age or salary values (must be numbers)"}, status=400)

        policy = Policy.objects.get(id=policy_id)

        # Algorithm
        risk_factor = 1.2 if age > 40 else 1.0
        premium = (policy.base_premium * risk_factor) + (salary * 0.01)

        return Response({
            "premium": round(premium, 2),
            "policy_name": policy.name
        })
    except Policy.DoesNotExist:
        return Response({"msg": "Selected policy does not exist"}, status=404)
    except Exception as e:
        return Response({"msg": "System calculation error", "details": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_policy(request):
    # CRITICAL: Enforce KYC Check
    if request.user.kyc_status != 'Verified':
        return Response({
            "msg": "KYC Verification Required", 
            "details": "Please complete your KYC profile before purchasing insurance."
        }, status=403)

    policy_id = request.data.get('policy_id')
    premium = request.data.get('premium', 0)
    
    try:
        with transaction.atomic():
            policy = Policy.objects.get(id=policy_id)
            cert_id = f"CERT-{uuid.uuid4().hex[:8].upper()}"
            expiry = timezone.now() + timedelta(days=365)
            
            UserPolicy.objects.create(
                user=request.user,
                policy=policy,
                premium=float(premium),
                certificate_id=cert_id,
                expiry_date=expiry,
                status='Active'
            )
            log_activity(request.user, 'POLICY', f"Purchased {policy.name}. Protection active until {expiry.year}.")
            return Response({"msg": "Purchase Successful", "certificate_id": cert_id, "expiry_date": expiry})
    except Policy.DoesNotExist:
        return Response({"error": "Selected policy no longer available"}, status=404)
    except Exception as e:
        return Response({"error": "Transaction aborted", "details": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_portfolio_stats(request):
    # Calculate Total Premium Invested
    total = UserPolicy.objects.filter(user=request.user).aggregate(Sum('premium'))['premium__sum'] or 0
    
    # Find Next Renewal Date (Nearest Expiry)
    next_renewal = UserPolicy.objects.filter(
        user=request.user, 
        status='Active', 
        expiry_date__gt=timezone.now()
    ).order_by('expiry_date').first()
    
    return Response({
        "total_premium": total,
        "next_renewal": next_renewal.expiry_date if next_renewal else None
    })

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
        try:
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
            return Response({"msg": "PDF generation aborted - Internal rendering conflict"}, status=500)
        except Exception as e:
            return Response({"msg": "Template rendering failed", "details": str(e)}, status=500)
    except UserPolicy.DoesNotExist:
        return Response({"msg": "Certificate ID not found in registry"}, status=404)
    except Exception as e:
        return Response({"msg": "System error", "details": str(e)}, status=500)

# ================= WORKFLOW: STEP 1 (BOOKING) =================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_appointment(request):
    try:
        preferred_date = request.data.get('preferred_date')
        if not preferred_date:
            return Response({"msg": "Preferred date is required"}, status=400)
            
        appt = Appointment.objects.create(
            client=request.user,
            preferred_date=preferred_date,
            category=request.data.get('category', 'health'),
            notes=request.data.get('notes', '')
        )
        return Response({"msg": "Booking Request Submitted", "id": appt.id})
    except Exception as e:
        return Response({"msg": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_appointments(request):
    if request.user.role == 'agent':
        appts = Appointment.objects.filter(agent=request.user)
    else:
        appts = Appointment.objects.filter(client=request.user)
    return Response(list(appts.values()))

# ================= WORKFLOW: STEP 3 (RENEWAL) =================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_renewal(request):
    try:
        policy_id = request.data.get('policy_id')
        if not policy_id:
            return Response({"msg": "Policy ID is required"}, status=400)
            
        user_policy = UserPolicy.objects.get(id=policy_id, user=request.user)
        renewal = RenewalRequest.objects.create(user_policy=user_policy)
        return Response({"msg": "Renewal Request Submitted", "id": renewal.id})
    except UserPolicy.DoesNotExist:
        return Response({"msg": "Policy not found"}, status=404)
    except Exception as e:
        return Response({"msg": str(e)}, status=400)

# ================= WORKFLOW: ADMIN & AGENT LOGIC =================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_open_tasks(request):
    """Admin view to see everything needing assignment or final oversight."""
    if request.user.role != 'admin':
        return Response({"msg": "Unauthorized"}, status=403)
    
    # Needs Assignment
    pending_appts = Appointment.objects.filter(status='Pending')
    pending_claims = Claim.objects.filter(status='Pending')
    
    # Needs Final Administrative Action (Executive Oversight)
    # 1. Claims verified by Agent
    executive_claims = Claim.objects.filter(status='Assigned', agent_status='Approved')
    # 2. Surveys completed by Agent
    executive_appts = Appointment.objects.filter(status='Surveyed')
    
    return Response({
        "appointments": list(pending_appts.values('id', 'client__username', 'category', 'preferred_date')),
        "claims": list(pending_claims.values('id', 'user__username', 'amount')),
        "executive_queue": [
            *[{"id": c.id, "type": "Claim", "client": c.user.username, "policy": c.policy.id, "amount": c.amount, "agent_status": c.agent_status, "status": c.status} for c in executive_claims],
            *[{"id": a.id, "type": "Survey", "client": a.client.username, "policy": "N/A", "amount": 0, "agent_status": "Verified", "status": a.status} for a in executive_appts]
        ]
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_task(request):
    if request.user.role != 'admin':
        return Response({"msg": "Unauthorized"}, status=403)
    
    task_type = request.data.get('type') # 'appointment', 'claim', 'renewal'
    task_id = request.data.get('id')
    agent_id = request.data.get('agent_id')
    
    try:
        agent = User.objects.get(id=agent_id, role='agent')
        if task_type == 'appointment':
            obj = Appointment.objects.get(id=task_id)
            obj.status = 'Assigned'
        elif task_type == 'claim':
            obj = Claim.objects.get(id=task_id)
            obj.status = 'Assigned'
        elif task_type == 'renewal':
            obj = RenewalRequest.objects.get(id=task_id)
            obj.status = 'Assigned'
        else:
            return Response({"msg": "Invalid task type"}, status=400)
            
        obj.agent = agent
        obj.save()
        return Response({"msg": f"Task assigned to {agent.username}"})
    except Exception as e:
        return Response({"msg": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_survey(request):
    """Agent marks a survey as completed."""
    if request.user.role != 'agent':
        return Response({"msg": "Unauthorized"}, status=403)
    
    appt_id = request.data.get('id')
    notes = request.data.get('notes', '')
    
    try:
        appt = Appointment.objects.get(id=appt_id, agent=request.user)
        appt.status = 'Surveyed'
        appt.notes = notes
        appt.save()
        return Response({"msg": "Survey details uploaded. Awaiting final Admin review."})
    except Appointment.DoesNotExist:
        return Response({"msg": "Mission not found or unauthorized"}, status=404)

# ================= CLAIMS =================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_claim(request):
    try:
        # Resolve policy accurately
        policy_id = request.data.get('policy')
        policy = Policy.objects.get(id=policy_id)
        
        email = request.data.get('email')
        phone = request.data.get('phone')
        amount = request.data.get('amount', 0)
        
        claim = Claim.objects.create(
            user=request.user,
            policy=policy,
            claim_type=request.data.get('claim_type', 'Accident'),
            amount=amount,
            email=email,
            phone=phone
        )
        
        log_activity(request.user, 'CLAIM', f"Submitted a {claim.claim_type} claim for ₹{claim.amount}.")
        
        # Trigger Notifications
        send_claim_notifications(claim)
        
        return Response({"msg": "Claim Submitted", "claim_id": claim.id})
    except Exception as e:
        return Response({"msg": str(e)}, status=400)

def send_claim_notifications(claim):
    """Sends Email and WhatsApp notifications for a new claim."""
    # 1. Email Notification
    if claim.email:
        try:
            subject = f"Claim Submitted Successfully: #{claim.id}"
            message = f"Hello {claim.user.username},\n\nYour insurance claim #{claim.id} for the amount of ₹{claim.amount} has been successfully submitted and is under review.\n\nThank you for choosing Pro Insurance."
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [claim.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Email failed: {e}")

    # 2. WhatsApp Notification (Twilio)
    if claim.phone:
        try:
            account_sid = settings.TWILIO_ACCOUNT_SID
            auth_token = settings.TWILIO_AUTH_TOKEN
            client = Client(account_sid, auth_token)

            message_body = f"Hello! Your claim #{claim.id} for ₹{claim.amount} was submitted successfully to Pro Insurance. We are processing it now."
            
            # Ensure phone is in E.164 format for WhatsApp integration
            to_phone = claim.phone if claim.phone.startswith('+') else f"+91{claim.phone}"
            
            client.messages.create(
                body=message_body,
                from_=settings.TWILIO_WHATSAPP_NUMBER,
                to=f"whatsapp:{to_phone}"
            )
        except Exception as e:
            print(f"WhatsApp failed: {e}")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_claims(request):
    claims = Claim.objects.filter(user=request.user)
    serializer = ClaimSerializer(claims, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_claims(request):
    if request.user.role == 'admin':
        claims = Claim.objects.all()
    elif request.user.role == 'agent':
        claims = Claim.objects.filter(agent=request.user)
    else:
        return Response({"msg": "Unauthorized"}, status=403)
    
    serializer = ClaimSerializer(claims, many=True)
    return Response(serializer.data)


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
        with transaction.atomic():
            claim = Claim.objects.get(id=id)
            if claim.agent_status != 'Approved':
                return Response({"error": "Agent approval required first"}, status=400)
            
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
        return Response({"error": "Claim not found"}, status=404)
    except Exception as e:
        return Response({"error": "Administrative update failed", "details": str(e)}, status=500)

# ================= PAYMENTS =================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    try:
        policy_id = request.data.get('policy_id')
        amount = request.data.get('amount')
        if not policy_id or not amount:
            return Response({"error": "Policy ID and amount required"}, status=400)

        key_id = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_5uO7eYq2rX6M7z') # Use test keys
        key_secret = os.environ.get('RAZORPAY_KEY_SECRET', 'XyZ789abcDEF01234567890')
        client = razorpay.Client(auth=(key_id, key_secret))
        
        # Create Razorpay Order
        razorpay_order = client.order.create({
            "amount": int(float(amount)) * 100,
            "currency": "INR",
            "payment_capture": 1
        })
        
        # Create initial pending payment record
        Payment.objects.create(
            user=request.user,
            policy_id=policy_id,
            amount=float(amount),
            method='RAZORPAY',
            status='Pending',
            razorpay_order_id=razorpay_order['id']
        )
        
        return Response({
            "order_id": razorpay_order['id'],
            "amount": razorpay_order['amount'],
            "currency": razorpay_order['currency'],
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    try:
        data = request.data
        order_id = data.get('order_id')
        payment_id = data.get('payment_id')
        signature = data.get('signature')

        key_id = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_5uO7eYq2rX6M7z')
        key_secret = os.environ.get('RAZORPAY_KEY_SECRET', 'XyZ789abcDEF01234567890')
        client = razorpay.Client(auth=(key_id, key_secret))

        # Verify Signature
        params_dict = {
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        }
        
        client.utility.verify_payment_signature(params_dict)

        # Update Payment Record
        with transaction.atomic():
            payment = Payment.objects.get(razorpay_order_id=order_id)
            payment.razorpay_payment_id = payment_id
            payment.razorpay_signature = signature
            payment.status = 'success'
            payment.save()

            # Now Buy/Activate the policy
            policy = Policy.objects.get(id=payment.policy_id)
            cert_id = f"CERT-{uuid.uuid4().hex[:8].upper()}"
            expiry = timezone.now() + timedelta(days=365)
            
            UserPolicy.objects.create(
                user=payment.user,
                policy=policy,
                premium=payment.amount,
                certificate_id=cert_id,
                expiry_date=expiry,
                status='Active'
            )
            
            log_activity(payment.user, 'PAYMENT', f"Verified payment of ₹{payment.amount}. Policy {policy.name} active.")
            
        return Response({"status": "success", "msg": "Payment verified and policy activated"})
    except razorpay.errors.SignatureVerificationError:
        return Response({"status": "failed", "error": "Invalid payment signature"}, status=400)
    except Exception as e:
        return Response({"status": "error", "details": str(e)}, status=500)

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

# ================= PAYMENTS & INVOICES =================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def make_payment(request):
    try:
        with transaction.atomic():
            policy_id = request.data.get('policy_id')
            amount = request.data.get('amount')
            method = request.data.get('method')
            
            if not all([policy_id, amount, method]):
                return Response({"error": "Missing mandatory payment fields"}, status=400)

            # Mask card if method is card
            card_num = request.data.get('card_number')
            masked_card = None
            if method == 'CARD' and card_num:
                masked_card = f"**** **** **** {str(card_num)[-4:]}"

            payment = Payment.objects.create(
                user=request.user,
                policy_id=policy_id,
                amount=float(amount),
                method=method,
                vpa=request.data.get('vpa'),
                card_number_masked=masked_card,
                bank_name=request.data.get('bank_name'),
                status='success'
            )
            log_activity(request.user, 'PAYMENT', f"Successful payment of ₹{amount} via {method}.")
            return Response({
                "payment_id": payment.id,
                "status": "success"
            })
    except Exception as e:
        return Response({"error": "Payment processing failure", "details": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_invoice(request):
    try:
        payment_id = request.data.get('payment_id')
        if str(payment_id).startswith('pay_'):
            payment = Payment.objects.filter(razorpay_payment_id=payment_id).first()
        else:
            payment = Payment.objects.filter(id=payment_id).first()

        if not payment:
            return Response({"error": "Payment not found"}, status=404)

        invoice = Invoice.objects.create(
            payment=payment,
            invoice_number=f"INV{payment.id}-{uuid.uuid4().hex[:4].upper()}"
        )

        return Response({
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number
        })
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_detail(request, id):
    try:
        if str(id).startswith('pay_'):
            payment = Payment.objects.get(razorpay_payment_id=id)
        else:
            payment = Payment.objects.get(id=id)
        return Response({
            "id": payment.id,
            "amount": payment.amount,
            "method": payment.method,
            "vpa": payment.vpa,
            "card_number_masked": payment.card_number_masked,
            "bank_name": payment.bank_name,
            "status": payment.status,
            "timestamp": payment.timestamp
        })
    except Payment.DoesNotExist:
        return Response({"error": "Payment not found"}, status=404)



@api_view(['GET'])
@permission_classes([AllowAny]) # Allow download via window.open
def download_invoice(request, id):
    try:
        invoice = Invoice.objects.get(id=id)

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer)

        # Simple high-aesthetic PDF generation
        p.setFont("Helvetica-Bold", 20)
        p.drawString(100, 800, "PRO INSURANCE - INVOICE")
        
        p.setFont("Helvetica", 12)
        p.line(100, 780, 500, 780)
        
        p.drawString(100, 750, f"Invoice Number: {invoice.invoice_number}")
        p.drawString(100, 730, f"Date: {invoice.created_at.strftime('%Y-%m-%d %H:%M')}")
        p.drawString(100, 710, f"Customer: {invoice.payment.user.username}")
        
        # Method Details
        method_str = f"Payment Method: {invoice.payment.method}"
        if invoice.payment.method == 'CARD' and invoice.payment.card_number_masked:
            method_str += f" ({invoice.payment.card_number_masked})"
        elif invoice.payment.method == 'UPI' and invoice.payment.vpa:
            method_str += f" ({invoice.payment.vpa})"
        elif invoice.payment.method == 'NETBANKING' and invoice.payment.bank_name:
            method_str += f" ({invoice.payment.bank_name})"
            
        p.drawString(100, 690, method_str)
        
        p.line(100, 670, 500, 670)
        
        p.setFont("Helvetica-Bold", 14)
        p.drawString(100, 640, "Description")
        p.drawString(400, 640, "Amount")
        
        p.setFont("Helvetica", 12)
        p.drawString(100, 620, f"Policy Premium Payment (#{invoice.payment.policy_id})")
        p.drawString(400, 620, f"INR {invoice.payment.amount}")
        
        p.line(100, 600, 500, 600)
        
        p.setFont("Helvetica-Bold", 16)
        p.drawString(100, 570, "TOTAL PAID")
        p.drawString(400, 570, f"INR {invoice.payment.amount}")
        
        p.setFont("Helvetica-Oblique", 10)
        p.drawString(100, 530, "Thank you for choosing Pro Insurance. For support, visit proinsurance.com")

        p.showPage()
        p.save()

        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f"invoice_{invoice.invoice_number}.pdf")

    except Exception as e:
        return Response({"error": str(e)}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_claim_detail(request, id):
    try:
        claim = Claim.objects.get(id=id)
        # Authorization: Admin/Agent can see all; Users only see their own
        if request.user.role == 'user' and claim.user != request.user:
            return Response({"msg": "Unauthorized"}, status=403)
        
        # Use claim.user instead of request.user to fix data visibility for Admin/Agent
        user_policy = UserPolicy.objects.filter(user=claim.user, policy=claim.policy).order_by('-purchase_date').first()
        payments = Payment.objects.filter(user=claim.user, policy_id=claim.policy.id).order_by('-timestamp')
        documents = Document.objects.filter(claim=claim)
        
        return Response({
            "claim": {
                **ClaimSerializer(claim).data,
                "claim_type": claim.claim_type
            },
            "policy": {
                "name": claim.policy.name,
                "category": claim.policy.category,
                "description": claim.policy.description,
                "expiry_date": user_policy.expiry_date if user_policy else None,
                "renewal_date": (user_policy.expiry_date - timedelta(days=30)) if user_policy and user_policy.expiry_date else None,
            },
            "payments": [
                {
                    "id": p.id,
                    "amount": p.amount,
                    "method": p.method,
                    "timestamp": p.timestamp,
                    "status": p.status
                } for p in payments
            ],
            "documents": [
                {
                    "id": d.id,
                    "name": d.file.name.split('/')[-1],
                    "url": d.file.url
                } for d in documents
            ]
        })
    except Claim.DoesNotExist:
        return Response({"error": "Claim not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny]) # window.open friendly
def download_claim_report(request, id):
    try:
        claim = Claim.objects.get(id=id)
        # Auth check moved to view logic
        if request.user.role == 'user' and claim.user != request.user:
            return HttpResponse("Unauthorized", status=403)
            
        user_policy = UserPolicy.objects.filter(user=claim.user, policy=claim.policy).order_by('-purchase_date').first()
        payments = Payment.objects.filter(user=claim.user, policy_id=claim.policy.id).order_by('-timestamp')
        
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer)
        
        # Header - Brand styling
        p.setFillColorRGB(0.145, 0.455, 0.941) # #2574f0
        p.rect(0, 750, 600, 100, fill=1)
        p.setFillColorRGB(1, 1, 1)
        p.setFont("Helvetica-Bold", 24)
        p.drawString(50, 800, "PRO INSURANCE - CLAIM REPORT")
        
        # Status Badge
        p.setFillColorRGB(0.9, 0.9, 0.9)
        p.rect(450, 790, 100, 30, fill=1)
        p.setFillColorRGB(0.1, 0.1, 0.1)
        p.setFont("Helvetica-Bold", 10)
        p.drawCentredString(500, 802, f"ID: #{claim.id}")
        
        # Baseline
        y = 720
        p.setFillColorRGB(0, 0, 0)
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "CLAIM OVERVIEW")
        y -= 25
        p.setFont("Helvetica", 11)
        p.drawString(50, y, f"Customer: {claim.user.username}")
        p.drawString(300, y, f"Status: {claim.status}")
        y -= 20
        p.drawString(50, y, f"Claim Type: {claim.claim_type.upper()}")
        p.drawString(300, y, f"Requested Amount: INR {claim.amount}")
        
        # Policy Section
        y -= 50
        p.line(50, y+10, 550, y+10)
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "PROTECTION PLAN DETAILS")
        y -= 25
        p.setFont("Helvetica", 11)
        p.drawString(50, y, f"Policy: {claim.policy.name}")
        y -= 20
        p.drawString(50, y, f"Expiry Date: {user_policy.expiry_date.strftime('%Y-%m-%d') if user_policy and user_policy.expiry_date else 'N/A'}")
        p.drawString(300, y, f"Next Renewal: {(user_policy.expiry_date - timedelta(days=30)).strftime('%Y-%m-%d') if user_policy and user_policy.expiry_date else 'N/A'}")
        
        # T&C
        y -= 40
        p.setFont("Helvetica-BoldOblique", 10)
        p.drawString(50, y, "Terms & Conditions:")
        y -= 15
        p.setFont("Helvetica-Oblique", 9)
        tc_text = claim.policy.description[:200] + "..."
        p.drawString(50, y, tc_text)
        
        # Tranactions
        y -= 60
        p.line(50, y+10, 550, y+10)
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "TRANSACTION HISTORY")
        y -= 30
        p.setFont("Helvetica-Bold", 10)
        p.drawString(50, y, "Date")
        p.drawString(150, y, "Method")
        p.drawString(300, y, "Amount")
        p.drawString(450, y, "Status")
        
        p.setFont("Helvetica", 10)
        for pmt in payments[:5]:
            y -= 20
            p.drawString(50, y, pmt.timestamp.strftime('%Y-%m-%d'))
            p.drawString(150, y, pmt.method)
            p.drawString(300, y, f"INR {pmt.amount}")
            p.drawString(450, y, pmt.status)

        # Footer
        p.setFont("Helvetica-Oblique", 8)
        p.drawCentredString(300, 30, "Generated by Pro Insurance Mission Hub. This is a system-generated report.")

        p.showPage()
        p.save()
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f"claim_report_{claim.id}.pdf")
        
    except Exception as e:
        return Response({"error": str(e)}, status=404)

# ================= ACTIVITY FEED =================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_activities(request):
    if request.user.role == 'admin':
        activities = Activity.objects.all()[:40]
    else:
        activities = Activity.objects.filter(user=request.user)[:20]
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

def log_activity(user, action_type, description):
    try:
        Activity.objects.create(user=user, action_type=action_type, description=description)
    except:
        pass
