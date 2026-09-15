import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Lazy initialization to prevent Next.js build time errors if env vars are missing
const getSupabaseAdmin = () => {
  return createClient(supabaseUrl || 'https://placeholder.supabase.co', serviceRoleKey || 'placeholder', {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export async function POST(request: Request) {
  try {
    if (!serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Chưa cấu hình SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    const body = await request.json();
    const { email, password, role, allowedCategories } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Tạo user trong auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Gán quyền vào public.user_roles
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert([
        {
          user_id: userId,
          email: email,
          role: role,
          allowed_categories: allowedCategories || []
        }
      ]);

    if (roleError) {
      // Rollback (Xóa auth user nếu gán quyền lỗi)
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ success: false, error: roleError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Tạo tài khoản thành công!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    if (!serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Chưa cấu hình SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Lấy danh sách users từ user_roles
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Chưa cấu hình SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Thiếu user ID' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Xóa từ auth.users (Tự động xóa ở user_roles do ON DELETE CASCADE)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Xóa tài khoản thành công!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
