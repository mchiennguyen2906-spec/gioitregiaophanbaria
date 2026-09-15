const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  'https://spoqkzsrcphgzvmxwadd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTQ0MjkxNywiZXhwIjoyMTA1MDE4OTE3fQ.vIR-P9PJPpQ8M9cedwW06F3fccQWvRohN87h-8XfbQI',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function test() {
  const { data, error } = await sb.from('articles').select('*');
  console.log('Articles in DB count:', data ? data.length : 'null');
  if (error) console.log('Error:', error);
}

test();
