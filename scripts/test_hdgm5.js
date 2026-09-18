const cheerio = require('cheerio');
async function test() {
    const res = await fetch('https://hdgmvietnam.com/tin-tuc/loi-chua-hang-ngay');
    const txt = await res.text();
    const $ = cheerio.load(txt);
    const nd = JSON.parse($('#__NEXT_DATA__').html());
    const focusNews = nd.props.pageProps.focusNews;
    if (focusNews && focusNews.value) {
        focusNews.value.forEach((post, i) => {
            console.log(i, post.title, post.link, post.publishDate);
        });
    }
}
test();
