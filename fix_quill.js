const fs = require('fs');
let content = fs.readFileSync('src/app/(admin)/admin/components/ArticleEditor.tsx', 'utf8');

const newModules = `  const modules = React.useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }, { 'font': [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        [{ 'color': [] }, { 'background': [] }, { 'align': [] }],
        ['clean']
      ],
      handlers: {
        image: customImageHandler
      }
    },
    clipboard: {
      matchVisual: false 
    }
  }), []);`;

content = content.replace(/const modules = React\.useMemo\(\(\) => \(\{[\s\S]*?\}\), \[\]\);/, newModules);

const toolbarStart = '<div id="custom-toolbar"';
const reactQuillStart = '<ReactQuill';

const startIdx = content.indexOf(toolbarStart);
const endIdx = content.indexOf(reactQuillStart);

if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + content.substring(endIdx);
}

fs.writeFileSync('src/app/(admin)/admin/components/ArticleEditor.tsx', content);
