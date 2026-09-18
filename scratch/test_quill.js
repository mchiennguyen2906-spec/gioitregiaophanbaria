const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="editor"></div></body></html>', {
  url: 'http://localhost'
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.MutationObserver = dom.window.MutationObserver;

const Quill = require('quill');

const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: ['video']
  }
});

// Simulate inserting video
const url = 'https://www.youtube.com/embed/SXIIy9t0qAA?showinfo=0';
// This is exactly what the toolbar does
const range = quill.getSelection(true);
quill.insertEmbed(range.index, 'video', url, 'user');

console.log('Quill HTML:', quill.root.innerHTML);
