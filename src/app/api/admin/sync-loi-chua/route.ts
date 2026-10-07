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

function parseLiturgicalDate(title: string, link: string, pubDate?: string): string {
  const m = title.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    const year = parseInt(m[3], 10);
    const d = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  const mUrl = link.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
  if (mUrl) {
    const year = parseInt(mUrl[1], 10);
    const month = parseInt(mUrl[2], 10);
    const day = parseInt(mUrl[3], 10);
    const d = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  if (pubDate) {
    const d = new Date(pubDate);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

async function fetchArticleDetail(url: string) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
    const txt = await res.text();
    const $ = cheerio.load(txt);

    let contentHtml = $('.entry-content').html() || $('.post-content').html();
    if (!contentHtml) return null;

    const $content = cheerio.load(contentHtml);
    $content('script, iframe, form, .forminator-custom-form').remove();

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

    let ogImage = $('meta[property="og:image"]').attr('content') || '';
    if (!ogImage || !ogImage.startsWith('http')) {
      ogImage = $content('img').first().attr('src') || '';
    }

    const textOnly = $content.text().replace(/\s+/g, ' ').trim();
    const excerpt = textOnly.slice(0, 180) + '...';

    return {
      content: $content('body').html() || '',
      thumbnailUrl: ogImage,
      excerpt
    };
  } catch (e: any) {
    console.error(`Error fetching detail ${url}:`, e.message);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // 1. Check if direct payload is provided (from Bookmarklet / manual entry)
    let body: any = null;
    try {
      body = await request.json();
    } catch (e) {
      // no body
    }

    let title = body?.title;
    let finalContent = body?.content;
    let author = body?.author || 'Giáo phận Bà Rịa';
    let thumbnailUrl = body?.thumbnailUrl || '';
    let categoryId = body?.categoryId || 'loi-chua';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://spoqkzsrcphgzvmxwadd.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If manual payload provided:
    if (title && finalContent) {
      const parsedDate = body?.date || parseLiturgicalDate(title, '', new Date().toISOString());

      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .ilike('title', title)
        .limit(1);

      if (existing && existing.length > 0) {
        await supabase.from('articles').update({
          content: finalContent,
          thumbnail_url: thumbnailUrl,
          date: parsedDate
        }).eq('id', existing[0].id);
        return NextResponse.json({ success: true, message: 'Đã cập nhật bài viết thành công!', id: existing[0].id }, { headers: { 'Access-Control-Allow-Origin': '*' } });
      }

      const { data: inserted, error: insertError } = await supabase
        .from('articles')
        .insert([
          {
            category_id: categoryId,
            title,
            content: finalContent,
            excerpt: body?.excerpt || title,
            author,
            thumbnail_url: thumbnailUrl,
            date: parsedDate,
            status: 'published'
          }
        ])
        .select();

      if (insertError) {
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
      }

      return NextResponse.json({ success: true, message: 'Đã thêm bài viết thành công!', article: inserted[0] }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // 2. Automated Crawl from Giáo phận Bà Rịa
    const authHeader = request.headers.get('authorization');
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}` || authHeader === `Bearer GIOITRE_BRVT_CRON_SECRET_888`;

    if (!isCron) {
      const isAdmin = await verifyAdmin();
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
      }
    }

    const sources = [
      {
        url: 'https://www.giaophanbaria.org/category/chia-se-loi-chua/hang-ngay-theo-chu-de/loi-chua-hang-ngay',
        categoryId: 'loi-chua'
      },
      {
        url: 'https://www.giaophanbaria.org/category/chia-se-loi-chua/chua-nhat-va-le-trong/suy-niem-chua-nhat',
        categoryId: 'suy-niem'
      }
    ];

    const results: any[] = [];

    for (const src of sources) {
      try {
        const res = await fetch(src.url, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
        const txt = await res.text();
        const $ = cheerio.load(txt);

        const items: any[] = [];
        $('article, .mpw-post, .type-post').each((i, el) => {
          const t = $(el).find('h2 a, h3 a, h4 a, .entry-title a').first().text().trim();
          const link = $(el).find('h2 a, h3 a, h4 a, .entry-title a').first().attr('href');
          const pubDate = $(el).find('.entry-date').attr('datetime') || $(el).find('.entry-date').text().trim();

          if (t && link && !items.find(x => x.link === link)) {
            if (src.categoryId === 'loi-chua') {
              const isLiturgical = t.includes('Thường Niên') || t.includes('Tuần') || t.includes('Lễ') || t.match(/\d{2}[.-]\d{2}/) || t.includes('Thứ');
              if (isLiturgical) {
                items.push({ title: t, link, pubDate, date: parseLiturgicalDate(t, link, pubDate) });
              }
            } else {
              items.push({ title: t, link, pubDate, date: parseLiturgicalDate(t, link, pubDate) });
            }
          }
        });

        // Process top 8 items per source
        for (const item of items.slice(0, 8)) {
          const { data: existing } = await supabase
            .from('articles')
            .select('id, date')
            .ilike('title', item.title)
            .limit(1);

          if (existing && existing.length > 0) {
            // Update date if mismatched
            if (existing[0].date?.slice(0, 10) !== item.date.slice(0, 10)) {
              await supabase.from('articles').update({ date: item.date }).eq('id', existing[0].id);
              results.push({ title: item.title, status: 'updated date' });
            } else {
              results.push({ title: item.title, status: 'skipped (exists)' });
            }
            continue;
          }

          const detail = await fetchArticleDetail(item.link);
          if (!detail || !detail.content) {
            results.push({ title: item.title, status: 'skipped (no content)' });
            continue;
          }

          const { error: insertErr } = await supabase.from('articles').insert([{
            category_id: src.categoryId,
            title: item.title,
            excerpt: detail.excerpt,
            content: detail.content,
            author: 'Giáo phận Bà Rịa',
            thumbnail_url: detail.thumbnailUrl,
            date: item.date,
            status: 'published',
            is_featured: false,
            is_priority: false,
            is_home_featured: false,
            is_home_priority: false
          }]);

          if (insertErr) {
            results.push({ title: item.title, status: 'error', error: insertErr.message });
          } else {
            results.push({ title: item.title, status: 'success' });
          }
        }
      } catch (err: any) {
        console.error(`Sync error for ${src.url}:`, err.message);
        results.push({ source: src.url, status: 'error', error: err.message });
      }
    }

    return NextResponse.json({ success: true, results }, { headers: { 'Access-Control-Allow-Origin': '*' } });

  } catch (err: any) {
    console.error('Sync error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
