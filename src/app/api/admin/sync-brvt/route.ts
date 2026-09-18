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

    // 2. Scrape source
    const sourceUrl = 'https://www.giaophanbaria.org/category/tin-giao-phan';
    const categoryId = 'tin-giao-phan-brvt';

    try {
      const listResponse = await fetch(sourceUrl, { cache: 'no-store' });
      const listHtml = await listResponse.text();
      const $list = cheerio.load(listHtml);
      
      const articles: any[] = [];
      $list('.mpw-post, article, .type-post').each((i, el) => {
        const title = $list(el).find('h3 a, h4 a, h2 a, .entry-title a').first().text().trim();
        const link = $list(el).find('h3 a, h4 a, h2 a, .entry-title a').first().attr('href');
        let img = $list(el).find('img').first().attr('src');
        if (img && img.startsWith('data:image')) {
           img = $list(el).find('img').first().attr('data-lazy-src') || $list(el).find('img').first().attr('data-src') || '';
        }
        
        let date = $list(el).find('.entry-date').attr('datetime') || $list(el).find('.entry-date').text().trim() || Date.now();
        
        if (title && link && link !== 'https://www.giaophanbaria.org/' && !articles.find(a => a.link === link)) {
          articles.push({ title, link, img, date });
        }
      });

      // Take top 5 to avoid timeouts
      const topNews = articles.slice(0, 5);
      
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
        const articleResponse = await fetch(articleSlug, { cache: 'no-store' });
        const articleHtml = await articleResponse.text();
        const $article = cheerio.load(articleHtml);
        
        // Use high-res image from open graph if available
        const ogImage = $article('meta[property="og:image"]').attr('content');
        if (ogImage && ogImage.startsWith('http')) {
           article.img = ogImage;
        }
        
        let contentHtml = $article('.entry-content').html();
        if (!contentHtml) {
           contentHtml = $article('.post-content').html();
        }

        if (!contentHtml) {
          results.push({ title, status: 'skipped (no content found)' });
          continue;
        }

        const $content = cheerio.load(contentHtml || '');
        
        // Remove unwanted scripts, iframe, forms inside the content (e.g. newsletter subscribe forms)
        $content('script, iframe, form, .forminator-custom-form').remove();

        // Fix relative images to absolute ones
        $content('img').each((i, el) => {
            let src = $content(el).attr('src');
            if (src && src.startsWith('data:image')) {
                src = $content(el).attr('data-lazy-src') || $content(el).attr('data-src');
                if (src) $content(el).attr('src', src);
            }
            if (src && src.startsWith('/')) {
                $content(el).attr('src', `https://www.giaophanbaria.org${src}`);
            }
        });
        
        // Append Credit
        $content('body').append('<br><p style="text-align: right;"><em><span style="color:#808080">Nguồn: Giáo phận Bà Rịa (giaophanbaria.org)</span></em></p>');
        
        let finalContent = $content('body').html() || '';
        
        let thumbnailUrl = article.img || '';
        if (thumbnailUrl && thumbnailUrl.startsWith('/')) {
            thumbnailUrl = `https://www.giaophanbaria.org${thumbnailUrl}`;
        }

        // Save to Supabase
        const { data: inserted, error: insertError } = await supabase
          .from('articles')
          .insert([
            {
              category_id: categoryId,
              title: title,
              content: finalContent,
              author: 'Giáo phận Bà Rịa',
              thumbnail_url: thumbnailUrl,
              status: 'published',
              is_featured: true,
              is_home_featured: true,
              created_at: new Date().toISOString() // Or parse article.date if it's ISO
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
      console.error(`Error syncing ${sourceUrl}`, e);
      results.push({ source: sourceUrl, status: 'error', error: e.message });
    }

    return NextResponse.json({ success: true, results }, { headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
