import os
import django
from django.contrib.auth import authenticate

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User

test_cases = [
    {"username": "admin@test.com", "password": "Admin@123", "expected_role": "admin"},
    {"username": "agent@test.com", "password": "Agent@123", "expected_role": "agent"},
    {"username": "user@test.com", "password": "User@123", "expected_role": "user"},
]

for tc in test_cases:
    user = authenticate(username=tc["username"], password=tc["password"])
    if user:
        print(f"PASS: {tc['username']} Authenticated as {user.role}")
        if user.role != tc["expected_role"]:
            print(f"  FAIL: Role mismatch. Expected {tc['expected_role']}, got {user.role}")
    else:
        print(f"FAIL: {tc['username']} could not be authenticated.")
        u_obj = User.objects.filter(username=tc["username"]).first()
        if u_obj:
            print(f"  User exists in DB, but password check failed.")
        else:
            print(f"  User NOT in DB.")
