from django.contrib import admin
from .models import Account # The dot means "look in the current folder"

admin.site.register(Account)
