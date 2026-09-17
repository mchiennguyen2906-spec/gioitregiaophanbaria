'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function loginWithEmail(email: string, password: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    'https://spoqkzsrcphgzvmxwadd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDI5MTcsImV4cCI6MjEwNTAxODkxN30.u4-YIbDD6pRMaufwXrix0DPeDS7SD0VAECMtVcqEnWQ',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set({ name, value, ...options })
            );
          } catch (error) {
            console.error('cookieStore.set error:', error);
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check user role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('status')
    .eq('user_id', data.user.id)
    .single();

  if (roleData && roleData.status === 'locked') {
    await supabase.auth.signOut();
    return { error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.' };
  }

  return { success: true };
}
