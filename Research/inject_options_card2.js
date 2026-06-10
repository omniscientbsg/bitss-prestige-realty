const fs = require('fs');
const filePath = 'C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html';
let html = fs.readFileSync(filePath, 'utf8');

if (!html.includes('unitOptions')) {
  const newId2Start = `id:2, name:'Raw District', developer:'Imtiaz Developments', location:'Sheikh Zayed Road, Downtown Jebel Ali', locationShort:'SZR / Jebel Ali',
   type:'offplan', emoji:'🏗️', phase:'Phase 1',
   unitOptions: [
     { label: 'Studio (380 Sq.Ft)', priceAED: 649000, yield: 10.5 },
     { label: '1 Bed (610 Sq.Ft)', priceAED: 889000, yield: 9.8 },
     { label: '2 Bed (1,054 Sq.Ft)', priceAED: 1400000, yield: 9.2 },
     { label: '3 Bed (1,400 Sq.Ft)', priceAED: 1900000, yield: 8.9 },
     { label: 'Office (700 Sq.Ft)', priceAED: 1200000, yield: 11.2 },
     { label: 'Retail (1,000 Sq.Ft)', priceAED: 2500000, yield: 12.5 }
   ],
   selectedOption: 0,`;

  html = html.replace(/id:2,\s*name:'Raw District'.*?phase:'Phase 1',/s, newId2Start);
}

const oldCardHtmlRegex = /<div class="prop-price-row">\s*<div class="prop-price">\$\{formatAED\(p\.priceAED\)\}<\/div>\s*<div class="notax">0% Tax<\/div>\s*<\/div>\s*<div class="card-actions">/s;

const newCardHtml = `<div class="prop-price-row">
   <div class="prop-price">\${formatAED(p.unitOptions ? p.unitOptions[p.selectedOption || 0].priceAED : p.priceAED)}</div>
   <div class="notax">0% Tax</div>
   </div>
   \${p.unitOptions ? \`
    <div style="margin-top:12px;">
      <select style="width:100%; padding:8px 12px; background:var(--dark4); border:1px solid var(--border2); color:var(--text); border-radius:6px; font-family:'DM Sans', sans-serif; cursor:pointer; appearance:none;" onchange="updateUnitOption(\${p.id}, this.value); event.stopPropagation();">
        \${p.unitOptions.map((opt, idx) => \`<option value="\${idx}" \${(p.selectedOption || 0) === idx ? 'selected' : ''}>\${opt.label}</option>\`).join('')}
      </select>
    </div>
   \` : ''}
   <div class="card-actions">`;

html = html.replace(oldCardHtmlRegex, newCardHtml);

if (!html.includes('function updateUnitOption')) {
  const updateUnitOptionFunc = `function updateUnitOption(id, optionIndex) {
    const p = PROPERTIES.find(x => x.id === id);
    if(!p || !p.unitOptions) return;
    p.selectedOption = parseInt(optionIndex);
    
    // Update the base property values so the bundle logic uses the new numbers
    p.priceAED = p.unitOptions[p.selectedOption].priceAED;
    p.grossYield = p.unitOptions[p.selectedOption].yield;
    
    // Re-render
    const activeBtn = document.querySelector('.phase-btn.active');
    const filter = activeBtn ? (activeBtn.textContent.includes('Ready') ? 'ready' : (activeBtn.textContent.includes('All') ? 'all' : 'offplan')) : 'all';
    renderProps(filter);
    
    // Also re-render Modal if open
    if(currentModal && currentModal.id === id) {
        document.getElementById('modalPrice').innerHTML = formatAED(p.priceAED);
        const stats = document.querySelectorAll('.stat-card .val');
        if(stats.length > 0) stats[0].textContent = p.grossYield + '%';
    }
    
    updateBudgetBar();
    renderBundlePanel();
}
function renderProps`;

  html = html.replace('function renderProps', updateUnitOptionFunc);
}

fs.writeFileSync(filePath, html);
console.log('Unit options drop-down added correctly');