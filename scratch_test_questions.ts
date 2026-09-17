import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://spoqkzsrcphgzvmxwadd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDI5MTcsImV4cCI6MjEwNTAxODkxN30.u4-YIbDD6pRMaufwXrix0DPeDS7SD0VAECMtVcqEnWQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  // 1. Test insert a question
  console.log('--- Test insert question ---');
  const { data: insertData, error: insertErr } = await supabase.from('questions').insert([{
    sender_name: 'Test Bot',
    sender_email: 'test@test.com',
    content: 'Gửi tới: Ban Tư vấn\n\nNội dung: Đây là câu hỏi test từ Bot.'
  }]).select();
  if (insertErr) {
    console.error('INSERT ERROR:', insertErr);
  } else {
    console.log('INSERT OK:', JSON.stringify(insertData, null, 2));
  }

  // 2. Read all questions
  console.log('\n--- All questions ---');
  const { data: questions, error: qErr } = await supabase.from('questions').select('*').order('created_at', { ascending: false }).limit(5);
  if (qErr) {
    console.error('SELECT ERROR:', qErr);
  } else {
    console.log(JSON.stringify(questions, null, 2));
  }

  // 3. Clean up test question
  if (insertData && insertData[0]) {
    await supabase.from('questions').delete().eq('id', insertData[0].id);
    console.log('\n✅ Cleaned up test question');
  }
}

main();
