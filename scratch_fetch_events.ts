import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://spoqkzsrcphgzvmxwadd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDI5MTcsImV4cCI6MjEwNTAxODkxN30.u4-YIbDD6pRMaufwXrix0DPeDS7SD0VAECMtVcqEnWQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase.from('articles').select('id, title, metadata').in('id', ['d4a198b0-047d-473e-ac16-17fde0619ae3', '491bb124-e28a-47dc-9269-a8ebff6666dc']);
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

main();
