import { NextResponse } from 'next/server';
import { createSupabaseServerClient, verifyAdmin } from '@/app/utils/supabaseServer';
import * as cheerio from 'cheerio';

export async function OPTIONS(request: Request) {
  // CORS Preflight
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: Request) {
  return POST(request);
}


export async function POST(request: Request) {
  try {
    // 1. Check if direct payload is provided (from Bookmarklet)
    let body: any = null;
    try {
      body = await request.json();
    } catch (e) {
      // no body
    }

    let title = body?.title;
    let finalContent = body?.content;
    let author = body?.author || 'GP Long Xuyên';
    let thumbnailUrl = body?.thumbnailUrl || '';

    if (!title || !finalContent) {
      // Fallback to crawling if no payload provided
      const authHeader = request.headers.get('authorization');
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    
      let isAdmin = false;
      if (!isCron) {
        isAdmin = await verifyAdmin();
        if (!isAdmin) {
          return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
        }
      }

      // 2. Fetch the category page from hdgmvietnam.com
      const listResponse = await fetch('https://hdgmvietnam.com/tin-tuc/loi-chua-hang-ngay', { cache: 'no-store' });
      const listHtml = await listResponse.text();
      const $list = cheerio.load(listHtml);
      
      const nextDataStr = $list('#__NEXT_DATA__').html();
      if (!nextDataStr) {
         return NextResponse.json({ success: false, error: 'Không tìm thấy dữ liệu NEXT_DATA từ hdgmvietnam' }, { headers: { 'Access-Control-Allow-Origin': '*' } });
      }

      const nextData = JSON.parse(nextDataStr);
      const focusNews = nextData.props?.pageProps?.focusNews;
      
      if (!focusNews || !focusNews.value || focusNews.value.length === 0) {
         return NextResponse.json({ success: false, error: 'Không tìm thấy danh sách bài viết từ hdgmvietnam' }, { headers: { 'Access-Control-Allow-Origin': '*' } });
      }

      // Pick the first one (usually the latest daily reading)
      const latestArticle = focusNews.value[0];
      const articleSlug = latestArticle.link;

      if (!articleSlug) {
        return NextResponse.json({ success: false, error: 'Bài viết mới nhất không có link' }, { headers: { 'Access-Control-Allow-Origin': '*' } });
      }

      // 3. Fetch the latest article
      const articleResponse = await fetch(`https://hdgmvietnam.com/chi-tiet/${articleSlug}`, { cache: 'no-store' });
      const articleHtml = await articleResponse.text();
      const $article = cheerio.load(articleHtml);
      
      const articleNextDataStr = $article('#__NEXT_DATA__').html();
      if (!articleNextDataStr) {
         return NextResponse.json({ success: false, error: 'Không tìm thấy nội dung bài viết' }, { headers: { 'Access-Control-Allow-Origin': '*' } });
      }

      const articleNextData = JSON.parse(articleNextDataStr);
      const postDetail = articleNextData.props?.pageProps?.postDetail;

      if (!postDetail || !postDetail.title || !postDetail.content) {
         return NextResponse.json({ success: false, error: 'Lỗi bóc tách cấu trúc bài viết hdgmvietnam' }, { headers: { 'Access-Control-Allow-Origin': '*' } });
      }

      // 4. Extract Title and Content
      title = postDetail.title;
      let contentHtml = postDetail.content;
      
      // Try to get high-res from OG image first
      const ogImage = $article('meta[property="og:image"]').attr('content');
      if (ogImage && ogImage.startsWith('http')) {
          thumbnailUrl = ogImage;
      } else if (latestArticle.photo) {
          thumbnailUrl = latestArticle.photo.startsWith('http') ? latestArticle.photo : `https://hdgmvietnam.com${latestArticle.photo}`;
      }

      const $content = cheerio.load(contentHtml || '');
      
      // Fix relative images to absolute ones (if any)
      $content('img').each((i, el) => {
          const src = $content(el).attr('src');
          if (src && src.startsWith('/')) {
              $content(el).attr('src', `https://hdgmvietnam.com${src}`);
          }
      });
      
      // Append Credit
      $content('body').append('<br><p style="text-align: right;"><em><span style="color:#808080">Nguồn: Hội đồng Giám mục Việt Nam (hdgmvietnam.com)</span></em></p>');
      
      finalContent = $content('body').html() || '';
      author = 'HĐGMVN';
    }

    // 5. Check if it already exists
    const supabase = await createSupabaseServerClient();
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .ilike('title', title)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true, message: 'Bài viết này đã được đồng bộ trước đó.', title }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // 6. Save to Supabase
    const { data: inserted, error: insertError } = await supabase
      .from('articles')
      .insert([
        {
          category_id: 'loi-chua',
          title: title,
          content: finalContent,
          author: author,
          thumbnail_url: thumbnailUrl,
          status: 'published'
        }
      ])
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ success: false, error: 'Lỗi khi lưu vào CSDL', details: insertError }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    return NextResponse.json({ success: true, message: 'Đồng bộ thành công!', article: inserted[0] }, { headers: { 'Access-Control-Allow-Origin': '*' } });

  } catch (err: any) {
    console.error('Sync error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
