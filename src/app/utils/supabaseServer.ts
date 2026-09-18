import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://spoqkzsrcphgzvmxwadd.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDI5MTcsImV4cCI6MjEwNTAxODkxN30.u4-YIbDD6pRMaufwXrix0DPeDS7SD0VAECMtVcqEnWQ',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set({ name, value, ...options })
            )
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function verifyAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return false;
  }

  // Check user_roles table for super_admin or admin
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role, status')
    .eq('user_id', user.id)
    .single();

  if (roleError || !roleData) {
    return false;
  }

  if (roleData.status === 'locked') {
    return false;
  }

  if (roleData.role === 'super_admin' || roleData.role === 'admin') {
    return true;
  }

  return false;
}

export async function verifyEditor() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return false;
  }

  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role, status')
    .eq('user_id', user.id)
    .single();

  if (roleError || !roleData || roleData.status === 'locked') {
    return false;
  }

  const allowedRoles = ['super_admin', 'admin', 'category_admin', 'editor'];
  if (allowedRoles.includes(roleData.role)) {
    return true;
  }

  return false;
}
