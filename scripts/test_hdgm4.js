const cheerio = require('cheerio');
async function test() {
    const res = await fetch('https://hdgmvietnam.com/chi-tiet/chua-nhat-25-thuong-nien-nam-a--manna-cho-nguoi-lu-hanh');
    const txt = await res.text();
    const $ = cheerio.load(txt);
    const nd = JSON.parse($('#__NEXT_DATA__').html());
    console.log(Object.keys(nd.props.pageProps));
    if (nd.props.pageProps.article) {
        console.log(Object.keys(nd.props.pageProps.article));
        console.log("Title:", nd.props.pageProps.article.title);
        console.log("Content length:", nd.props.pageProps.article.content.length);
    }
}
test();
