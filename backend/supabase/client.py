# backend/supabase/client.py
import os
from supabase import create_client, Client

SUPABASE_URL: str = os.getenv("https://pcxrnjquyzyzdupyzfpm.supabase.co")
SUPABASE_KEY: str = os.getenv("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeHJuanF1eXp5emR1cHl6ZnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjI4OTYsImV4cCI6MjA2NTgzODg5Nn0.H77CkDcdhwVUKlfgx9m_zjfIYSYLWngNbMN-VfwzS9w")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)