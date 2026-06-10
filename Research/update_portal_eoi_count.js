const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html';
let html = fs.readFileSync(filePath, 'utf8');

const oldWhy = /\{icon:'⏳',title:'Pre-Launch EOI Window',desc:'Launch is mid-June. Allocation happens soon. We need to lock the EOI to secure Studios or 2BRs before public inventory gets wiped out.'\},/;
const newWhy = `{icon:'⏳',title:'Pre-Launch EOI Window',desc:'Over 500+ EOIs received in 10 days. Launch is mid-June. We need to lock the EOI immediately to secure Studios or 2BRs before allocation closes.'},`;

html = html.replace(oldWhy, newWhy);
fs.writeFileSync(filePath, html);
console.log('Replaced successfully');