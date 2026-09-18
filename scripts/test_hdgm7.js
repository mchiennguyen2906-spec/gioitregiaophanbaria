const cheerio = require('cheerio');
async function test() {
    const res = await fetch('https://hdgmvietnam.com/tin-tuc/loi-chua-hang-ngay');
    const txt = await res.text();
    const $ = cheerio.load(txt);
    const nd = JSON.parse($('#__NEXT_DATA__').html());
    const focusNews = nd.props.pageProps.focusNews;
    if (focusNews && focusNews.value) {
        console.log(Object.keys(focusNews.value[0]));
        console.log("Photo:", focusNews.value[0].photo);
        console.log("Image:", focusNews.value[0].image);
        console.log("Avatar:", focusNews.value[0].avatar);
        console.log("Cover:", focusNews.value[0].cover);
    }
}
test();
