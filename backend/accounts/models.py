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

class Policy(models.Model):
    CATEGORY_CHOICES = (
        ('health', 'Health Insurance'),
        ('life', 'Life Insurance'),
        ('vehicle', 'Vehicle Insurance'),
    )
    name = models.CharField(max_length=100)
    description = models.TextField()
    premium = models.FloatField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='health')

    def __str__(self):
        return self.name

class UserPolicy(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE)
    purchase_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    certificate_id = models.CharField(max_length=50, unique=True, null=True, blank=True)

class Claim(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default='Pending')
    agent_status = models.CharField(max_length=20, default='Pending')

class Document(models.Model):
    file = models.FileField(upload_to='documents/')
    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True) # For KYC docs
    uploaded_at = models.DateTimeField(auto_now_add=True)
