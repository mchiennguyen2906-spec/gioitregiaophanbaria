import sanitizeHtml from 'sanitize-html';

const html = '<p>Test</p><iframe class="ql-video" src="https://youtube.com/embed/123"></iframe><iframe class="ql-video" src="https://www.youtube.com/embed/456"></iframe><iframe class="ql-video" src="https://youtu.be/123"></iframe>';

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
