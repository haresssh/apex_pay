from django.db import models

# Create your models here.
from django.contrib.auth.models import User # Django's built-in User Era 1 auth

class Account(models.Model):
    # Link this account to a User (Every account must have an owner)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # We use Decimal for money because Float has rounding errors!
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # We add an index here because we will search by 'account_number' constantly
    account_number = models.CharField(max_length=20, unique=True, db_index=True)
    # NEW FIELD: This is our Idempotency Guard
    last_interest_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Wallet - ${self.balance}"
    
class Transaction(models.Model):
    from_account = models.ForeignKey(Account, related_name='sent_transactions', on_delete=models.CASCADE)
    to_account = models.ForeignKey(Account, related_name='received_transactions', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.from_account} -> {self.to_account}: ${self.amount} at {self.timestamp}"