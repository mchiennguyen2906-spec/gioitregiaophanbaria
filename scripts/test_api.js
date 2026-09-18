const cheerio = require('cheerio');

async function test() {
    const listResponse = await fetch('https://giaophanlongxuyen.org/chuyen-muc/loi-chua');
    const listHtml = await listResponse.text();
    const $list = cheerio.load(listHtml);
    
    let latestLink = '';
    $list('a').each((i, el) => {
      const href = $list(el).attr('href');
      if (href && (href.includes('/tin-tuc/thu-') || href.includes('/tin-tuc/-chua-nhat') || href.includes('/tin-tuc/chua-nhat')) && !latestLink) {
        latestLink = href.startsWith('http') ? href : `https://giaophanlongxuyen.org${href}`;
      }
    });

    console.log("Latest link:", latestLink);

    const articleResponse = await fetch(latestLink);
    const articleHtml = await articleResponse.text();
    const $article = cheerio.load(articleHtml);

    let title = $article('h1').first().text().trim();
    console.log("Title:", title);

    let contentHtml = $article('.post-content').html() || $article('.content').html() || $article('.entry-content').html() || $article('.noidung').html() || $article('.detail-content').html();
    
    if (!contentHtml) {
        let mainParagraph = $article('p').filter((i, el) => {
           return $article(el).text().includes('Lời Chúa:') || $article(el).text().includes('Tin Mừng');
        }).first();
        if (mainParagraph.length > 0) {
            contentHtml = mainParagraph.parent().html();
        }
    }

    const $content = cheerio.load(contentHtml || '');
    $content('script, style, iframe, .fb-like, .social-share').remove();
    
    $content('img').each((i, el) => {
        const src = $content(el).attr('src');
        if (src && src.startsWith('/')) {
            $content(el).attr('src', `https://giaophanlongxuyen.org${src}`);
        }
    });
    
    $content('body').append('<br><p style="text-align: right;"><em><span style="color:#808080">Nguồn: Giáo phận Long Xuyên</span></em></p>');
    
    console.log("Content Length:", $content('body').html().length);
    console.log("Snippet:", $content('body').html().substring(0, 300));
}

test();
