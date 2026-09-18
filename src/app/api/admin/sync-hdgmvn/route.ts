import { NextResponse } from 'next/server';
import { createSupabaseServerClient, verifyAdmin } from '@/app/utils/supabaseServer';
import * as cheerio from 'cheerio';

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: Request) {
  return POST(request);
}

const SOURCES = [
  {
    url: 'https://hdgmvietnam.com/tin-tuc/thoi-su-giao-hoi-hoan-vu',
    categoryId: 'giao-hoi-hoan-vu'
  },
  {
    url: 'https://hdgmvietnam.com/tin-tuc/thoi-su-giao-hoi-viet-nam',
    categoryId: 'giao-hoi-viet-nam'
  }
];

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const authHeader = request.headers.get('authorization');
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    
    let isAdmin = false;
    if (!isCron) {
      isAdmin = await verifyAdmin();
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
      }
    }

    const supabase = await createSupabaseServerClient();
    const results = [];

    // 2. Scrape each source
    for (const source of SOURCES) {
      try {
        const listResponse = await fetch(source.url, { cache: 'no-store' });
        const listHtml = await listResponse.text();
        const $list = cheerio.load(listHtml);
        
        const nextDataStr = $list('#__NEXT_DATA__').html();
        if (!nextDataStr) {
          console.warn(`No NEXT_DATA found for ${source.url}`);
          continue;
        }

        const nextData = JSON.parse(nextDataStr);
        const focusNews = nextData.props?.pageProps?.focusNews?.value || [];
        
        // Take top 5 to avoid timeouts
        const topNews = focusNews.slice(0, 5);
        
        for (const article of topNews) {
          const articleSlug = article.link;
          let title = article.title;
          
          if (!articleSlug || !title) continue;

          // Check if article exists
          const { data: existing } = await supabase
            .from('articles')
            .select('id')
            .ilike('title', title)
            .limit(1);

          if (existing && existing.length > 0) {
            results.push({ title, status: 'skipped (exists)' });
            continue;
          }

          // Fetch content
          const articleResponse = await fetch(`https://hdgmvietnam.com/chi-tiet/${articleSlug}`, { cache: 'no-store' });
          const articleHtml = await articleResponse.text();
          const $article = cheerio.load(articleHtml);
          
          const articleNextDataStr = $article('#__NEXT_DATA__').html();
          if (!articleNextDataStr) continue;

          const articleNextData = JSON.parse(articleNextDataStr);
          const postDetail = articleNextData.props?.pageProps?.postDetail;

          if (!postDetail || !postDetail.content) continue;

          let contentHtml = postDetail.content;
          const $content = cheerio.load(contentHtml || '');
          
          // Fix relative images to absolute ones
          $content('img').each((i, el) => {
              const src = $content(el).attr('src');
              if (src && src.startsWith('/')) {
                  $content(el).attr('src', `https://hdgmvietnam.com${src}`);
              }
          });
          
          // Append Credit
          $content('body').append('<br><p style="text-align: right;"><em><span style="color:#808080">Nguồn: Hội đồng Giám mục Việt Nam (hdgmvietnam.com)</span></em></p>');
          
          let finalContent = $content('body').html() || '';
          
          // Try to get high-res from OG image first
          const ogImage = $article('meta[property="og:image"]').attr('content');
          let thumbnailUrl = '';
          
          if (ogImage && ogImage.startsWith('http')) {
              thumbnailUrl = ogImage;
          } else if (article.photo) {
              thumbnailUrl = article.photo.startsWith('http') ? article.photo : `https://hdgmvietnam.com${article.photo}`;
          }

          // Save to Supabase
          const { data: inserted, error: insertError } = await supabase
            .from('articles')
            .insert([
              {
                category_id: source.categoryId,
                title: title,
                content: finalContent,
                author: 'HĐGMVN',
                thumbnail_url: thumbnailUrl,
                status: 'published',
                is_featured: true,
                is_home_featured: true,
                created_at: new Date(article.publishDate || Date.now()).toISOString()
              }
            ])
            .select();

          if (insertError) {
            console.error('Insert error:', insertError);
            results.push({ title, status: 'error', error: insertError.message });
          } else {
            results.push({ title, status: 'success' });
          }
        }
      } catch (e: any) {
        console.error(`Error syncing ${source.url}`, e);
        results.push({ source: source.url, status: 'error', error: e.message });
      }
    }

    return NextResponse.json({ success: true, results }, { headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
