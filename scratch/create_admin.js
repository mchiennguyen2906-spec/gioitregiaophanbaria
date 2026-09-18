require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdmin() {
  const email = 'admin.gioitregiaophanbaria@gmail.com';
  const password = 'gioitrebr2026';

  console.log(`Creating user ${email}...`);
  const { data: user, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userError) {
    if (userError.message.includes('already been registered') || userError.message.includes('already exists')) {
      console.log('User already exists, updating password...');
      // Update password
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(u => u.email === email);
      
      if (existingUser) {
        await supabase.auth.admin.updateUserById(existingUser.id, { password });
        console.log('Password updated.');
        await ensureRole(existingUser.id);
      }
      return;
    }
    console.error('Error creating user:', userError);
    return;
  }

  console.log('User created successfully:', user.user.id);
  await ensureRole(user.user.id);
}

async function ensureRole(userId) {
  console.log('Assigning super_admin role...');
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      email: 'admin.gioitregiaophanbaria@gmail.com',
      role: 'super_admin',
      allowed_categories: [],
      status: 'active'
    });

  if (roleError) {
    console.error('Error assigning role:', roleError);
  } else {
    console.log('Role assigned successfully!');
  }
}

createAdmin();
