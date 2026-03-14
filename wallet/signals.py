# wallet/signals.py
from django.db.models.signals import post_save # The broadcast type
from django.dispatch import receiver          # The listener decorator
from django.contrib.auth.models import User
from .models import Account
import random

@receiver(post_save, sender=User)
def create_user_wallet(sender, instance, created, **kwargs):
    # 'instance' is the actual User object that was just saved
    # 'created' is a Boolean: True if this is a new user, False if just an update
    
    if created:
        # Generate a random account number for the new customer
        random_acc = f"APEX-{random.randint(1000, 9999)}"
        
        # Create the account with a $100 starting bonus!
        Account.objects.create(
            user=instance, 
            balance=100.00, 
            account_number=random_acc
        )
        print(f"Signal Triggered: Wallet created for {instance.username}")