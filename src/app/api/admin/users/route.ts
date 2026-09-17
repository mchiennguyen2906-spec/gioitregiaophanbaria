import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '../../../utils/supabaseServer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://spoqkzsrcphgzvmxwadd.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getSupabaseAdmin = () => {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

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
      console.error(roleError);
      return NextResponse.json({ success: false, error: 'Lỗi khi gán quyền tài khoản' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Tạo tài khoản thành công!' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Hệ thống đang bận' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const supabaseAdmin = getSupabaseAdmin();

    // Lấy danh sách users từ user_roles
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: 'Lỗi khi tải danh sách' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Hệ thống đang bận' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Thiếu user ID' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Xóa từ auth.users (Tự động xóa ở user_roles do ON DELETE CASCADE)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: 'Lỗi khi xóa tài khoản' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Xóa tài khoản thành công!' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Hệ thống đang bận' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, role, allowedCategories, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu user ID' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Update user_roles
    const updateData: any = {};
    if (role) updateData.role = role;
    if (allowedCategories !== undefined) updateData.allowed_categories = allowedCategories;
    if (status) updateData.status = status;

    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .update(updateData)
      .eq('user_id', id);

    if (roleError) {
      console.error(roleError);
      return NextResponse.json({ success: false, error: 'Lỗi khi cập nhật' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Cập nhật tài khoản thành công!' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Hệ thống đang bận' }, { status: 500 });
  }
}
