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
