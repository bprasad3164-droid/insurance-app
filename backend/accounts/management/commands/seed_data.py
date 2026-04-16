from django.core.management.base import BaseCommand
from accounts.models import User, Policy, UserPolicy


class Command(BaseCommand):
    help = "Seed default admin, agent, and user accounts + sample policies"

    def handle(self, *args, **kwargs):
        # ── Standardized Users ──────────────────────────────────────────────
        users = [
            {"email": "admin@proinsurance.com", "password": "Admin@123", "role": "admin"},
            {"email": "agent@proinsurance.com", "password": "Agent@123", "role": "agent"},
            {"email": "user@proinsurance.com",  "password": "User@1234", "role": "user"},
        ]

        for u in users:
            existing_user = User.objects.filter(email=u["email"]).first()
            if not existing_user:
                User.objects.create_user(
                    username=u["email"],
                    email=u["email"],
                    password=u["password"],
                    role=u["role"],
                    kyc_status="Verified" if u["role"] in ("admin", "agent") else "Pending",
                )
                self.stdout.write(self.style.SUCCESS(f"  Created {u['role']}: {u['email']}"))
            else:
                existing_user.set_password(u["password"])
                existing_user.role = u["role"]
                existing_user.save()
                self.stdout.write(self.style.SUCCESS(f"  Updated credentials for: {u['email']}"))

        # ── Sample Policies ─────────────────────────────────────────────
        policies = [
            {
                "name": "Health Shield",
                "description": "Comprehensive health cover for you and your family. 500+ network hospitals.",
                "base_premium": 4999.0,
                "coverage": 1000000.0,
                "category": "health",
            },
            {
                "name": "Life Secure",
                "description": "Long-term life protection with critical illness rider. Tax benefits u/s 80C.",
                "base_premium": 2999.0,
                "coverage": 5000000.0,
                "category": "life",
            },
            {
                "name": "Motor Guard",
                "description": "360° vehicle protection - zero depreciation, roadside assist, cashless repairs.",
                "base_premium": 1999.0,
                "coverage": 500000.0,
                "category": "vehicle",
            },
            {
                "name": "Premium Health Pro",
                "description": "Elite health plan with international coverage and dedicated wellness manager.",
                "base_premium": 9999.0,
                "coverage": 2000000.0,
                "category": "health",
            },
            {
                "name": "Term Shield Plus",
                "description": "Pure term insurance with return of premium and critical illness waiver.",
                "base_premium": 1299.0,
                "coverage": 20000000.0,
                "category": "life",
            },
            {
                "name": "Bike Protect",
                "description": "Complete two-wheeler insurance with own damage and pillion rider cover.",
                "base_premium": 899.0,
                "coverage": 100000.0,
                "category": "vehicle",
            },
        ]

        created = 0
        for p in policies:
            if not Policy.objects.filter(name=p["name"]).exists():
                Policy.objects.create(**p)
                created += 1

        # ── Sample User Policies ─────────────────────────────────────────
        test_user = User.objects.filter(email="user@test.com").first()
        if test_user:
            from django.utils import timezone
            from datetime import timedelta
            
            p1 = Policy.objects.filter(name="Health Shield").first()
            p2 = Policy.objects.filter(name="Motor Guard").first()
            
            if p1 and not UserPolicy.objects.filter(user=test_user, policy=p1).exists():
                UserPolicy.objects.create(
                    user=test_user,
                    policy=p1,
                    premium=4999.0,
                    status="Active",
                    expiry_date=timezone.now() + timedelta(days=200),
                    certificate_id="CERT-SEED-H1"
                )
            if p2 and not UserPolicy.objects.filter(user=test_user, policy=p2).exists():
                UserPolicy.objects.create(
                    user=test_user,
                    policy=p2,
                    premium=1999.0,
                    status="Active",
                    expiry_date=timezone.now() + timedelta(days=30),
                    certificate_id="CERT-SEED-M1"
                )

        self.stdout.write(self.style.SUCCESS("\nSeed complete!\n"))
        self.stdout.write("=" * 50)
        self.stdout.write("  ADMIN  --> admin@proinsurance.com / Admin@123")
        self.stdout.write("  AGENT  --> agent@proinsurance.com / Agent@123")
        self.stdout.write("  USER   --> user@proinsurance.com  / User@1234")
        self.stdout.write("=" * 50)
