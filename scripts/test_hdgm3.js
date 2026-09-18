const cheerio = require('cheerio');
async function test() {
    const res = await fetch('https://hdgmvietnam.com/chi-tiet/chua-nhat-25-thuong-nien-nam-a--manna-cho-nguoi-lu-hanh');
    const txt = await res.text();
    const $ = cheerio.load(txt);
    const nd = JSON.parse($('#__NEXT_DATA__').html());
    const articleDetail = nd.props.pageProps.articleDetail;
    console.log("Title:", articleDetail.title);
    console.log("Content length:", articleDetail.content.length);
    console.log(articleDetail.content.substring(0, 500));
}
test();
