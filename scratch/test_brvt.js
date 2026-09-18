const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('scratch/brvt.html'));

const articles = [];
$('article').each((i, el) => {
  if (i > 4) return;
  const title = $(el).find('.entry-title').text().trim();
  const link = $(el).find('.entry-title a').attr('href');
  let img = $(el).find('img').attr('src');
  if (img && img.startsWith('data:image')) {
     img = $(el).find('img').attr('data-lazy-src') || $(el).find('img').attr('data-src');
  }
  const date = $(el).find('.published').text().trim() || $(el).find('.entry-date').text().trim();
  if (title && link) {
    articles.push({ title, link, img, date });
  }
});
console.log(articles);
