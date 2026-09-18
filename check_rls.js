import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLS() {
  const { data, error } = await supabaseAdmin.rpc('get_policies_for_table', { table_name: 'user_roles' });
  if (error) {
    // If we don't have the rpc, we can just query pg_policies
    const { data: policies, error: polErr } = await supabaseAdmin
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'user_roles');
    console.log('Policies:', policies || polErr);
  } else {
    console.log('Policies:', data);
  }
}

checkRLS();
