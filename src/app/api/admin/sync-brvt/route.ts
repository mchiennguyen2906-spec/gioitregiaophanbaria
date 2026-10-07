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

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const authHeader = request.headers.get('authorization');
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}` || authHeader === `Bearer GIOITRE_BRVT_CRON_SECRET_888`;
    
    if (!isCron) {
      const isAdmin = await verifyAdmin();
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://spoqkzsrcphgzvmxwadd.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const results: any[] = [];

    // 2. Scrape source
    const sourceUrl = 'https://www.giaophanbaria.org/category/tin-giao-phan';
    const categoryId = 'tin-giao-phan-brvt';

    try {
      const listResponse = await fetch(sourceUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
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
        if (img) img = img.replace(/-\d+x\d+(?=\.[a-zA-Z]+$)/, '');
        
        let date = $list(el).find('.entry-date').attr('datetime') || $list(el).find('.entry-date').text().trim() || new Date().toISOString();
        
        if (title && link && link !== 'https://www.giaophanbaria.org/' && !articles.find(a => a.link === link)) {
          articles.push({ title, link, img, date });
        }
      });

      // Take top 10 articles
      const topNews = articles.slice(0, 10);
      
      for (const article of topNews) {
        const articleSlug = article.link;
        let title = article.title;
        
        if (!articleSlug || !title) continue;

        // Skip liturgical Gospel readings that belong to loi-chua
        if (title.includes('Thường Niên') && title.includes('Tuần')) continue;

        // Check if article exists
        const { data: existing } = await supabase
          .from('articles')
          .select('id, date')
          .ilike('title', title)
          .limit(1);

        if (existing && existing.length > 0) {
          results.push({ title, status: 'skipped (exists)' });
          continue;
        }

        // Fetch content
        const articleResponse = await fetch(articleSlug, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
        const articleHtml = await articleResponse.text();
        const $article = cheerio.load(articleHtml);
        
        // Use high-res image from open graph if available
        const ogImage = $article('meta[property="og:image"]').attr('content');
        if (ogImage && ogImage.startsWith('http')) {
           article.img = ogImage;
        }
        
        let contentHtml = $article('.entry-content').html() || $article('.post-content').html();
        if (!contentHtml) {
          results.push({ title, status: 'skipped (no content found)' });
          continue;
        }

        const $content = cheerio.load(contentHtml);
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
        
        $content('body').append('<br><p style="text-align: right;"><em><span style="color:#808080">Nguồn: Giáo phận Bà Rịa (giaophanbaria.org)</span></em></p>');
        
        let finalContent = $content('body').html() || '';
        const textOnly = $content.text().replace(/\s+/g, ' ').trim();
        const excerpt = textOnly.slice(0, 160) + '...';
        
        let thumbnailUrl = article.img || '';
        if (thumbnailUrl && thumbnailUrl.startsWith('/')) {
            thumbnailUrl = `https://www.giaophanbaria.org${thumbnailUrl}`;
        }

        let dateIso = new Date().toISOString();
        if (article.date) {
          const d = new Date(article.date);
          if (!isNaN(d.getTime())) dateIso = d.toISOString();
        }

        // Save to Supabase
        const { data: inserted, error: insertError } = await supabase
          .from('articles')
          .insert([
            {
              category_id: categoryId,
              title: title,
              excerpt: excerpt,
              content: finalContent,
              author: 'Giáo phận Bà Rịa',
              thumbnail_url: thumbnailUrl,
              date: dateIso,
              status: 'published',
              is_featured: false,
              is_priority: false,
              is_home_featured: false,
              is_home_priority: false
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
