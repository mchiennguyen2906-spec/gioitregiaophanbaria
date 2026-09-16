const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://spoqkzsrcphgzvmxwadd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDI5MTcsImV4cCI6MjEwNTAxODkxN30.u4-YIbDD6pRMaufwXrix0DPeDS7SD0VAECMtVcqEnWQ';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTQ0MjkxNywiZXhwIjoyMTA1MDE4OTE3fQ.vIR-P9PJPpQ8M9cedwW06F3fccQWvRohN87h-8XfbQI';

const supabaseAnon = createClient(supabaseUrl, anonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function check() {
  console.log("=== CHECKING AS ADMIN ===");
  let { data: parishesAdmin } = await supabaseAdmin.from('parishes').select('*');
  console.log(`Parishes count: ${parishesAdmin?.length || 0}`);
  
  let { data: massesAdmin } = await supabaseAdmin.from('today_masses').select('*');
  console.log(`Today Masses count: ${massesAdmin?.length || 0}`);
  
  console.log("\nSample Parish:", parishesAdmin?.[0]);
  console.log("Sample Mass:", massesAdmin?.[0]);
}

check();
