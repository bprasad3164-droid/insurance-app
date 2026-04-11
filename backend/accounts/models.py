from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin','Admin'),
        ('user','User'),
        ('agent','Agent'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    # Resolve reverse accessor conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='accounts_user_groups',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='accounts_user_permissions',
        blank=True
    )

class Policy(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    premium = models.FloatField()

    def __str__(self):
        return self.name

class Claim(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default='Pending')

    def __str__(self):
        return f"{self.user.username} - {self.policy.name} ({self.status})"
