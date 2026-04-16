import os
import django
from datetime import timedelta
from django.utils import timezone
import random

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User, Policy, UserPolicy, Claim, Payment

def fix_data():
    print("Starting Data Repair...")
    claims = Claim.objects.all()
    
    for claim in claims:
        print(f"Processing Claim #{claim.id} for {claim.user.username}...")
        
        # 1. Ensure UserPolicy exists
        up, created = UserPolicy.objects.get_or_create(
            user=claim.user,
            policy=claim.policy,
            defaults={
                'premium': claim.policy.base_premium,
                'status': 'Active',
                'purchase_date': claim.created_at - timedelta(days=90),
                'expiry_date': claim.created_at + timedelta(days=270),
                'certificate_id': f"CERT-{random.randint(10000, 99999)}"
            }
        )
        if created:
            print(f"  - Created missing UserPolicy for {claim.policy.name}")
        else:
            # Ensure it has an expiry date if it was missing
            if not up.expiry_date:
                up.expiry_date = timezone.now() + timedelta(days=200)
                up.save()
                print(f"  - Updated Expiry Date for UserPolicy #{up.id}")

        # 2. Ensure Payment records exist (at least 2 for history)
        pmt_count = Payment.objects.filter(user=claim.user, policy_id=claim.policy.id).count()
        if pmt_count < 2:
            # Create a couple of mock payments
            methods = ['UPI', 'Credit Card', 'Net Banking']
            for i in range(2 - pmt_count):
                Payment.objects.create(
                    user=claim.user,
                    policy_id=claim.policy.id,
                    amount=claim.policy.base_premium / 4, # Quarterly
                    method=random.choice(methods),
                    status='success',
                    timestamp=up.purchase_date + timedelta(days=i*30)
                )
            print(f"  - Generated missing Payment records")

    print("Data Repair Complete.")

if __name__ == "__main__":
    fix_data()
