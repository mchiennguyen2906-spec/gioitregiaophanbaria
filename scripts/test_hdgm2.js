const cheerio = require('cheerio');
async function test() {
    const res = await fetch('https://hdgmvietnam.com/tin-tuc/loi-chua-hang-ngay');
    const txt = await res.text();
    const $ = cheerio.load(txt);
    const nd = JSON.parse($('#__NEXT_DATA__').html());
    console.log(JSON.stringify(nd.props.pageProps).substring(0, 1000));
}
test();
