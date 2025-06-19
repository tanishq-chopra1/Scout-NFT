// src/utils/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
