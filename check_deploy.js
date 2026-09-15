// Check if deployed version has correct Supabase URL
async function check() {
  const res = await fetch('https://gioitregiaophanbaria-seven.vercel.app/admin/login');
  const html = await res.text();
  
  // Find JS bundle URLs
  const scriptMatches = html.matchAll(/src="([^"]*_next[^"]*)"/g);
  const scripts = [...scriptMatches].map(m => m[1]);
  
  console.log('Found', scripts.length, 'script bundles');
  
  for (const scriptPath of scripts) {
    const url = scriptPath.startsWith('http') ? scriptPath : 'https://gioitregiaophanbaria-seven.vercel.app' + scriptPath;
    try {
      const jsRes = await fetch(url);
      const js = await jsRes.text();
      if (js.includes('spoqkzsrcphgzvmxwadd')) {
        console.log('✅ FOUND real Supabase URL in:', scriptPath);
        return;
      }
      if (js.includes('placeholder.supabase.co')) {
        console.log('❌ FOUND placeholder URL in:', scriptPath);
      }
    } catch(e) {
      console.log('Error fetching', url, e.message);
    }
  }
  console.log('❌ Real Supabase URL NOT found in any bundle');
}
check();
