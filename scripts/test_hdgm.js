const cheerio = require('cheerio');

async function test() {
    const listResponse = await fetch('https://hdgmvietnam.com/tin-tuc/loi-chua-hang-ngay');
    const listHtml = await listResponse.text();
    const $list = cheerio.load(listHtml);
    
    const nextDataStr = $list('#__NEXT_DATA__').html();
    if (!nextDataStr) {
        console.log("No NEXT DATA");
        return;
    }
    
    const nextData = JSON.parse(nextDataStr);
    
    // The data is usually inside props.pageProps
    // Let's dump the keys of pageProps
    const pageProps = nextData.props?.pageProps;
    if (pageProps) {
        console.log("pageProps keys:", Object.keys(pageProps));
        if (pageProps.categoryData) {
            console.log("Found categoryData! Articles:", pageProps.categoryData.data?.length);
            const firstArticle = pageProps.categoryData.data[0];
            console.log("First article:", firstArticle);
            if (firstArticle && firstArticle.slug) {
                const latestLink = `https://hdgmvietnam.com/chi-tiet/${firstArticle.slug}`;
                console.log("Derived link:", latestLink);
                
                // Fetch the article
                const articleResponse = await fetch(latestLink);
                const articleHtml = await articleResponse.text();
                const $article = cheerio.load(articleHtml);
                const articleNextDataStr = $article('#__NEXT_DATA__').html();
                const articleNextData = JSON.parse(articleNextDataStr);
                
                const articleProps = articleNextData.props?.pageProps;
                console.log("articleProps keys:", Object.keys(articleProps));
                
                if (articleProps.articleDetail) {
                    console.log("Title:", articleProps.articleDetail.title);
                    console.log("Content length:", articleProps.articleDetail.content?.length);
                }
            }
        }
    }
}

test();
