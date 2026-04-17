from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin','Admin'),
        ('user','User'),
        ('agent','Agent'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    kyc_status = models.CharField(max_length=20, default='Pending') # Pending, Verified, Rejected
    profile_pic = models.ImageField(upload_to='profiles/', null=True, blank=True)

    # Resolve reverse accessor conflicts
    groups = models.ManyToManyField('auth.Group', related_name='accounts_user_groups', blank=True)
    user_permissions = models.ManyToManyField('auth.Permission', related_name='accounts_user_permissions', blank=True)

class KYC(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kyc')
    aadhaar_file = models.FileField(upload_to='kyc/aadhaar/')
    pan_file = models.FileField(upload_to='kyc/pan/')
    selfie_file = models.ImageField(upload_to='kyc/selfie/')
    status = models.CharField(max_length=20, default='Pending') # Pending, Verified, Rejected
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - KYC ({self.status})"

class Policy(models.Model):
    CATEGORY_CHOICES = (
        ('health', 'Health Insurance'),
        ('life', 'Life Insurance'),
        ('vehicle', 'Vehicle Insurance'),
    )
    name = models.CharField(max_length=100)
    description = models.TextField()
    base_premium = models.FloatField(default=0.0)
    coverage = models.FloatField(default=0.0)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='health')

    def __str__(self):
        return self.name

class UserPolicy(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE)
    premium = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, default='Active')
    purchase_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    certificate_id = models.CharField(max_length=50, unique=True, null=True, blank=True)

class Appointment(models.Model):
    """Step 1: Booking a slot for a new insurance policy survey."""
    STATUS_CHOICES = (
        ('Pending', 'Pending Assignment'),
        ('Assigned', 'Agent Assigned'),
        ('Surveyed', 'Survey Completed'),
        ('Verified', 'Verified by Admin'),
        ('Completed', 'Policy Created'),
    )
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    preferred_date = models.DateTimeField()
    category = models.CharField(max_length=20, choices=Policy.CATEGORY_CHOICES, default='health')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Pending')
    notes = models.TextField(blank=True, null=True)
    agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='survey_tasks')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking {self.id} - {self.client.username}"

class RenewalRequest(models.Model):
    """Step 3: Requesting a renewal for an existing policy."""
    STATUS_CHOICES = (
        ('Pending', 'Pending Assignment'),
        ('Assigned', 'Agent Assigned'),
        ('Verified', 'Agent Verified'),
        ('Approved', 'Approved by Admin'),
        ('Rejected', 'Rejected'),
    )
    user_policy = models.ForeignKey(UserPolicy, on_delete=models.CASCADE, related_name='renewals')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Pending')
    agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='renewal_tasks')
    requested_at = models.DateTimeField(auto_now_add=True)
    admin_comment = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Renewal {self.id} - {self.user_policy.certificate_id}"

class Claim(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Assigned', 'Agent Assigned'),
        ('Verified', 'Agent Verified'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )
    CLAIM_TYPE_CHOICES = (
        ('Accident', 'Accident / Collision'),
        ('Medical', 'Medical / Surgery'),
        ('Theft', 'Theft / Burglary'),
        ('Damage', 'Property Damage'),
        ('Other', 'Other Service Request'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE)
    claim_type = models.CharField(max_length=50, choices=CLAIM_TYPE_CHOICES, default='Accident')
    amount = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='claim_tasks')
    agent_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Document(models.Model):
    file = models.FileField(upload_to='documents/')
    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True) # For KYC docs
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    policy_id = models.IntegerField() # Linked to policy or userpolicy
    amount = models.FloatField()
    method = models.CharField(max_length=50) # UPI, Card, Net Banking
    vpa = models.CharField(max_length=100, null=True, blank=True)
    card_number_masked = models.CharField(max_length=20, null=True, blank=True)
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=20, default='Pending') # Pending, success, failed
    razorpay_order_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_signature = models.CharField(max_length=255, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

class Invoice(models.Model):
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Activity(models.Model):
    ACTION_CHOICES = (
        ('CLAIM', 'Claim Filed'),
        ('PAYMENT', 'Payment Made'),
        ('POLICY', 'Policy Purchased'),
        ('KYC', 'KYC Updated'),
        ('ASSIGN', 'Task Assigned'),
        ('APPROVE', 'Admin Approval'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action_type = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.action_type} - {self.created_at}"
