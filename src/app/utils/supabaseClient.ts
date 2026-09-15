import { createClient } from '@supabase/supabase-js';

// Hard-code public Supabase credentials to ensure Vercel builds always have correct values
// These are safe to expose (anon key = public key with RLS protection)
const supabaseUrl = 'https://spoqkzsrcphgzvmxwadd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDI5MTcsImV4cCI6MjEwNTAxODkxN30.u4-YIbDD6pRMaufwXrix0DPeDS7SD0VAECMtVcqEnWQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
