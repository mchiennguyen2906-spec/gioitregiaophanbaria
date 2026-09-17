import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://spoqkzsrcphgzvmxwadd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDI5MTcsImV4cCI6MjEwNTAxODkxN30.u4-YIbDD6pRMaufwXrix0DPeDS7SD0VAECMtVcqEnWQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data: articles, error } = await supabase.from('articles').select('id, title, metadata').in('id', ['d4a198b0-047d-473e-ac16-17fde0619ae3', '491bb124-e28a-47dc-9269-a8ebff6666dc']);
  if (error) {
    console.error(error);
    return;
  }
  
  for (const article of articles) {
    if (article.metadata && article.metadata.email === 'hien.nhx@gmail.com') {
      const newMetadata = { ...article.metadata, email: 'hien.nhs@gmail.com' };
      const { error: updateError } = await supabase.from('articles').update({ metadata: newMetadata }).eq('id', article.id);
      if (updateError) {
        console.error(`Lỗi update ${article.id}:`, updateError);
      } else {
        console.log(`Đã sửa email cho bài viết ${article.id} thành hien.nhs@gmail.com`);
      }
    }
  }
}

main();
