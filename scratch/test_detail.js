const fs = require('fs');
const html = fs.readFileSync('scratch/hdgm_vn.html', 'utf8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);
const nextDataString = $('#__NEXT_DATA__').html();
const data = JSON.parse(nextDataString);
console.log('Keys:', Object.keys(data.props.pageProps));
if (data.props.pageProps.news) {
  console.log('News keys:', Object.keys(data.props.pageProps.news));
}
Object.keys(data.props.pageProps).forEach(k => {
  if (data.props.pageProps[k] && data.props.pageProps[k].pageData) {
     console.log('Found pageData in', k);
  } else if (data.props.pageProps[k] && data.props.pageProps[k].total) {
     console.log('Found total in', k);
  }
});
fs.writeFileSync('scratch/hdgm_props.json', JSON.stringify(data.props.pageProps, null, 2));
