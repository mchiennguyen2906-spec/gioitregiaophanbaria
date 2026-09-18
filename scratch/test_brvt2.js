const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('scratch/brvt.html'));

const articles = [];
// Looking at the HTML, the posts might be in a div with class 'base-box' or 'mpw-post' or 'post'
$('.mpw-post, .post, article, .item, .news-item, .category-tin-giao-phan').each((i, el) => {
  if (i > 5) return;
  const title = $(el).find('h2, h3, h4').text().trim();
  const link = $(el).find('a').first().attr('href');
  if (title && link) {
    articles.push({ title, link });
  }
});
if (articles.length === 0) {
   // Let's just find all h3 a
   $('h3 a').each((i, el) => {
      if (i > 5) return;
      articles.push({ title: $(el).text().trim(), link: $(el).attr('href') });
   });
}
console.log(articles);
