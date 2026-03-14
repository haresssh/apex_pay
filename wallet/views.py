from decimal import Decimal
from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import render
from django.db import transaction
from django.shortcuts import redirect # Add redirect

from wallet.models import Account, Transaction as TransactionModel
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
@csrf_exempt
@login_required
def transfer_money(request):
    if request.method == "POST":
        receiver_id = request.POST.get('receiver_id')
        amount_str = request.POST.get('amount')

        try:
            amount = Decimal(amount_str)
            
            # 1. Validation: No negative money! 
            # Without this, I could "send" -100 to you and my balance would go UP.
            if amount <= 0:
                messages.error(request, "Amount must be greater than zero.")
                return redirect('transfer')

            with transaction.atomic():
                sender_acc = Account.objects.select_for_update().get(user=request.user)
                receiver_acc = Account.objects.select_for_update().get(id=receiver_id)

                # 2. Validation: No self-transfers
                # Prevents weird database locks or "infinite money" bugs
                if sender_acc == receiver_acc:
                    messages.error(request, "You cannot send money to yourself.")
                    return redirect('transfer')

                # 3. Validation: Funds check
                if sender_acc.balance < amount:
                    messages.error(request, "Insufficient funds.")
                    return redirect('transfer')

                # Perform the transfer
                sender_acc.balance -= amount
                receiver_acc.balance += amount
                sender_acc.save()
                receiver_acc.save()

                TransactionModel.objects.create(
                    from_account=sender_acc,
                    to_account=receiver_acc,
                    amount=amount
                )
                
                messages.success(request, f"Successfully sent ${amount}!")
                return redirect('dashboard') # Send them home after success

        except Account.DoesNotExist:
            messages.error(request, "Receiver account not found.")
        except Exception as e:
            messages.error(request, f"An error occurred: {str(e)}")

    return render(request, 'wallet/transfer.html')


@login_required
def dashboard(request):
    # For now, we assume you are the user with ID 1
    # We fetch the account AND all sent/received transactions in one go
    account = Account.objects.prefetch_related(
        'sent_transactions', 
        'received_transactions'
    ).get(user_id=request.user.id)
    
    context = {
        'account': account,
        'sent': account.sent_transactions.all().order_by('-timestamp'),
        'received': account.received_transactions.all().order_by('-timestamp'),
    }
    
    return render(request, 'wallet/dashboard.html', context)



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import AccountSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_dashboard(request):
    # This is the "API version" of our dashboard
    # Note: For now we'll use a specific ID to test, 
    # but later we'll use JWT for auth!
    account = Account.objects.get(id=1) 
    serializer = AccountSerializer(account)
    
    # This returns a JSON response!
    return Response(serializer.data)