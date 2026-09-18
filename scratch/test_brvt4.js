const fs = require('fs');
const cheerio = require('cheerio');
fetch('https://www.giaophanbaria.org/tin-giao-phan/2026/09/14/giao-phan-ba-ria-chung-vien-thanh-toma-hai-son-khai-giang-nam-dao-tao-2026-2027.html', {
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
}).then(r => r.text()).then(html => {
  const $ = cheerio.load(html);
  // Wordpress usually puts content in .entry-content
  let content = $('.entry-content').html();
  if (!content) {
     content = $('.post-content').html();
  }
  console.log('Content length:', content ? content.length : 0);
  console.log('Preview:', content ? content.substring(0, 100) : 'none');
});
