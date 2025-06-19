// src/utils/supabaseClient.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL: string = 'https://pcxrnjquyzyzdupyzfpm.supabase.co'; 
const SUPABASE_ANON_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeHJuanF1eXp5emR1cHl6ZnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjI4OTYsImV4cCI6MjA2NTgzODg5Nn0.H77CkDcdhwVUKlfgx9m_zjfIYSYLWngNbMN-VfwzS9w'; 

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
