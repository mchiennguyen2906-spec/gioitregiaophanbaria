const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  'https://spoqkzsrcphgzvmxwadd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDI5MTcsImV4cCI6MjEwNTAxODkxN30.u4-YIbDD6pRMaufwXrix0DPeDS7SD0VAECMtVcqEnWQ', // Anon key
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function test() {
  const { data, error } = await sb.from('articles').select('*');
  console.log('Anon key - Articles in DB count:', data ? data.length : 'null');
  if (error) console.log('Error:', error);
}

test();
