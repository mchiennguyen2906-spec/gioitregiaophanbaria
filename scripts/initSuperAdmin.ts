import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong file .env.local");
  process.exit(1);
}

// Dùng service_role_key để bypass RLS và tạo user auth
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSuperAdmin() {
  const email = 'admin@brvt.com';
  const password = 'AdminPassword123!';

  console.log('🔄 Đang tạo tài khoản Super Admin...');
  
  // 1. Tạo user trong bảng auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true // Bỏ qua bước xác nhận email
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
       console.log('⚠️ Tài khoản này đã tồn tại trong hệ thống Auth. Bỏ qua tạo mới auth.');
    } else {
       console.error('❌ Lỗi tạo auth user:', authError.message);
       process.exit(1);
    }
  }

  // Nếu user đã tồn tại, ta lấy lại ID của user đó
  let userId;
  if (authData?.user) {
    userId = authData.user.id;
  } else {
    // Tìm ID
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === email);
    if (!existingUser) {
      console.error('❌ Không tìm thấy user ID sau khi báo lỗi already registered.');
      process.exit(1);
    }
    userId = existingUser.id;
  }

  console.log(`✅ ID tài khoản Auth: ${userId}`);
  console.log('🔄 Đang cấp quyền Super Admin vào bảng user_roles...');

  // 2. Insert vào bảng public.user_roles
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      email: email,
      role: 'super_admin',
      allowed_categories: [] // Super Admin không giới hạn category
    }, { onConflict: 'user_id' });

  if (roleError) {
    // Có thể bảng user_roles chưa được tạo
    console.error('❌ Lỗi khi gán quyền (Hãy chắc chắn bạn đã chạy file schema.sql để tạo bảng user_roles):', roleError.message);
  } else {
    console.log('🎉 TẠO SUPER ADMIN THÀNH CÔNG!');
    console.log(`- Email đăng nhập: ${email}`);
    console.log(`- Mật khẩu: ${password}`);
    console.log('Bây giờ bạn có thể dùng tài khoản này để đăng nhập vào /admin!');
  }
}

createSuperAdmin();
