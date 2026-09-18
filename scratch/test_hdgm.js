const cheerio = require('cheerio');
fetch('https://hdgmvietnam.com/chi-tiet/khai-mac-hoi-nghi-chuan-bi-quoc-te-lan-thu-hai-cua-dai-hoi-gioi-tre-the-gioi-seoul-2027')
  .then(res => res.text())
  .then(html => { 
    const $ = cheerio.load(html); 
    const data = JSON.parse($('#__NEXT_DATA__').html()); 
    console.log(data.props.pageProps.postDetail.content.substring(0, 500)); 
  });
