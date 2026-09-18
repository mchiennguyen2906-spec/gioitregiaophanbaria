const cheerio = require('cheerio');
async function test() {
    const res = await fetch('https://hdgmvietnam.com/chi-tiet/voi-tam-long-cao-thuong-19-9-2020-thu-bay-tuan-24-thuong-nien--40574');
    const txt = await res.text();
    const $ = cheerio.load(txt);
    const ndStr = $('#__NEXT_DATA__').html();
    if (ndStr) {
        const nd = JSON.parse(ndStr);
        if (nd.props.pageProps.postDetail) {
            console.log("Title:", nd.props.pageProps.postDetail.title);
            console.log("Content:", nd.props.pageProps.postDetail.content.substring(0, 1000));
        }
    }
}
test();
