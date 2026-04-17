import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User

emails = ["admin@test.com", "agent@test.com", "user@test.com", "admin@proinsurance.com"]
for email in emails:
    user = User.objects.filter(email=email).first()
    if user:
        print(f"User: {email}, Role: {user.role}, Has Password: {user.has_usable_password()}")
    else:
        print(f"User: {email} NOT FOUND")
