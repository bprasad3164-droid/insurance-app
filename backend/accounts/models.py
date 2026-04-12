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

class Claim(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE)
    amount = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    agent_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

class Document(models.Model):
    file = models.FileField(upload_to='documents/')
    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True) # For KYC docs
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    policy_id = models.IntegerField() # Linked to policy or userpolicy
    amount = models.FloatField()
    method = models.CharField(max_length=50) # UPI, Card, Net Banking
    timestamp = models.DateTimeField(auto_now_add=True)

class Invoice(models.Model):
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
