const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  'https://spoqkzsrcphgzvmxwadd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTQ0MjkxNywiZXhwIjoyMTA1MDE4OTE3fQ.vIR-P9PJPpQ8M9cedwW06F3fccQWvRohN87h-8XfbQI'
);

async function testUpdatePayload() {
  const { data: articles } = await sb.from('articles').select('*').limit(1);
  if (!articles || articles.length === 0) return console.log('No articles');
  
  const article = articles[0];
  const payload = {
    category_id: article.category_id,
    title: article.title + ' test',
    excerpt: article.excerpt,
    content: article.content,
    author: article.author,
    parish: article.parish,
    thumbnail_url: article.thumbnail_url,
    audio_url: article.audio_url,
    attachment_url: article.attachment_url,
    attachment_name: article.attachment_name,
    status: 'published',
    is_featured: article.is_featured,
    is_priority: article.is_priority,
    is_home_featured: article.is_home_featured,
    is_home_priority: article.is_home_priority
  };
  
  console.log('Sending payload:', payload);
  const { error } = await sb.from('articles').update(payload).eq('id', article.id);
  if (error) {
    console.error('ERROR:', error);
  } else {
    console.log('SUCCESS');
    await sb.from('articles').update({ title: article.title }).eq('id', article.id);
  }
}

testUpdatePayload();
