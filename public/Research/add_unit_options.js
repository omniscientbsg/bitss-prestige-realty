const fs = require('fs');
const filePath = 'C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html';
let html = fs.readFileSync(filePath, 'utf8');

// We need to add an options array to the Raw District property (id: 2).
const oldPropsStart = `id:2, name:'Raw District', developer:'Imtiaz Developments', location:'Sheikh Zayed Road, Downtown Jebel Ali', locationShort:'SZR / Jebel Ali',
   type:'offplan', emoji:'🏗️', phase:'Phase 1',
   image: 'Research/render2.jpg',
   brochure: 'Research/Raw_District_Brochure.pdf',`;

const newPropsStart = `id:2, name:'Raw District', developer:'Imtiaz Developments', location:'Sheikh Zayed Road, Downtown Jebel Ali', locationShort:'SZR / Jebel Ali',
   type:'offplan', emoji:'🏗️', phase:'Phase 1',
   image: 'Research/render2.jpg',
   brochure: 'Research/Raw_District_Brochure.pdf',
   unitOptions: [
     { label: 'Studio (380 Sq.Ft)', priceAED: 649000, yield: 10.5 },
     { label: '1 Bed (610 Sq.Ft)', priceAED: 889000, yield: 9.8 },
     { label: '2 Bed (1,054 Sq.Ft)', priceAED: 1400000, yield: 9.2 },
     { label: '3 Bed (1,400 Sq.Ft)', priceAED: 1900000, yield: 8.9 },
     { label: 'Office (700 Sq.Ft)', priceAED: 1200000, yield: 11.2 },
     { label: 'Retail (1,000 Sq.Ft)', priceAED: 2500000, yield: 12.5 }
   ],
   selectedOption: 0,`;

html = html.replace(oldPropsStart, newPropsStart);

// We also need to add a dropdown selector on the card if `p.unitOptions` exists.
// Look for renderProps:
const oldCardHtml = `<div class="prop-price-row">
   <div class="prop-price"><span>AED</span> \${formatAED(p.priceAED)}</div>
   </div>
   <div class="card-actions">
   <button class="btn-primary" onclick="openModal(\${p.id})">Deep Dive</button>
   <button class="btn-secondary" onclick="window.open('\${p.brochure||'#'}', '_blank')">Brochure</button>
   <button id="add-\${p.id}" class="btn-add\${inBundle?' added':''}" onclick="toggleBundle(\${p.id})">\${inBundle?'&times;':'+'}</button>
   </div>
   </div>
   </div>\`;
   }).join('');`;

// We inject a `<select>` if unitOptions exist. We need an onchange to update the global property object, re-render cards, and update bundle if it's already in the bundle.
const newCardHtml = `<div class="prop-price-row">
   <div class="prop-price" id="price-\${p.id}"><span>AED</span> \${formatAED(p.unitOptions ? p.unitOptions[p.selectedOption || 0].priceAED : p.priceAED)}</div>
   </div>
   \${p.unitOptions ? \`
    <div style="margin-top:12px;">
      <select style="width:100%; padding:8px 12px; background:var(--dark4); border:1px solid var(--border2); color:var(--text); border-radius:6px; font-family:'DM Sans', sans-serif; cursor:pointer; appearance:none;" onchange="updateUnitOption(\${p.id}, this.value)">
        \${p.unitOptions.map((opt, idx) => \`<option value="\${idx}" \${p.selectedOption === idx ? 'selected' : ''}>\${opt.label} - AED \${formatAED(opt.priceAED)}</option>\`).join('')}
      </select>
    </div>
   \` : ''}
   <div class="card-actions">
   <button class="btn-primary" onclick="openModal(\${p.id})">Deep Dive</button>
   <button class="btn-secondary" onclick="window.open('\${p.brochure||'#'}', '_blank')">Brochure</button>
   <button id="add-\${p.id}" class="btn-add\${inBundle?' added':''}" onclick="toggleBundle(\${p.id})">\${inBundle?'&times;':'+'}</button>
   </div>
   </div>
   </div>\`;
   }).join('');`;

html = html.replace(oldCardHtml, newCardHtml);

// We need to inject the `updateUnitOption` function
const updateUnitOptionFunc = `
function updateUnitOption(id, optionIndex) {
  const p = PROPERTIES.find(x => x.id === id);
  if(!p || !p.unitOptions) return;
  p.selectedOption = parseInt(optionIndex);
  
  // Update the base property values so the bundle logic uses the new numbers
  p.priceAED = p.unitOptions[p.selectedOption].priceAED;
  p.grossYield = p.unitOptions[p.selectedOption].yield;
  
  // Re-render
  renderProps(document.querySelector('.phase-btn.active').textContent.includes('Ready') ? 'ready' : (document.querySelector('.phase-btn.active').textContent.includes('All') ? 'all' : 'offplan'));
  updateBudgetBar();
  renderBundlePanel();
}
`;
html = html.replace('function renderProps(filter=\'all\'){', updateUnitOptionFunc + '\nfunction renderProps(filter=\'all\'){');

fs.writeFileSync(filePath, html);
console.log('Unit options injected');