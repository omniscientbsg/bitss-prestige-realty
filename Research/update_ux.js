const fs = require('fs');
const filePath = 'C:/Users/Admin/Documents/Prateek Khanna/prateek-investment-portal.html';
let html = fs.readFileSync(filePath, 'utf8');

// 1. Add Lightbox HTML & CSS
const lightboxCSS = `
.lightbox-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.95);
    z-index: 9999;
    display: none;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
}
.lightbox-overlay.open {
    display: flex;
}
.lightbox-content {
    max-width: 90%;
    max-height: 90vh;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    object-fit: contain;
}
.lightbox-close {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
    background: rgba(255,255,255,0.1);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s;
}
.lightbox-close:hover {
    background: rgba(255,255,255,0.2);
}
</style>`;
html = html.replace('</style>', lightboxCSS);

const lightboxHTML = `
<!-- LIGHTBOX -->
<div class="lightbox-overlay" id="lightboxOverlay" onclick="closeLightbox()">
    <button class="lightbox-close">&times;</button>
    <div id="lightboxContainer"></div>
</div>
</body>`;
html = html.replace('</body>', lightboxHTML);

const lightboxJS = `
function openLightbox(src, isVideo) {
    const container = document.getElementById('lightboxContainer');
    if (isVideo) {
        container.innerHTML = '<video src="'+src+'" controls autoplay class="lightbox-content" onclick="event.stopPropagation()"></video>';
    } else {
        container.innerHTML = '<img src="'+src+'" class="lightbox-content" onclick="event.stopPropagation()">';
    }
    document.getElementById('lightboxOverlay').classList.add('open');
}
function closeLightbox() {
    document.getElementById('lightboxOverlay').classList.remove('open');
    document.getElementById('lightboxContainer').innerHTML = ''; // Stop video playback
}
</script>`;
html = html.replace('</script>', lightboxJS);

// 2. Update Gallery items to open Lightbox
html = html.replace(/<video src="(.*?)" controls/g, '<video src="$1" onclick="openLightbox(\'$1\', true)" style="cursor:pointer;"');
html = html.replace(/<img src="(Research\/.*?)" style="/g, '<img src="$1" onclick="openLightbox(\'$1\', false)" style="cursor:pointer; ');
html = html.replace(/<img src="Research\/render1\.jpg" style="height:240px;border-radius:12px;border:1px solid var\(--border2\);flex-shrink:0;scroll-snap-align:start;object-fit:cover;"/g, '<img src="Research/render1.jpg" onclick="openLightbox(\'Research/render1.jpg\', false)" style="cursor:pointer; height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;"');


// 3. Make whole card clickable and fix "Add to Portfolio" button
const oldCardHTML = `
        <div class="card-actions">
          <button class="btn-primary" onclick="openModal(\${p.id})">View Deal →</button>
          <button class="btn-add \${inBundle?'added':''}" id="add-\${p.id}" onclick="toggleBundle(\${p.id})">\${inBundle?'✓':'+'}$</button>
        </div>
      </div>
    \`;
    grid.appendChild(card);
`;

const newCardHTML = `
        <div class="card-actions">
          <button class="btn-primary" style="flex:1" onclick="openModal(\${p.id}); event.stopPropagation();">View Details</button>
          <button class="btn-secondary \${inBundle?'added':''}" id="add-\${p.id}" onclick="toggleBundle(\${p.id}); event.stopPropagation();" style="flex:1; border: 1px solid var(--gold); background: \${inBundle?'rgba(201,168,76,0.15)':'transparent'}; color: \${inBundle?'var(--gold)':'var(--text2)'};">\${inBundle?'✓ Added':'Add to Portfolio'}</button>
        </div>
      </div>
    \`;
    card.onclick = () => openModal(p.id);
    grid.appendChild(card);
`;

html = html.replace(oldCardHTML, newCardHTML);

// 4. Add Cross Icon to Drawer Top Right
// Also ensure drawer is fully scrollable by applying overflow-y to bundle-panel if not already handled perfectly.
const oldDrawerHeader = `<div class="bundle-header">
      <h2>Portfolio Setup</h2>`;

const newDrawerHeader = `<div class="bundle-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <h2>Portfolio Setup</h2>`;

const oldDrawerHeaderEnd = `<p style="color:var(--text2);font-size:14px;">Select assets to build Prateek's Phase 1 structure.</p>
    </div>`;

const newDrawerHeaderEnd = `<p style="color:var(--text2);font-size:14px;">Select assets to build Prateek's Phase 1 structure.</p>
      </div>
      <button onclick="document.getElementById('bundlePanel').classList.remove('open')" style="background:transparent; border:none; color:var(--text2); font-size:24px; cursor:pointer; padding:4px;">&times;</button>
    </div>`;

html = html.replace(oldDrawerHeader, newDrawerHeader);
html = html.replace(oldDrawerHeaderEnd, newDrawerHeaderEnd);

// Ensure bundle-panel has overflow-y:auto
html = html.replace('.bundle-panel{position:fixed;', '.bundle-panel{overflow-y:auto; position:fixed;');

fs.writeFileSync(filePath, html);
console.log('Done UX updates');
