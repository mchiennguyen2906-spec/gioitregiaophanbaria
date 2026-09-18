const html = '<a href="https://www.youtube.com/embed/SXIIy9t0qAA?showinfo=0">https://www.youtube.com/embed/SXIIy9t0qAA?showinfo=0</a><p></p>';
let preprocessedHtml = html.replace(
    /<a[^>]*href="([^"]*(?:youtube\.com\/embed|youtu\.be|youtube\.com\/watch\?v=)[^"]+)"[^>]*>.*?<\/a>/g,
    (match, url) => {
      let embedUrl = url;
      if (url.includes('watch?v=')) {
        const videoId = new URL(url).searchParams.get('v');
        if (videoId) {
          embedUrl = 'https://www.youtube.com/embed/' + videoId;
        }
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) {
          embedUrl = 'https://www.youtube.com/embed/' + videoId;
        }
      }
      return '<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="' + embedUrl + '" style="width: 100%; aspect-ratio: 16/9;"></iframe>';
    }
);
console.log(preprocessedHtml);
