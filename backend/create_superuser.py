import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from accounts.models import User

# Create superuser
email = "admin@example.com"
password = "admin123"

if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email=email, password=password)
    print(f"Superuser created: {email}")
else:
    print(f"Superuser already exists: {email}")

print(f"Login credentials: Email: {email}, Password: {password}")
