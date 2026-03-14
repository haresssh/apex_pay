from django.urls import path
from . import views

urlpatterns = [
    path('send/', views.transfer_money, name='transfer'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('api/dashboard/', views.api_dashboard, name='dashboard_api'),
]