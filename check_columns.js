const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  'https://spoqkzsrcphgzvmxwadd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTQ0MjkxNywiZXhwIjoyMTA1MDE4OTE3fQ.vIR-P9PJPpQ8M9cedwW06F3fccQWvRohN87h-8XfbQI'
);

async function checkCols() {
  const { data, error } = await sb.from('articles').select('*').limit(1);
  if (error) {
    console.error('Error fetching articles:', error);
  } else {
    console.log('Columns in articles table:');
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]));
    } else {
      console.log('No data found, cannot infer columns from empty response without RPC');
    }
  }
}

checkCols();
