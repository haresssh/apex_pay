from decimal import Decimal
from django.contrib import messages
from django.shortcuts import render, redirect
from django.db import transaction
from django.db.models import Q  # <--- THIS WAS MISSING!
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Account, Transaction
from .serializers import AccountSerializer

# ---------------------------------------------------------
# OLD DJANGO TEMPLATE VIEWS (For your HTML UI)
# ---------------------------------------------------------

@csrf_exempt
@login_required
def transfer_money(request):
    if request.method == "POST":
        receiver_id = request.POST.get('receiver_id')
        amount_str = request.POST.get('amount')

        try:
            amount = Decimal(amount_str)
            
            if amount <= 0:
                messages.error(request, "Amount must be greater than zero.")
                return redirect('transfer')

            with transaction.atomic():
                sender_acc = Account.objects.select_for_update().get(user=request.user)
                receiver_acc = Account.objects.select_for_update().get(id=receiver_id)

                if sender_acc == receiver_acc:
                    messages.error(request, "You cannot send money to yourself.")
                    return redirect('transfer')

                if sender_acc.balance < amount:
                    messages.error(request, "Insufficient funds.")
                    return redirect('transfer')

                sender_acc.balance -= amount
                receiver_acc.balance += amount
                sender_acc.save()
                receiver_acc.save()

                Transaction.objects.create(
                    from_account=sender_acc,
                    to_account=receiver_acc,
                    amount=amount
                )
                
                messages.success(request, f"Successfully sent ${amount}!")
                return redirect('dashboard') 

        except Account.DoesNotExist:
            messages.error(request, "Receiver account not found.")
        except Exception as e:
            messages.error(request, f"An error occurred: {str(e)}")

    return render(request, 'wallet/transfer.html')


@login_required
def dashboard(request):
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

# ---------------------------------------------------------
# NEW REACT API VIEWS (For your Glassmorphic UI)
# ---------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_dashboard(request):
    try:
        account = Account.objects.get(user=request.user)
        
        # Now Q is properly imported!
        recent_txs = Transaction.objects.filter(
            Q(from_account=account) | Q(to_account=account)
        ).order_by('-timestamp')[:5]

        tx_list = []
        for tx in recent_txs:
            is_sender = (tx.from_account == account)
            tx_list.append({
                "id": tx.id,
                "type": "Sent" if is_sender else "Received",
                "counterparty": tx.to_account.account_number if is_sender else tx.from_account.account_number,
                "amount": str(tx.amount),
                "date": tx.timestamp.strftime("%b %d, %Y - %H:%M")
            })

        return Response({
            "balance": str(account.balance),
            "account_number": account.account_number,
            "transactions": tx_list
        })
    except Account.DoesNotExist:
        return Response({"error": "Account not found"}, status=404)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_transfer(request):
    sender_account = Account.objects.get(user=request.user)
    
    to_account_number = request.data.get('to_account')
    amount = Decimal(str(request.data.get('amount', 0)))

    if amount <= 0:
        return Response({"error": "Amount must be greater than zero."}, status=400)

    if sender_account.balance < amount:
        return Response({"error": "Insufficient funds."}, status=400)

    try:
        receiver_account = Account.objects.get(account_number=to_account_number)
    except Account.DoesNotExist:
        return Response({"error": "Recipient account not found."}, status=404)

    if sender_account == receiver_account:
        return Response({"error": "You cannot transfer money to yourself."}, status=400)

    try:
        with transaction.atomic():
            # Use select_for_update() to lock the rows until the transaction finishes
            # This prevents race conditions if two people send money at the exact same millisecond
            sender_locked = Account.objects.select_for_update().get(id=sender_account.id)
            receiver_locked = Account.objects.select_for_update().get(id=receiver_account.id)

            sender_locked.balance -= amount
            sender_locked.save()

            receiver_locked.balance += amount
            receiver_locked.save()
            
            Transaction.objects.create(from_account=sender_locked, to_account=receiver_locked, amount=amount)

        return Response({"message": "Transfer successful!"}, status=200)
    except Exception as e:
        return Response({"error": "Transaction failed due to a system error."}, status=500)