const fs = require('fs');

let file2 = 'src/app/api/admin/sync-brvt/route.ts';
let c2 = fs.readFileSync(file2, 'utf8');
c2 = c2.replace(/let articles = \[\];/g, 'let articles: any[] = [];');
fs.writeFileSync(file2, c2);

let file4 = 'src/app/sitemap.ts';
let c4 = fs.readFileSync(file4, 'utf8');
c4 = c4.replace(/'weekly' as const/g, '"daily"');
c4 = c4.replace(/'daily' as const/g, '"daily"');
c4 = c4.replace(/"weekly"/g, '"daily"');
c4 = c4.replace(/'weekly'/g, '"daily"');
fs.writeFileSync(file4, c4);
