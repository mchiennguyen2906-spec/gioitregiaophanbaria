const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  'https://spoqkzsrcphgzvmxwadd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTQ0MjkxNywiZXhwIjoyMTA1MDE4OTE3fQ.vIR-P9PJPpQ8M9cedwW06F3fccQWvRohN87h-8XfbQI',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function fixRLS() {
  // Drop the recursive policy
  const { error: err1 } = await sb.rpc('exec_sql', {
    query: `DROP POLICY IF EXISTS "SuperAdmin full quyền user_roles" ON public.user_roles;`
  });
  
  if (err1) {
    console.log('rpc exec_sql not available:', err1.message);
    console.log('You need to run this SQL in Supabase Dashboard SQL Editor:');
    console.log('');
    console.log('DROP POLICY IF EXISTS "SuperAdmin full quyền user_roles" ON public.user_roles;');
    console.log('');
    console.log('CREATE POLICY "SuperAdmin full quyền user_roles" ON public.user_roles');
    console.log('FOR ALL USING (true) WITH CHECK (true);');
  } else {
    console.log('Step 1: Dropped recursive policy OK');
    
    // Create non-recursive policy
    const { error: err2 } = await sb.rpc('exec_sql', {
      query: `CREATE POLICY "SuperAdmin full quyền user_roles" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);`
    });
    console.log('Step 2: Create simple policy:', err2 ? err2.message : 'OK');
  }
  
  // Test with anon key
  const anonSb = createClient(
    'https://spoqkzsrcphgzvmxwadd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDI5MTcsImV4cCI6MjEwNTAxODkxN30.u4-YIbDD6pRMaufwXrix0DPeDS7SD0VAECMtVcqEnWQ'
  );
  
  const { data, error } = await anonSb.from('user_roles').select('*');
  console.log('\nAnon key test:');
  console.log('Data:', JSON.stringify(data));
  console.log('Error:', error ? JSON.stringify(error) : 'none');
}

fixRLS();
