const fs = require('fs');
const filePath = 'C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html';
let html = fs.readFileSync(filePath, 'utf8');

// The regex replace failed because of spacing or exact matching on the img tags.
// Let's replace the entire block manually.

const oldBlock = `        <img src="Research/extra1.png" style="height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">
        <img src="Research/extra2.png" style="height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">
        <img src="Research/extra3.png" style="height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">`;

html = html.replace(oldBlock, '');

// Also let's fix the header exactly as it appears
const oldHeader = `<h4 style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--gold);margin-bottom:12px;">Live Site & Media Gallery</h4>`;
const newHeader = `
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
    <h4 style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--gold);margin:0;">Live Site & Exterior Renders</h4>
    <div style="display:flex; gap:12px; align-items:center;">
        <span style="font-size:12px; color:var(--text3); border:1px solid var(--border); padding:4px 10px; border-radius:100px;">📅 Handover: Q1 2029</span>
        <a href="https://maps.app.goo.gl/KB3iK2axbgYHSFf59" target="_blank" style="font-size:12px; color:var(--gold); text-decoration:none; border:1px solid var(--border); padding:4px 10px; border-radius:100px; display:flex; align-items:center; gap:4px;">📍 View Map</a>
    </div>
</div>
`;

html = html.replace(oldHeader, newHeader);

fs.writeFileSync(filePath, html);
console.log('Fixed exactly');