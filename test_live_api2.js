import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testApi() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Local store for cookies
  const cookieMap = new Map();
  
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return Array.from(cookieMap.entries()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          cookieMap.set(name, value);
        });
      },
    },
  });

  console.log('Logging in...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin.gioitregiaophanbaria@gmail.com',
    password: 'gioitrebr2026'
  });

  if (error) {
    console.error('Login error:', error);
    return;
  }

  // Construct cookie string
  const cookieStr = Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('; ');
    
  console.log('Fetching live API with cookies:', cookieStr.slice(0, 50) + '...');
  
  const res = await fetch('https://www.gioitregiaophanbaria.com/api/admin/users', {
    headers: {
      'Cookie': cookieStr,
      'Accept': 'application/json'
    }
  });
  
  console.log('Response Headers:', res.headers);
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

testApi();
