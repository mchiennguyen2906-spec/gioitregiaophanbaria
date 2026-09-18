import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  console.log('Checking Auth Users...');
  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
  } else {
    console.log(`Found ${usersData.users.length} users:`);
    usersData.users.forEach(u => console.log(`- ${u.email} (ID: ${u.id})`));
  }
}

checkUsers();
