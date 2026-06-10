const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html';
let html = fs.readFileSync(filePath, 'utf8');

// 1. Add modalDeepDive div
if (!html.includes('id="modalDeepDive"')) {
    html = html.replace(
        /<div class="why-grid" id="modalWhyGrid"><\/div>\s*<\/div>\s*<\/div>/,
        '<div class="why-grid" id="modalWhyGrid"></div></div></div><div id="modalDeepDive" style="padding: 0 32px 32px 32px;"></div>'
    );
}

// 2. Add an ID to the actions container in the modal footer so we can append buttons
if (!html.includes('id="modalActionBtns"')) {
    html = html.replace(
        /<button class="btn-primary" id="modalAddBtn"/,
        '<div id="modalActionBtns" style="display:flex;gap:12px;"><button class="btn-primary" id="modalAddBtn"'
    );
    html = html.replace(
        /onclick="modalAddToBundle\(\)">Add to Portfolio<\/button>/,
        'onclick="modalAddToBundle()">Add to Portfolio</button></div>'
    );
}

// 3. Update the Raw District property with image, brochure, and a detailed 360 view layout
const oldPropRegex = /id:2, name:'Raw District'[\s\S]*?projValues:\[176000,195000,215000,235000,255000,280000\],/;
const deepDiveHTML = `
<div style="margin-top:32px; border-top:1px solid var(--border2); padding-top:32px;">
    <div class="modal-section-title">360° Property Showcase</div>
    
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
        <div>
            <h4 style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--gold);margin-bottom:12px;">Architectural Render</h4>
            <img src="Research/render1.jpg" style="width:100%;border-radius:12px;border:1px solid var(--border2);object-fit:cover;height:240px;">
        </div>
        <div>
            <h4 style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--gold);margin-bottom:12px;">The Raw Collection</h4>
            <p style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:12px;">
                "Where Art Meets Use." Every apartment comes fully furnished with bespoke sculptural pieces. The lobby features permanent installations including a vintage Porsche 911, Dodge Charger, and kinetic furniture like the Vortex Spun Chair.
            </p>
            <ul style="font-size:13px;color:var(--text3);line-height:1.6;padding-left:16px;">
                <li><strong>Honest Materials:</strong> Raw timber, exposed rebar, and embossed chrome.</li>
                <li><strong>Kintsugi Lighting:</strong> Gold/brass lighting set into cracked concrete.</li>
                <li><strong>Turnkey Luxury:</strong> Custom "Soft Landing" sofas and floating leather chairs.</li>
            </ul>
        </div>
    </div>
    
    <div style="background:var(--glass);border-radius:12px;padding:24px;border:1px solid var(--border);">
        <h4 style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--text);margin-bottom:16px;">The Investor\'s Edge</h4>
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;">
            <div>
                <div style="color:var(--gold);font-size:18px;margin-bottom:4px;">🚇 Direct Bridge</div>
                <div style="font-size:12px;color:var(--text3);">Unmatched SZR Metro access. The absolute highest tier of rental desirability.</div>
            </div>
            <div>
                <div style="color:var(--gold);font-size:18px;margin-bottom:4px;">🔑 Raw Stay</div>
                <div style="font-size:12px;color:var(--text3);">Operated internally by Imtiaz. Pure passive income with zero management hassle.</div>
            </div>
            <div>
                <div style="color:var(--gold);font-size:18px;margin-bottom:4px;">💸 40% Leverage</div>
                <div style="font-size:12px;color:var(--text3);">Pay 40% of the asset over 3 years AFTER handover using the rental income.</div>
            </div>
        </div>
    </div>
</div>
`.replace(/\n/g, '').replace(/'/g, "\\'");

const newProp = `id:2, name:'Raw District', developer:'Imtiaz Developments', location:'Sheikh Zayed Road, Downtown Jebel Ali', locationShort:'SZR / Jebel Ali',
    type:'offplan', emoji:'🏗️', phase:'Phase 1',
    image: 'Research/render2.jpg',
    brochure: 'Research/Raw_District_Brochure.pdf',
    deepDive: '${deepDiveHTML}',
    priceUSD:176000, priceAED:649000,
    grossYield:10.5, capitalGain5yr:45, annualRentalUSD:18480,
    downPayment:20, paymentPlan:[{l:'On Booking',p:24,phase:'Now'},{l:'Construction',p:35,phase:'Quarterly'},{l:'Handover',p:5,phase:'Q1 2029'},{l:'Post Handover',p:40,phase:'3 Yrs (3.3%/Q)'}],
    distress:false, hot:true,
    usps:['Submit EOI Now','Launch: Mid June','3-Yr Post Handover','Direct Metro Bridge'],
    hotUsps:['40% Post Handover','AED 649K Entry'],
    why:[
      {icon:'🌟',title:'Azizi Baseline Premium',desc:'The Azizi plot next door establishes baseline rental yields, but Imtiaz superior urban lifestyle build quality guarantees a rental premium.'},
      {icon:'⏳',title:'Pre-Launch EOI Window',desc:'Over 500+ EOIs received in 10 days. Launch is mid-June. We need to lock the EOI immediately to secure Studios or 2BRs before allocation closes.'},
      {icon:'📈',title:'Underpriced SZR Entry',desc:'Other recent SZR launches hit the market at much higher psf. AED 649K for an SZR address with metro access is instant built-in equity.'},
      {icon:'🏨',title:'Raw Stay Management',desc:'Turnkey hospitality model. Imtiaz owns and operates the serviced apartments, ensuring premium yields over long-term lets.'},
    ],
    projValues:[176000,195000,215000,235000,255000,280000],`;

html = html.replace(oldPropRegex, newProp);

// 4. Update openModal to use the new properties
const oldHeroLine = /document\.getElementById\('modalHeroImg'\)\.innerHTML=`<span style="background:\$\{getBg\(p\.id\)\};position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:120px">\$\{p\.emoji\}<\/span>`;/;
const newHeroLine = `
  if(p.image) {
    document.getElementById('modalHeroImg').innerHTML=\`<img src="\${p.image}" style="width:100%;height:100%;object-fit:cover;">\`;
  } else {
    document.getElementById('modalHeroImg').innerHTML=\`<span style="background:\${getBg(p.id)};position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:120px">\${p.emoji}</span>\`;
  }
`;
html = html.replace(oldHeroLine, newHeroLine);

// Inject deepDive html & brochure button
const oldClassListAdd = /document\.getElementById\('modalOverlay'\)\.classList\.add\('open'\);/;
const newClassListAdd = `
  document.getElementById('modalDeepDive').innerHTML = p.deepDive || '';
  
  const actionBtns = document.getElementById('modalActionBtns');
  // Remove existing brochure btn if any
  const existingBtn = document.getElementById('modalBrochureBtn');
  if(existingBtn) existingBtn.remove();
  
  if(p.brochure) {
    const broBtn = document.createElement('a');
    broBtn.id = 'modalBrochureBtn';
    broBtn.href = p.brochure;
    broBtn.target = '_blank';
    broBtn.className = 'btn-secondary';
    broBtn.style.textDecoration = 'none';
    broBtn.style.display = 'flex';
    broBtn.style.alignItems = 'center';
    broBtn.style.padding = '14px 24px';
    broBtn.innerHTML = '📄 View HD Brochure';
    actionBtns.prepend(broBtn);
  }
  
  document.getElementById('modalOverlay').classList.add('open');
`;
if (!html.includes("p.deepDive || ''")) {
    html = html.replace(oldClassListAdd, newClassListAdd);
}

fs.writeFileSync(filePath, html);
console.log('Update Complete');