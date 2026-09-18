import sanitizeHtml from 'sanitize-html';

export const sanitize = (html: string) => {
  // Tự động chuyển đổi các thẻ <a> chứa link Youtube thành <iframe>
  // Đảm bảo video luôn hiển thị kể cả khi trình soạn thảo vô tình lưu thành dạng link
  let preprocessedHtml = html;
  if (html) {
    preprocessedHtml = html.replace(
      /<a[^>]*href="([^"]*(?:youtube\.com\/embed|youtu\.be|youtube\.com\/watch\?v=)[^"]+)"[^>]*>.*?<\/a>/g,
      (match, url) => {
        let embedUrl = url;
        try {
          if (url.includes('watch?v=')) {
            const videoId = new URL(url).searchParams.get('v');
            if (videoId) {
              embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
          } else if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1]?.split('?')[0];
            if (videoId) {
              embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
          }
        } catch (e) {
          console.error("Lỗi khi parse URL YouTube", e);
        }
        return `<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="${embedUrl}" style="width: 100%; aspect-ratio: 16/9;"></iframe>`;
      }
    );
  }

  return sanitizeHtml(preprocessedHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'iframe' ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['style', 'class'],
      'iframe': ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
      'img': ['src', 'alt', 'width', 'height']
    },
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'youtu.be', 'player.vimeo.com']
  });
};
