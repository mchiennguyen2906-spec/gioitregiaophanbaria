import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/utils/supabaseServer';
import { createClient } from '@supabase/supabase-js';
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
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}` || authHeader === `Bearer GIOITRE_BRVT_CRON_SECRET_888`;
    
    let isAdmin = false;
    if (!isCron) {
      isAdmin = await verifyAdmin();
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://spoqkzsrcphgzvmxwadd.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const results = [];

    // 2. Scrape each source
    for (const source of SOURCES) {
      try {
        const listResponse = await fetch(source.url, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
        const listHtml = await listResponse.text();
        const $list = cheerio.load(listHtml);
        
        const nextDataStr = $list('#__NEXT_DATA__').html();
        if (!nextDataStr) {
          console.warn(`No NEXT_DATA found for ${source.url}`);
          continue;
        }

        const nextData = JSON.parse(nextDataStr);
        const focusNews = nextData.props?.pageProps?.focusNews?.value || [];
        
        // Take top 8 to avoid timeouts while getting fresh news
        const topNews = focusNews.slice(0, 8);
        
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
          const articleResponse = await fetch(`https://hdgmvietnam.com/chi-tiet/${articleSlug}`, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
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
          const textOnly = $content.text().replace(/\s+/g, ' ').trim();
          const excerpt = textOnly.slice(0, 160) + '...';
          
          // Try to get high-res from OG image first
          const ogImage = $article('meta[property="og:image"]').attr('content');
          let thumbnailUrl = '';
          
          if (ogImage && ogImage.startsWith('http')) {
              thumbnailUrl = ogImage;
          } else if (article.photo) {
              thumbnailUrl = article.photo.startsWith('http') ? article.photo : `https://hdgmvietnam.com${article.photo}`;
          }

          let dateIso = new Date().toISOString();
          if (article.publishDate) {
            const d = new Date(article.publishDate);
            if (!isNaN(d.getTime())) dateIso = d.toISOString();
          }

          // Save to Supabase
          const { data: inserted, error: insertError } = await supabase
            .from('articles')
            .insert([
              {
                category_id: source.categoryId,
                title: title,
                excerpt: excerpt,
                content: finalContent,
                author: 'HĐGMVN',
                thumbnail_url: thumbnailUrl,
                status: 'published',
                date: dateIso,
                is_featured: false,
                is_priority: false,
                is_home_featured: false,
                is_home_priority: false,
                created_at: dateIso
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
