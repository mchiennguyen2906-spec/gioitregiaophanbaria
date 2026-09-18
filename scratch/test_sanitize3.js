import sanitizeHtml from 'sanitize-html';

const html = '<iframe class="ql-video" src="https://www.youtube.com/embed/SXIIy9t0qAA?showinfo=0"></iframe>';
const sanitized = sanitizeHtml(html, {
  allowedTags: ['iframe'],
  allowedAttributes: {
    iframe: ['src', 'class']
  },
  allowedIframeHostnames: ['www.youtube.com']
});
console.log('Sanitized:', sanitized);
