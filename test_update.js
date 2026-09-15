const { createClient } = require('@supabase/supabase-js');

// Create a client with the anon key
const sb = createClient(
  'https://spoqkzsrcphgzvmxwadd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDI5MTcsImV4cCI6MjEwNTAxODkxN30.u4-YIbDD6pRMaufwXrix0DPeDS7SD0VAECMtVcqEnWQ',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function testUpdate() {
  console.log('Testing update with ANON key...');
  // First find an article ID using service_role key to bypass RLS for SELECT just in case
  const sbService = createClient(
    'https://spoqkzsrcphgzvmxwadd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTQ0MjkxNywiZXhwIjoyMTA1MDE4OTE3fQ.vIR-P9PJPpQ8M9cedwW06F3fccQWvRohN87h-8XfbQI'
  );
  const { data: articles } = await sbService.from('articles').select('id, title').limit(1);
  const id = articles[0].id;
  
  const { error } = await sb.from('articles').update({ title: articles[0].title + ' (test anon)' }).eq('id', id);
  if (error) {
    console.log('Update error:', error);
  } else {
    console.log('Update success!');
    await sbService.from('articles').update({ title: articles[0].title }).eq('id', id);
  }
}

testUpdate();
