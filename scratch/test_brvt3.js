const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('scratch/brvt.html'));

const articles = [];
$('.mpw-post, article, .type-post').each((i, el) => {
  const title = $(el).find('h3 a, h4 a, h2 a, .entry-title a').first().text().trim();
  const link = $(el).find('h3 a, h4 a, h2 a, .entry-title a').first().attr('href');
  let img = $(el).find('img').first().attr('src');
  if (img && img.startsWith('data:image')) {
     img = $(el).find('img').first().attr('data-lazy-src') || $(el).find('img').first().attr('data-src');
  }
  const date = $(el).find('.entry-date').attr('datetime') || $(el).find('.entry-date').text().trim();
  if (title && link && link !== 'https://www.giaophanbaria.org/' && !articles.find(a => a.link === link)) {
    articles.push({ title, link, img, date });
  }
});
console.log(articles.slice(0, 5));
