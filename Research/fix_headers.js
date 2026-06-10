const fs = require('fs');
const filePath = 'C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html';
let html = fs.readFileSync(filePath, 'utf8');

// Fix the right header to include the close button
const oldHeader = `<div class="bundle-header">
 <h2>My Portfolio</h2>
 <p style="font-size:13px;color:var(--text3);margin-top:4px">Build your Phase 1 allocation</p>
 </div>`;
const oldHeaderAlt = `<div class="bundle-header"> <h2>My Portfolio</h2> <p style="font-size:13px;color:var(--text3);margin-top:4px">Build your Phase 1 allocation</p> </div>`;

const newHeader = `<div class="bundle-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
 <div>
   <h2>My Portfolio</h2>
   <p style="font-size:13px;color:var(--text3);margin-top:4px">Build your Phase 1 allocation</p>
 </div>
 <button onclick="closeBundle()" style="background:transparent; border:none; color:var(--text2); font-size:24px; cursor:pointer; padding:4px;">&times;</button>
</div>`;

// If re.sub squeezed spaces
html = html.replace(/<div class="bundle-header">\s*<h2>My Portfolio<\/h2>\s*<p[^>]*>Build your Phase 1 allocation<\/p>\s*<\/div>/g, newHeader);

// Ensure there are no leftover bottom close buttons in right drawer
html = html.replace(/<button class="bundle-close-btn"[^>]*>.*?<\/button>/g, '');

fs.writeFileSync(filePath, html);
console.log('Fixed headers');
