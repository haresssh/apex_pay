from django.apps import AppConfig


class WalletConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'wallet'
    
    def ready(self):
        # This tells Django to "listen" to the signals file when the app starts
        import wallet.signals
