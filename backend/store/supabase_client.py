from supabase import create_client, Client
from django.conf import settings

supabase_client: Client = None
SUPABASE_BUCKET_NAME = None

if getattr(settings, "SUPABASE_URL", None) and getattr(settings, "SUPABASE_KEY", None):
    supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    SUPABASE_BUCKET_NAME = getattr(settings, "SUPABASE_BUCKET_NAME", None)
