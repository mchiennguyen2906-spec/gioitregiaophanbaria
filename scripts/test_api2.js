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
    if (!latestLink) {
      console.log("Failed to find link. HTML Length:", listHtml.length);
      console.log(listHtml.substring(0, 1000));
    }
}

test();
