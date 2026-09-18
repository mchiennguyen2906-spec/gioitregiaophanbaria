const cheerio = require('cheerio');
fetch('https://www.giaophanbaria.org/gioi-tre/2026/09/thuong-huan-linh-muc-tre-nam-2026.html')
  .then(res => res.text())
  .then(html => { 
    const $ = cheerio.load(html); 
    const content = $('.entry-content').html() || $('.post-content').html();
    console.log(content.includes('<img')); 
  });
