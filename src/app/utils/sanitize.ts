import sanitizeHtml from 'sanitize-html';

export const sanitize = (html: string) => {
  let preprocessedHtml = html;


  return sanitizeHtml(preprocessedHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'iframe', 'figure', 'figcaption', 'picture', 'source' ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['style', 'class'],
      'iframe': ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
      'img': ['src', 'alt', 'width', 'height', 'srcset', 'sizes', 'loading', 'data-src', 'data-lazy-src'],
      'source': ['src', 'srcset', 'media', 'type']
    },
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'youtu.be', 'player.vimeo.com']
  });
};
