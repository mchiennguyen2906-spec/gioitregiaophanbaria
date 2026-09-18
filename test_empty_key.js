import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use empty string
const supabaseAdmin = createClient(supabaseUrl, '');

async function testEmptyKey() {
  const { data, error } = await supabaseAdmin
    .from('user_roles')
    .select('*')
    .order('created_at', { ascending: false });

  console.log('Data:', data);
  console.log('Error:', error);
}

testEmptyKey();
