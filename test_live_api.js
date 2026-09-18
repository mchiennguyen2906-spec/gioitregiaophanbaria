import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLiveApi() {
  console.log('1. Logging in to get session...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin.gioitregiaophanbaria@gmail.com',
    password: 'gioitrebr2026'
  });
  
  if (error || !data.session) {
    console.error('Login failed:', error);
    return;
  }
  
  const accessToken = data.session.access_token;
  const refreshToken = data.session.refresh_token;
  
  // Create cookie string similar to what Next.js sends
  // The default cookie names from @supabase/ssr are sb-[project-ref]-auth-token
  const projectRef = 'spoqkzsrcphgzvmxwadd';
  const cookieName = `sb-${projectRef}-auth-token`;
  
  // Supabase SSR uses chunked cookies, or just a JSON string for the session.
  // Actually, we can just send the Authorization header if the API supports it.
  // Wait, `verifyAdmin()` in `route.ts` uses `createSupabaseServerClient()`, which uses `cookies().get()`.
  // So we MUST send cookies.
  
  // The format of the cookie is stringified JSON of an array with access_token and refresh_token
  // Actually, let's look at how @supabase/ssr stores it. 
  const cookieValue = encodeURIComponent(JSON.stringify([accessToken, refreshToken]));
  
  const cookieStr = `${cookieName}=${cookieValue};`;

  console.log('2. Fetching from live API: https://www.gioitregiaophanbaria.com/api/admin/users');
  try {
    const res = await fetch('https://www.gioitregiaophanbaria.com/api/admin/users', {
      headers: {
        'Cookie': cookieStr,
        'Accept': 'application/json'
      }
    });
    
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text}`);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testLiveApi();
