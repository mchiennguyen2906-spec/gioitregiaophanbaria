const fs = require('fs');
fetch('https://hdgmvietnam.com/hong-an-thanh-chuc--khanh-thanh-nha-huu-duong-linh-muc-nhip-song-giao-hoi-viet-nam-so-91-0792026--1492026', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
}).then(r => r.text()).then(html => {
  const cheerio = require('cheerio');
  const $ = cheerio.load(html);
  const nextDataString = $('#__NEXT_DATA__').html();
  if (nextDataString) {
    const data = JSON.parse(nextDataString);
    fs.writeFileSync('scratch/hdgm_detail.json', JSON.stringify(data.props.pageProps, null, 2));
    console.log('Saved to hdgm_detail.json');
  } else {
    console.log('No NEXT DATA');
  }
});
