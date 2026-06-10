const fs = require('fs');
const filePath = 'C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html';
let html = fs.readFileSync(filePath, 'utf8');

// 1. Fix the homepage card image
const oldPlaceholder = /<div class="prop-img-placeholder" style="background:\$\{getBg\(p\.id\)\}">\$\{p\.emoji\}<\/div>/;
const newPlaceholder = '${p.image ? `<img src="${p.image}" class="prop-img">` : `<div class="prop-img-placeholder" style="background:${getBg(p.id)}">${p.emoji}</div>`}';
html = html.replace(oldPlaceholder, newPlaceholder);

// 2. Add scrollable gallery and video to deepDive HTML
const scrollableGalleryHTML = `
<div style="margin-bottom:32px;">
    <h4 style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--gold);margin-bottom:12px;">Live Site & Media Gallery</h4>
    <div style="display:flex;gap:16px;overflow-x:auto;padding-bottom:16px;scroll-snap-type:x mandatory;">
        <video src="Research/live-site.mp4" controls style="height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;"></video>
        <img src="Research/render1.jpg" style="height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">
        <img src="Research/extra1.png" style="height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">
        <img src="Research/extra2.png" style="height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">
        <img src="Research/extra3.png" style="height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">
    </div>
</div>
`.replace(/\n/g, '').replace(/'/g, "\\'");

// We need to inject this into the existing deepDive string.
// Let's just completely replace the deepDive property for id:2.
const newDeepDiveHTML = `
<div style="margin-top:32px; border-top:1px solid var(--border2); padding-top:32px;">
    <div class="modal-section-title">360° Property Showcase</div>
    ${scrollableGalleryHTML}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
        <div>
            <h4 style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--gold);margin-bottom:12px;">Architectural Render</h4>
            <img src="Research/render2.jpg" style="width:100%;border-radius:12px;border:1px solid var(--border2);object-fit:cover;height:240px;">
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
        <h4 style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--text);margin-bottom:16px;">The Investor\\'s Edge</h4>
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
`.replace(/\n/g, ''); // leave single quotes alone because we'll build a regex carefully, wait, actually better to just replace the substring

html = html.replace(/deepDive:\s*'.*?',/, `deepDive: '${newDeepDiveHTML}',`);

// Also add styling for the scrollbar if needed, but horizontal native scroll is fine.

fs.writeFileSync(filePath, html);
console.log('Fixed image and added gallery');