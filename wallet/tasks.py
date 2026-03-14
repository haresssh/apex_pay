from celery import shared_task
from django.db import transaction
from django.utils import timezone
from .models import Account
from decimal import Decimal

@shared_task(bind=True, acks_late=True)
def calculate_monthly_interest(self):
    now = timezone.now()
    # We fetch all accounts that haven't been paid THIS month
    # This filter is the "Secret Sauce" of a Senior Engineer
    accounts = Account.objects.exclude(
        last_interest_date__month=now.month,
        last_interest_date__year=now.year
    )

    processed_count = 0
    for account in accounts:
        try:
            with transaction.atomic():
                # Re-fetch with a lock to be 100% safe
                acc = Account.objects.select_for_update().get(id=account.id)
                
                # Perform the math
                interest = acc.balance * Decimal('0.01')
                acc.balance += interest
                acc.last_interest_date = now
                acc.save()
                
                processed_count += 1
        except Exception as e:
            # If one account fails, we log it but keep going with the others
            print(f"Failed to process account {account.id}: {str(e)}")

    return f"Successfully paid interest to {processed_count} accounts."