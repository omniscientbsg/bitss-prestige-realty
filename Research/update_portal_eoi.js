const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html';
let html = fs.readFileSync(filePath, 'utf8');

// The regex will find the payment plan we just wrote and replace it with urgency tags
const oldUsps = /usps:\['3-Yr Post Handover','Direct Metro Bridge','Raw Stay Operated','SZR Address'\],/;
const newUsps = `usps:['Submit EOI Now','Launch: Mid June','3-Yr Post Handover','Direct Metro Bridge'],`;
html = html.replace(oldUsps, newUsps);

const oldWhy = /\{icon:'🌟',title:'Azizi Baseline Premium',desc:'The Azizi plot next door establishes baseline rental yields, but Imtiaz superior urban lifestyle build quality guarantees a rental premium.'\},/;
const newWhy = `{icon:'🌟',title:'Azizi Baseline Premium',desc:'The Azizi plot next door establishes baseline rental yields, but Imtiaz superior urban lifestyle build quality guarantees a rental premium.'},
      {icon:'⏳',title:'Pre-Launch EOI Window',desc:'Launch is mid-June. Allocation happens soon. We need to lock the EOI to secure Studios or 2BRs before public inventory gets wiped out.'},`;
html = html.replace(oldWhy, newWhy);

fs.writeFileSync(filePath, html);
console.log('Replaced successfully');