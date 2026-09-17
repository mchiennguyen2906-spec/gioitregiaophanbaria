import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://spoqkzsrcphgzvmxwadd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDI5MTcsImV4cCI6MjEwNTAxODkxN30.u4-YIbDD6pRMaufwXrix0DPeDS7SD0VAECMtVcqEnWQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  // 1. Khôi phục lại email đúng cho sự kiện
  const { data: article, error: fetchErr } = await supabase.from('articles').select('id, title, metadata').eq('id', 'd4a198b0-047d-473e-ac16-17fde0619ae3').single();
  if (fetchErr) { console.error('Fetch error:', fetchErr); return; }
  
  console.log('Current metadata:', JSON.stringify(article.metadata, null, 2));
  
  const fixedMetadata = { ...article.metadata, email: 'hien.nhx@gmail.com' };
  const { error: updateErr } = await supabase.from('articles').update({ metadata: fixedMetadata }).eq('id', article.id);
  if (updateErr) { console.error('Update error:', updateErr); return; }
  console.log('✅ Đã khôi phục email về hien.nhx@gmail.com');

  // 2. Kiểm tra tất cả event registrations gần đây
  const { data: regs, error: regErr } = await supabase.from('event_registrations').select('*').order('created_at', { ascending: false }).limit(10);
  if (regErr) { console.error('Reg error:', regErr); return; }
  console.log('\n--- 10 đăng ký gần nhất ---');
  regs.forEach((r, i) => {
    console.log(`${i+1}. [${r.created_at}] ${r.full_name} | event: ${r.event_name} (${r.event_id}) | org: ${r.org_id} | email: ${r.email}`);
  });

  // 3. Kiểm tra tất cả articles có category su-kien hoặc lich-hoc
  const { data: events, error: evErr } = await supabase.from('articles').select('id, title, category_id, metadata, status').or('category_id.eq.su-kien,category_id.eq.lich-hoc');
  if (evErr) { console.error('Events error:', evErr); return; }
  console.log('\n--- Tất cả articles su-kien/lich-hoc ---');
  events.forEach((e, i) => {
    console.log(`${i+1}. [${e.category_id}] ${e.title} (id: ${e.id}) status: ${e.status}`);
    console.log('   metadata:', JSON.stringify(e.metadata));
  });
}

main();
