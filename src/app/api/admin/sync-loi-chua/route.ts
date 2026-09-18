import { NextResponse } from 'next/server';
import { createSupabaseServerClient, verifyAdmin } from '@/app/utils/supabaseServer';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    // 1. Verify Authorization (Admin or Cron)
    const authHeader = request.headers.get('authorization');
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    
    let isAdmin = false;
    if (!isCron) {
      isAdmin = await verifyAdmin();
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 2. Fetch the category page
    const fetchOptions = {
      cache: 'no-store' as RequestCache,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    };
    const listResponse = await fetch('https://giaophanlongxuyen.org/chuyen-muc/loi-chua-moi-ngay', fetchOptions);
    const listHtml = await listResponse.text();
    const $list = cheerio.load(listHtml);
    
    // Find the first article link (usually the newest one)
    let latestLink = '';
    $list('a').each((i, el) => {
      const href = $list(el).attr('href');
      // They use "thu-" for Monday-Saturday and "chua-nhat" for Sunday
      if (href && (href.includes('/tin-tuc/thu-') || href.includes('/tin-tuc/-chua-nhat') || href.includes('/tin-tuc/chua-nhat')) && !latestLink) {
        latestLink = href.startsWith('http') ? href : `https://giaophanlongxuyen.org${href}`;
      }
    });

    if (!latestLink) {
      console.error("HTML Snippet:", listHtml.substring(0, 500));
      return NextResponse.json({ success: false, error: 'Vercel Server trả về trang: ' + listHtml.substring(0, 300) });
    }

    // 3. Fetch the latest article
    const articleResponse = await fetch(latestLink, fetchOptions);
    const articleHtml = await articleResponse.text();
    const $article = cheerio.load(articleHtml);

    // 4. Extract Title and Content
    let title = $article('.detail-content h2, .post-content h2, .content h2').first().text().trim();
    if (!title) {
        title = $article('h1').first().text().trim();
    }
    if (!title || title.toLowerCase() === 'lời chúa mỗi ngày') {
        // Fallback title
        const matchTitle = latestLink.match(/tin-tuc\/(.+)\.html/);
        title = matchTitle ? matchTitle[1].replace(/-/g, ' ').toUpperCase() : "Lời Chúa Mỗi Ngày";
    }

    // Giao phan Long Xuyen puts content in #container > div.content or similar.
    let contentHtml = $article('.post-content').html() || $article('.content').html() || $article('.entry-content').html() || $article('.noidung').html() || $article('.detail-content').html();
    
    if (!contentHtml) {
        // Fallback: Just grab the parent of the first paragraph containing "Lời Chúa:" or "Tin Mừng"
        let mainParagraph = $article('p').filter((i, el) => {
           return $article(el).text().includes('Lời Chúa:') || $article(el).text().includes('Tin Mừng');
        }).first();
        if (mainParagraph.length > 0) {
            contentHtml = mainParagraph.parent().html();
        } else {
            return NextResponse.json({ success: false, error: 'Không thể bóc tách nội dung HTML.' });
        }
    }

    // Clean up content
    const $content = cheerio.load(contentHtml || '');
    $content('script, style, iframe, .fb-like, .social-share, .authar-info, .ti-timer, .ti-eye, .ti-print').remove();
    // Also remove the redundant title inside content if we already have it
    $content('h2').first().remove();
    
    // Fix relative images to absolute ones
    $content('img').each((i, el) => {
        const src = $content(el).attr('src');
        if (src && src.startsWith('/')) {
            $content(el).attr('src', `https://giaophanlongxuyen.org${src}`);
        }
    });
    
    // Append Credit
    $content('body').append('<br><p style="text-align: right;"><em><span style="color:#808080">Nguồn: Giáo phận Long Xuyên</span></em></p>');
    
    const finalContent = $content('body').html() || '';

    // 5. Check if it already exists
    const supabase = await createSupabaseServerClient();
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('title', title)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true, message: 'Bài viết này đã được đồng bộ trước đó.', title });
    }

    // 6. Save to Supabase
    const { data: inserted, error: insertError } = await supabase
      .from('articles')
      .insert([
        {
          category_id: 'loi-chua',
          title: title,
          content: finalContent,
          author: 'GP Long Xuyên',
          status: 'published'
        }
      ])
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ success: false, error: 'Lỗi khi lưu vào CSDL', details: insertError });
    }

    return NextResponse.json({ success: true, message: 'Đồng bộ thành công!', article: inserted[0] });

  } catch (err: any) {
    console.error('Sync error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
