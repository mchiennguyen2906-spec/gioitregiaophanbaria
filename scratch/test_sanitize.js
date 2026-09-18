import sanitizeHtml from 'sanitize-html';

const html = '<p>Test</p><img src="https://example.com/img.jpg" alt="test" width="100" height="100" class="my-img" style="color:red" srcset="https://example.com/img.jpg 1x" sizes="100vw" loading="lazy" />';

const sanitized = sanitizeHtml(html, {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'iframe' ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['style', 'class'],
    'iframe': ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
    'img': ['src', 'alt', 'width', 'height']
  },
  allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com']
});

console.log('Original:', html);
console.log('Sanitized:', sanitized);
