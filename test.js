
// ── STATE ────────────────────────────────────────────────────────────────────
let editingId = null;
let properties = [];

// ── AUTH ─────────────────────────────────────────────────────────────────────
async function doAdminLogin() {
  const pw = document.getElementById('adminPassInput').value;
  try {
    const r = await fetch('/api/admin/login', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pw})});
    if (r.ok) {
      document.getElementById('loginOverlay').style.display = 'none';
      document.getElementById('sidebar').style.display = 'flex';
      document.getElementById('main').style.display = 'block';
      loadProperties();
    } else {
      document.getElementById('loginErr').textContent = 'Wrong password. Try again.';
    }
  } catch { document.getElementById('loginErr').textContent = 'Server error — is the server running?'; }
}

async function doLogout() {
  await fetch('/api/admin/logout',{method:'POST'});
  location.reload();
}

// Check session on load
(async () => {
  const r = await fetch('/api/admin/check');
  const data = await r.json();
  if (data.loggedIn) {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('sidebar').style.display = 'flex';
    document.getElementById('main').style.display = 'block';
    loadProperties();
  }
})();

// ── NAVIGATION ───────────────────────────────────────────────────────────────
function showPage(page, btn) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('propertiesPage').style.display = page === 'properties' ? '' : 'none';
  document.getElementById('dashboardPage').style.display = page === 'dashboard' ? '' : 'none';
  if (page === 'dashboard') renderDashboard();
}

// ── LOAD PROPERTIES ───────────────────────────────────────────────────────────
async function loadProperties() {
  const r = await fetch('/api/properties');
  properties = await r.json();
  renderList();
}

function renderList() {
  const list = document.getElementById('propList');
  if (!properties.length) { list.innerHTML = '<div style="color:var(--text3);text-align:center;padding:40px">No properties yet. Click "+ Add Property" to get started.</div>'; return; }
  list.innerHTML = properties.map(p => `
    <div class="prop-row">
      <div class="prop-row-thumb" style="cursor:pointer" onclick="openLightbox('${p.image}')">
        ${p.image ? `<img src="${p.image}" onerror="this.style.display='none'">` : `<span style="font-size:28px">${p.emoji||'🏢'}</span>`}
      </div>
      <div class="prop-row-info">
        <div class="prop-row-name">${p.emoji||''} ${p.name}</div>
        <div class="prop-row-sub">${p.developer} · ${p.location_short}</div>
        <div class="prop-row-badges">
          <span class="badge badge-${p.distress?'distress':p.type}">${p.distress?'🔥 Distress':p.type==='ready'?'✅ Ready':'🏗️ Off-Plan'}</span>
          ${p.hot?'<span class="badge badge-hot">⭐ Hot</span>':''}
          ${p.deep_dive_data && Object.keys(p.deep_dive_data).length>0?'<span class="badge" style="background:rgba(74,158,255,0.1);color:var(--blue);border:1px solid rgba(74,158,255,0.3)">📸 Deep Dive</span>':''}
          ${p.unit_options?'<span class="badge" style="background:rgba(155,89,182,0.1);color:#9B59B6;border:1px solid rgba(155,89,182,0.3)">🏠 Multi-Unit</span>':''}
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0;margin-right:16px">
        <div class="prop-row-price">AED ${(p.price_aed||0).toLocaleString()}</div>
        <div class="prop-row-yield">${p.gross_yield}% yield · +${p.capital_gain_5yr}% cap gain</div>
      </div>
      <div class="prop-row-actions">
        <button class="btn-edit" onclick="editProperty(${p.id})">✏️ Edit</button>
        <button class="btn-danger" onclick="deleteProperty(${p.id},'${p.name.replace(/'/g,"\\'")}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function renderDashboard() {
  const totalAED = properties.reduce((s,p) => s+p.price_aed, 0);
  const avgYield = properties.length ? (properties.reduce((s,p) => s+p.gross_yield,0)/properties.length).toFixed(1) : 0;
  const distress = properties.filter(p => p.distress).length;
  document.getElementById('dashStats').innerHTML = `
    <div class="stat-card"><div class="stat-card-val">${properties.length}</div><div class="stat-card-lbl">Total Properties</div></div>
    <div class="stat-card"><div class="stat-card-val">AED ${(totalAED/1000000).toFixed(1)}M</div><div class="stat-card-lbl">Total Portfolio Value</div></div>
    <div class="stat-card"><div class="stat-card-val">${avgYield}%</div><div class="stat-card-lbl">Avg Gross Yield</div></div>
    <div class="stat-card"><div class="stat-card-val">${distress}</div><div class="stat-card-lbl">Distress Deals</div></div>
  `;
}

// ── FORM ───────────────────────────────────────────────────────────────────────
function openForm() {
  editingId = null;
  document.getElementById('formTitle').textContent = 'Add Property';
  document.getElementById('propForm').reset();
  resetDynamicLists();
  document.getElementById('formOverlay').classList.add('open');
}

function closeForm() {
  document.getElementById('formOverlay').classList.remove('open');
  editingId = null;
}

async function editProperty(id) {
  const r = await fetch(`/api/properties/${id}`);
  const p = await r.json();
  editingId = id;
  document.getElementById('formTitle').textContent = 'Edit Property';
  populateForm(p);
  document.getElementById('formOverlay').classList.add('open');
}

function populateForm(p) {
  document.getElementById('propId').value = p.id;
  document.getElementById('f_name').value = p.name||'';
  document.getElementById('f_developer').value = p.developer||'';
  document.getElementById('f_location').value = p.location||'';
  document.getElementById('f_location_short').value = p.location_short||'';
  document.getElementById('f_type').value = p.type||'offplan';
  document.getElementById('f_emoji').value = p.emoji||'🏢';
  document.getElementById('f_phase').value = p.phase||'Phase 1';
  document.getElementById('f_price_aed').value = p.price_aed||'';
  document.getElementById('f_price_usd').value = p.price_usd||'';
  document.getElementById('f_gross_yield').value = p.gross_yield||'';
  document.getElementById('f_cap_gain').value = p.capital_gain_5yr||'';
  document.getElementById('f_down').value = p.down_payment||'';
  document.getElementById('f_rental').value = p.annual_rental_usd||'';
  document.getElementById('f_sort_order').value = p.sort_order||0;
  setToggle('t_distress','f_distress', p.distress);
  setToggle('t_hot','f_hot', p.hot);
  // Projections
  const pv = Array.isArray(p.proj_values) ? p.proj_values : [0,0,0,0,0,0];
  document.querySelectorAll('.proj-val').forEach(inp => { inp.value = pv[parseInt(inp.dataset.yr)]||''; });
  // Dynamic lists
  resetDynamicLists();
  (Array.isArray(p.hot_usps)?p.hot_usps:[]).forEach(u => addUsp('hotUspList','hot_usps',u));
  (Array.isArray(p.usps)?p.usps:[]).forEach(u => addUsp('uspList','usps',u));
  (Array.isArray(p.why)?p.why:[]).forEach(w => addWhy(w));
  (Array.isArray(p.payment_plan)?p.payment_plan:[]).forEach(pp => addPP(pp));
  // Unit options
  if (p.unit_options && p.unit_options.length) {
    setToggle('t_units','f_units_enabled', true);
    document.getElementById('unitOptionsSection').style.display = 'block';
    p.unit_options.forEach(u => addUnit(u));
  }

  document.getElementById('f_remove_image').value = 'false';
  document.getElementById('f_remove_brochure').value = 'false';

  // Previews
  document.getElementById('imgPreview').innerHTML = p.image ? `<div style="position:relative;display:inline-block;"><img src="${p.image}" class="preview-thumb" onclick="openLightbox('${p.image}')" style="cursor:pointer"><button type="button" class="del" onclick="removeMainImage()" title="Remove">×</button></div>` : '';
  document.getElementById('brochurePreview').innerHTML = p.brochure ? `<div style="position:relative;display:inline-block;padding:8px;border:1px solid var(--border2);border-radius:6px;background:var(--dark3);text-align:center;"><div class="preview-pdf" style="cursor:pointer" onclick="openLightbox('${p.brochure}')">📄</div><div style="font-size:11px;color:var(--text3);margin-top:4px">View PDF</div><button type="button" class="del" onclick="removeBrochure()" title="Remove" style="top:-8px;right:-8px">×</button></div>` : '';

  // Deep dive
  const dd = p.deep_dive_data || {};
  if (dd && Object.keys(dd).length > 0) {
    setToggle('t_dd','f_dd_enabled', true);
    document.getElementById('deepDiveSection').style.display = 'block';
    populateDeepDive(dd);
  }
}

function removeMainImage() { document.getElementById('imgPreview').innerHTML = ''; document.getElementById('f_remove_image').value = 'true'; }
function removeBrochure() { document.getElementById('brochurePreview').innerHTML = ''; document.getElementById('f_remove_brochure').value = 'true'; }

function populateDeepDive(dd) {
  setField('dd_gallery_title', dd.gallery_title);
  setField('dd_handover', dd.handover);
  setField('dd_map_url', dd.map_url);
  setField('dd_video_url', dd.video_url);
  setField('dd_feature_title', dd.feature_title);
  setField('dd_feature_image_label', dd.feature_image_label);
  setField('dd_feature_desc', dd.feature_desc);
  setField('dd_feature_bullets', Array.isArray(dd.feature_bullets) ? dd.feature_bullets.join('\n') : '');
  setField('dd_market_title', dd.market_title);
  setField('dd_market_desc', dd.market_desc);
  setField('dd_roi_text', dd.roi_text);
  setField('dd_comp_desc', dd.competitor_desc);
  setField('dd_arb_title', dd.arbitrage_title);
  setField('dd_arb_body', dd.arbitrage_body);
  (dd.market_data_points||[]).forEach(pt => addMarketPoint(pt));
  (dd.competitors||[]).forEach(c => addCompetitor(c));

  document.getElementById('dd_existing_feature_image').value = dd.feature_image || '';
  document.getElementById('dd_existing_market_image').value = dd.market_image || '';
  document.getElementById('dd_existing_gallery_images').value = JSON.stringify(Array.isArray(dd.gallery_images) ? dd.gallery_images : []);

  // Deep dive previews
  document.getElementById('featureImgPreview').innerHTML = dd.feature_image ? `<div style="position:relative;display:inline-block;"><img src="${dd.feature_image}" class="preview-thumb" style="cursor:pointer" onclick="openLightbox('${dd.feature_image}')"><button type="button" class="del" onclick="removeFeatureImage()" title="Remove">×</button></div>` : '';
  document.getElementById('marketImgPreview').innerHTML = dd.market_image ? `<div style="position:relative;display:inline-block;"><img src="${dd.market_image}" class="preview-thumb" style="cursor:pointer" onclick="openLightbox('${dd.market_image}')"><button type="button" class="del" onclick="removeMarketImage()" title="Remove">×</button></div>` : '';
  
  renderExistingGallery();
}

function removeFeatureImage() { document.getElementById('featureImgPreview').innerHTML = ''; document.getElementById('dd_existing_feature_image').value = ''; }
function removeMarketImage() { document.getElementById('marketImgPreview').innerHTML = ''; document.getElementById('dd_existing_market_image').value = ''; }

function renderExistingGallery() {
  const arr = JSON.parse(document.getElementById('dd_existing_gallery_images').value || '[]');
  let html = '';
  arr.forEach((src, idx) => {
    const isVideo = src.endsWith('.mp4') || src.endsWith('.webm');
    const content = isVideo 
      ? `<video src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;cursor:pointer" onclick="openLightbox('${src}')"></video>`
      : `<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;cursor:pointer" onclick="openLightbox('${src}')">`;
    
    html += `<div class="gallery-item" style="position:relative;">
      ${content}
      <button type="button" class="del" onclick="removeExistingGalleryItem(${idx})" title="Remove">×</button>
    </div>`;
  });
  document.getElementById('existingGalleryPreview').innerHTML = html;
}

function removeExistingGalleryItem(idx) {
  const arr = JSON.parse(document.getElementById('dd_existing_gallery_images').value || '[]');
  arr.splice(idx, 1);
  document.getElementById('dd_existing_gallery_images').value = JSON.stringify(arr);
  renderExistingGallery();
}

function setField(id, val) { const el = document.getElementById(id); if(el) el.value = val||''; }

function resetDynamicLists() {
  ['hotUspList','uspList','whyList','ppList','unitList','marketPointsList','competitorList'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  document.getElementById('imgPreview').innerHTML = '';
  document.getElementById('brochurePreview').innerHTML = '';
  document.getElementById('f_remove_image').value = 'false';
  document.getElementById('f_remove_brochure').value = 'false';
  document.getElementById('galleryPreview').innerHTML = '';
  document.getElementById('featureImgPreview').innerHTML = '';
  document.getElementById('marketImgPreview').innerHTML = '';
  document.getElementById('dd_existing_feature_image').value = '';
  document.getElementById('dd_existing_market_image').value = '';
  document.getElementById('dd_existing_gallery_images').value = '[]';
  document.getElementById('existingGalleryPreview').innerHTML = '';
  setToggle('t_distress','f_distress',false);
  setToggle('t_hot','f_hot',false);
  setToggle('t_units','f_units_enabled',false);
  setToggle('t_dd','f_dd_enabled',false);
  document.getElementById('unitOptionsSection').style.display='none';
  document.getElementById('deepDiveSection').style.display='none';
}

// ── TOGGLES ───────────────────────────────────────────────────────────────────
function toggleSwitch(switchId, hiddenId) {
  const sw = document.getElementById(switchId);
  const hd = document.getElementById(hiddenId);
  const on = !sw.classList.contains('on');
  sw.classList.toggle('on', on);
  hd.value = on.toString();
}
function setToggle(switchId, hiddenId, on) {
  const sw = document.getElementById(switchId);
  const hd = document.getElementById(hiddenId);
  if (!sw||!hd) return;
  sw.classList.toggle('on', !!on);
  hd.value = (!!on).toString();
}
function toggleDeepDive() {
  const on = document.getElementById('f_dd_enabled').value === 'true';
  document.getElementById('deepDiveSection').style.display = on ? 'block' : 'none';
}

// ── DYNAMIC LIST HELPERS ─────────────────────────────────────────────────────
function addUsp(listId, hiddenId, value='') {
  const li = document.createElement('div');
  li.className = 'dynamic-item';
  li.innerHTML = `<input type="text" class="field-input" placeholder="USP text" value="${escHtml(value)}" oninput="syncList('${listId}','${hiddenId}')">
  <button type="button" class="remove-btn" onclick="this.closest('.dynamic-item').remove();syncList('${listId}','${hiddenId}')">×</button>`;
  document.getElementById(listId).appendChild(li);
  syncList(listId, hiddenId);
}

function syncList(listId, hiddenId) {
  const items = [...document.getElementById(listId).querySelectorAll('input')].map(i => i.value.trim()).filter(Boolean);
  document.getElementById(hiddenId).value = JSON.stringify(items);
}

function addWhy(w={}) {
  const li = document.createElement('div');
  li.className = 'dynamic-item';
  li.innerHTML = `<div class="dynamic-item-fields" style="display:grid;grid-template-columns:60px 1fr 2fr;gap:8px;width:100%">
    <input type="text" class="field-input" placeholder="🏢" value="${escHtml(w.icon||'')}" style="font-size:18px;text-align:center" oninput="syncWhy()">
    <input type="text" class="field-input" placeholder="Title" value="${escHtml(w.title||'')}" oninput="syncWhy()">
    <input type="text" class="field-input" placeholder="Description" value="${escHtml(w.desc||'')}" oninput="syncWhy()">
  </div>
  <button type="button" class="remove-btn" onclick="this.closest('.dynamic-item').remove();syncWhy()">×</button>`;
  document.getElementById('whyList').appendChild(li);
  syncWhy();
}
function syncWhy() {
  const items = [...document.getElementById('whyList').querySelectorAll('.dynamic-item')].map(d => {
    const [icon,title,desc] = d.querySelectorAll('input');
    return {icon:icon.value, title:title.value, desc:desc.value};
  }).filter(w=>w.title);
  document.getElementById('why').value = JSON.stringify(items);
}

function addPP(pp={}) {
  const li = document.createElement('div');
  li.className = 'dynamic-item';
  li.innerHTML = `<div class="dynamic-item-fields" style="display:grid;grid-template-columns:2fr 80px 1fr;gap:8px;width:100%">
    <input type="text" class="field-input" placeholder="Milestone label" value="${escHtml(pp.l||'')}" oninput="syncPP()">
    <input type="number" class="field-input" placeholder="%" value="${pp.p||''}" oninput="syncPP()">
    <input type="text" class="field-input" placeholder="Phase/date" value="${escHtml(pp.phase||'')}" oninput="syncPP()">
  </div>
  <button type="button" class="remove-btn" onclick="this.closest('.dynamic-item').remove();syncPP()">×</button>`;
  document.getElementById('ppList').appendChild(li);
  syncPP();
}
function syncPP() {
  const items = [...document.getElementById('ppList').querySelectorAll('.dynamic-item')].map(d => {
    const [l,p,phase] = d.querySelectorAll('input');
    return {l:l.value, p:parseFloat(p.value)||0, phase:phase.value};
  }).filter(p=>p.l);
  document.getElementById('payment_plan').value = JSON.stringify(items);
}

function addUnit(u={}) {
  const li = document.createElement('div');
  li.className = 'dynamic-item';
  li.innerHTML = `<div class="dynamic-item-fields" style="display:grid;grid-template-columns:2fr 1fr 80px;gap:8px;width:100%">
    <input type="text" class="field-input" placeholder="Studio (380 Sq.Ft)" value="${escHtml(u.label||'')}" oninput="syncUnits()">
    <input type="number" class="field-input" placeholder="Price AED" value="${u.priceAED||''}" oninput="syncUnits()">
    <input type="number" step="0.1" class="field-input" placeholder="Yield%" value="${u.yield||''}" oninput="syncUnits()">
  </div>
  <button type="button" class="remove-btn" onclick="this.closest('.dynamic-item').remove();syncUnits()">×</button>`;
  document.getElementById('unitList').appendChild(li);
  syncUnits();
}
function syncUnits() {
  const enabled = document.getElementById('f_units_enabled').value === 'true';
  if (!enabled) { document.getElementById('unit_options').value = ''; return; }
  const items = [...document.getElementById('unitList').querySelectorAll('.dynamic-item')].map(d => {
    const [label,priceAED,yld] = d.querySelectorAll('input');
    return {label:label.value, priceAED:parseInt(priceAED.value)||0, yield:parseFloat(yld.value)||0};
  }).filter(u=>u.label);
  document.getElementById('unit_options').value = items.length ? JSON.stringify(items) : '';
}

function addMarketPoint(pt={}) {
  const li = document.createElement('div');
  li.className = 'dynamic-item';
  li.innerHTML = `<div class="dynamic-item-fields" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;width:100%">
    <input type="text" class="field-input" placeholder="Label (Studio Baseline)" value="${escHtml(pt.label||'')}">
    <input type="text" class="field-input" placeholder="Value (AED 55K)" value="${escHtml(pt.value||'')}">
    <input type="text" class="field-input" placeholder="Subtitle (391 sq.ft.)" value="${escHtml(pt.subtitle||'')}">
  </div>
  <button type="button" class="remove-btn" onclick="this.closest('.dynamic-item').remove()">×</button>`;
  document.getElementById('marketPointsList').appendChild(li);
}

function addCompetitor(c={}) {
  const li = document.createElement('div');
  li.className = 'dynamic-item';
  li.innerHTML = `<div class="dynamic-item-fields" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;width:100%">
    <input type="text" class="field-input" placeholder="Name (Sobha Central)" value="${escHtml(c.name||'')}">
    <input type="text" class="field-input" placeholder="Price/sqft (Avg AED 2,960 / sq.ft.)" value="${escHtml(c.price_psf||'')}">
    <input type="text" class="field-input" placeholder="Details (HTML ok)" value="${escHtml(c.details||'')}">
  </div>
  <button type="button" class="remove-btn" onclick="this.closest('.dynamic-item').remove()">×</button>`;
  document.getElementById('competitorList').appendChild(li);
}

// ── PROJECTIONS ───────────────────────────────────────────────────────────────
function syncProjections() {
  const vals = [...document.querySelectorAll('.proj-val')].map(i => parseInt(i.value)||0);
  document.getElementById('proj_values').value = JSON.stringify(vals);
}
document.querySelectorAll('.proj-val').forEach(i => i.addEventListener('input', syncProjections));

// ── FILE PREVIEWS ─────────────────────────────────────────────────────────────
function previewFile(input, previewId) {
  const prev = document.getElementById(previewId);
  prev.innerHTML = '';
  const file = input.files[0];
  if (!file) return;
  if (file.type === 'application/pdf') {
    prev.innerHTML = `<div class="preview-pdf">📄</div><div style="font-size:11px;color:var(--text3);margin-top:4px">${file.name}</div>`;
  } else {
    const img = document.createElement('img');
    img.className = 'preview-thumb';
    img.src = URL.createObjectURL(file);
    prev.appendChild(img);
  }
}

function previewGallery(input) {
  const prev = document.getElementById('galleryPreview');
  [...input.files].forEach(file => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    const isVid = file.type.startsWith('video');
    const content = isVid ? document.createElement('video') : document.createElement('img');
    content.src = URL.createObjectURL(file);
    item.appendChild(content);
    const del = document.createElement('button');
    del.className = 'del';
    del.innerHTML = '×';
    del.onclick = () => item.remove();
    item.appendChild(del);
    prev.appendChild(item);
  });
}

// ── COLLECT DEEP DIVE DATA ────────────────────────────────────────────────────
function collectDeepDive() {
  if (document.getElementById('f_dd_enabled').value !== 'true') return {};
  const g = id => (document.getElementById(id)||{}).value || '';
  // Market points
  const market_data_points = [...document.getElementById('marketPointsList').querySelectorAll('.dynamic-item')].map(d => {
    const [label,value,subtitle] = d.querySelectorAll('input');
    return {label:label.value, value:value.value, subtitle:subtitle.value};
  }).filter(p=>p.label);
  // Competitors
  const competitors = [...document.getElementById('competitorList').querySelectorAll('.dynamic-item')].map(d => {
    const [name,price_psf,details] = d.querySelectorAll('input');
    return {name:name.value, price_psf:price_psf.value, details:details.value};
  }).filter(c=>c.name);

  return {
    feature_image: document.getElementById('dd_existing_feature_image').value,
    market_image: document.getElementById('dd_existing_market_image').value,
    gallery_images: JSON.parse(document.getElementById('dd_existing_gallery_images').value || '[]'),
    gallery_title: g('dd_gallery_title'),
    handover: g('dd_handover'),
    map_url: g('dd_map_url'),
    video_url: g('dd_video_url'),
    feature_image_label: g('dd_feature_image_label'),
    feature_title: g('dd_feature_title'),
    feature_desc: g('dd_feature_desc'),
    feature_bullets: g('dd_feature_bullets').split('\n').map(s=>s.trim()).filter(Boolean),
    market_title: g('dd_market_title'),
    market_desc: g('dd_market_desc'),
    market_data_points,
    roi_text: g('dd_roi_text'),
    competitor_desc: g('dd_comp_desc'),
    competitors,
    arbitrage_title: g('dd_arb_title'),
    arbitrage_body: g('dd_arb_body'),
  };
}

// ── SAVE PROPERTY ─────────────────────────────────────────────────────────────
async function saveProperty() {
  syncProjections();
  syncUnits();

  const form = document.getElementById('propForm');
  const name = document.getElementById('f_name').value.trim();
  if (!name) { toast('Property name is required','error'); return; }

  document.getElementById('formStatus').textContent = 'Saving...';

  const fd = new FormData(form);
  fd.set('deep_dive_data', JSON.stringify(collectDeepDive()));
  fd.append('remove_image', document.getElementById('f_remove_image').value);
  fd.append('remove_brochure', document.getElementById('f_remove_brochure').value);

  const url    = editingId ? `/api/properties/${editingId}` : '/api/properties';
  const method = editingId ? 'PUT' : 'POST';

  try {
    const r = await fetch(url, { method, body: fd });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Server error');
    toast(editingId ? 'Property updated ✓' : 'Property added ✓', 'success');
    closeForm();
    loadProperties();
  } catch (err) {
    toast('Error: ' + err.message, 'error');
    document.getElementById('formStatus').textContent = err.message;
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
async function deleteProperty(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  const r = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
  if (r.ok) { toast('Deleted', 'success'); loadProperties(); }
  else toast('Failed to delete', 'error');
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function toast(msg, type='success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = type==='error' ? 'var(--red)' : 'var(--dark3)';
  t.className = `toast show ${type}`;
  setTimeout(()=>t.className='toast', 3000);
}

function openLightbox(src) {
  const lb = document.getElementById('mediaLightbox');
  const img = document.getElementById('lightboxImg');
  const vid = document.getElementById('lightboxVid');
  lb.style.display = 'flex';
  if (src.endsWith('.mp4') || src.endsWith('.webm')) {
    img.style.display = 'none';
    vid.style.display = 'block';
    vid.src = src;
    vid.play();
  } else if (src.endsWith('.pdf')) {
     window.open(src, '_blank');
     lb.style.display = 'none';
  } else {
    vid.style.display = 'none';
    vid.pause();
    img.style.display = 'block';
    img.src = src;
  }
}
function closeLightbox() {
  document.getElementById('mediaLightbox').style.display = 'none';
  document.getElementById('lightboxVid').pause();
}

// ── CLIENTS ──────────────────────────────────────────────────────────────────
let allClients = [];
async function loadClients() {
  const r = await fetch('/api/clients');
  if (r.ok) {
    allClients = await r.json();
    renderClients();
  }
}

async function loadProposals() {
  const r = await fetch('/api/proposals');
  if (r.ok) {
    const props = await r.json();
    const pList = document.getElementById('proposalsList');
    if (!props.length) {
      pList.innerHTML = '<div style="color:var(--text3);text-align:center;padding:40px">No proposals requested yet.</div>';
      return;
    }
    pList.innerHTML = props.map(p => {
      const d = new Date(p.created_at).toLocaleString();
      return `<div class="prop-row" style="flex-direction:column;align-items:flex-start;">
        <div style="width:100%;display:flex;justify-content:space-between;">
          <div class="prop-row-name">Proposal Request #${p.id}</div>
          <div class="prop-row-sub">${d}</div>
        </div>
        <div style="font-size:13px;color:var(--gold);margin-top:8px;">Client Slug: ${escHtml(p.clientSlug)}</div>
        ${p.message ? `<div style="background:var(--dark3);padding:12px;border-radius:8px;margin-top:12px;font-size:13px;font-style:italic;">"${escHtml(p.message)}"</div>` : ''}
        ${p.chatHistory && p.chatHistory.length > 0 ? `
        <div style="margin-top:16px;width:100%">
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;margin-bottom:8px;">Chat Transcript Prior to Proposal:</div>
          <div style="max-height:200px;overflow-y:auto;background:var(--dark3);border:1px solid var(--border2);border-radius:8px;padding:12px;font-size:12px;">
            ${p.chatHistory.map(m => `<div style="margin-bottom:8px;"><strong style="color:${m.role==='user'?'var(--blue)':'var(--green)'}">${m.role === 'user' ? 'Client' : 'AI'}:</strong> ${escHtml(m.text)}</div>`).join('')}
          </div>
        </div>` : ''}
      </div>`;
    }).join('');
  }
}

async function loadSettings() {
  const r = await fetch('/api/settings');
  if (r.ok) {
    const s = await r.json();
    document.getElementById('setting_google_api_key').value = s.google_api_key || '';
  }
}

async function saveSettings() {
  const payload = {
    google_api_key: document.getElementById('setting_google_api_key').value.trim()
  };
  const r = await fetch('/api/settings', { method: 'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
  if (r.ok) toast('Settings Saved', 'success');
  else toast('Failed to save settings', 'error');
}

function renderClients() {
  const cList = document.getElementById('clientList');
  if (!allClients.length) {
    cList.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text3)">No clients found. Add one above.</div>`;
    return;
  }
  cList.innerHTML = allClients.map(c => `
    <div class="prop-row">
      <div class="prop-row-thumb" style="font-size:24px;background:var(--dark3)">👤</div>
      <div class="prop-row-info">
        <div class="prop-row-name">${escHtml(c.name)}</div>
        <div class="prop-row-sub">Portal: <a href="/${c.slug}" target="_blank" style="color:var(--gold);text-decoration:none">/${c.slug}</a></div>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">Budget: AED ${c.budget.toLocaleString()} • ${c.assigned_properties?.length || 0} properties assigned</div>
      </div>
      <div class="prop-row-actions">
        <button class="btn-edit" onclick="editClient(${c.id})">Edit</button>
        <button class="btn-danger" onclick="deleteClient(${c.id}, '${escHtml(c.name)}')">Delete</button>
      </div>
    </div>
  `).join('');
}

let editingClientId = null;
function openClientForm() {
  editingClientId = null;
  document.getElementById('clientFormTitle').textContent = 'Add Client';
  document.getElementById('clientForm').reset();
  document.getElementById('c_slug').readOnly = false;
  document.getElementById('c_password').placeholder = 'Enter new password';
  document.getElementById('c_password').required = true;
  renderClientPropertiesSelection([]);
  document.getElementById('clientFormOverlay').classList.add('open');
}

async function editClient(id) {
  editingClientId = id;
  const r = await fetch(`/api/clients/${id}`);
  if (!r.ok) { toast('Error fetching client', 'error'); return; }
  const c = await r.json();
  document.getElementById('clientFormTitle').textContent = 'Edit Client';
  document.getElementById('clientId').value = c.id;
  document.getElementById('c_name').value = c.name;
  document.getElementById('c_slug').value = c.slug;
  document.getElementById('c_slug').readOnly = true; // prevent changing slug
  document.getElementById('c_password').value = '';
  document.getElementById('c_password').placeholder = 'Leave blank to keep same';
  document.getElementById('c_password').required = false;
  document.getElementById('c_budget').value = c.budget || 5000000;
  document.getElementById('c_budget_label').value = c.budget_label || 'Phase 1 Budget';
  document.getElementById('c_m1_l').value = c.metric_1_label || 'Market Avg. YoY Growth';
  document.getElementById('c_m1_v').value = c.metric_1_value || 'AED 91.8M';
  document.getElementById('c_m2_l').value = c.metric_2_label || 'Rental Yield Range';
  document.getElementById('c_m2_v').value = c.metric_2_value || '8–12%';
  document.getElementById('c_m3_l').value = c.metric_3_label || 'Capital Gains Tax';
  document.getElementById('c_m3_v').value = c.metric_3_value || '0%';
  populateAgentSelect(c.agent_id);
  
  renderClientPropertiesSelection(c.assigned_properties || []);
  document.getElementById('clientFormOverlay').classList.add('open');
}

function closeClientForm() {
  document.getElementById('clientFormOverlay').classList.remove('open');
}

function renderClientPropertiesSelection(assignedIds) {
  const cList = document.getElementById('c_properties_list');
  cList.innerHTML = properties.map(p => {
    const isAssigned = assignedIds.includes(p.id);
    return `
      <label class="dynamic-item" style="cursor:pointer; display:flex; align-items:center; gap:12px; padding:12px;">
        <input type="checkbox" name="assigned_properties" value="${p.id}" ${isAssigned ? 'checked' : ''} style="width:16px;height:16px;cursor:pointer;">
        <div>
          <div style="font-size:13px;font-weight:500;">${p.emoji} ${escHtml(p.name)}</div>
          <div style="font-size:11px;color:var(--text3);">${escHtml(p.location_short || p.location)} • ${p.price_aed ? 'AED '+p.price_aed.toLocaleString() : ''}</div>
        </div>
      </label>
    `;
  }).join('');
}

async function saveClient() {
  const form = document.getElementById('clientForm');
  if (!form.checkValidity()) { form.reportValidity(); return; }

  const name = document.getElementById('c_name').value.trim();
  const slug = document.getElementById('c_slug').value.trim();
  const password = document.getElementById('c_password').value;
  const budget = parseFloat(document.getElementById('c_budget').value) || 0;
  const portfolio_heading = document.getElementById('c_heading').value.trim();
  const portfolio_subheading = document.getElementById('c_subheading').value.trim();
  const video_url = document.getElementById('c_video_url').value.trim();
  
  const checkboxes = document.querySelectorAll('input[name="assigned_properties"]:checked');
  const assigned_properties = Array.from(checkboxes).map(cb => parseInt(cb.value));

  const budget_label = document.getElementById('c_budget_label').value.trim() || 'Phase 1 Budget';
  const agent_id = parseInt(document.getElementById('c_agent_id').value) || 1;
  const metric_1_label = document.getElementById('c_m1_l').value; const metric_1_value = document.getElementById('c_m1_v').value;
  const metric_2_label = document.getElementById('c_m2_l').value; const metric_2_value = document.getElementById('c_m2_v').value;
  const metric_3_label = document.getElementById('c_m3_l').value; const metric_3_value = document.getElementById('c_m3_v').value;

  const payload = { 
    name, slug, budget, budget_label, agent_id, assigned_properties,
    metric_1_label, metric_1_value, metric_2_label, metric_2_value, metric_3_label, metric_3_value,
    portfolio_heading, portfolio_subheading, video_url
  };
  if (password) payload.password = password; // Only send password if provided

  const url = editingClientId ? `/api/clients/${editingClientId}` : '/api/clients';
  const method = editingClientId ? 'PUT' : 'POST';

  const r = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (r.ok) {
    toast(editingClientId ? 'Client Updated' : 'Client Added', 'success');
    closeClientForm();
    loadClients();
  } else {
    const err = await r.json();
    toast(err.error || 'Failed to save client', 'error');
  }
}

async function deleteClient(id, name) {
  if (!confirm(`Delete client "${name}"? This cannot be undone.`)) return;
  const r = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
  if (r.ok) { toast('Client deleted', 'success'); loadClients(); }
  else toast('Failed to delete', 'error');
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
async function loadDashboard() {
  const r = await fetch('/api/analytics');
  if (r.ok) {
    const data = await r.json();
    document.getElementById('dashStats').innerHTML = `
      <div class="stat-card" style="background:var(--dark2);padding:24px;border-radius:12px;text-align:center">
        <div style="font-size:32px;color:var(--gold);font-family:'Cormorant Garamond',serif">${data.total_clients}</div>
        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-top:8px">Client Links</div>
      </div>
      <div class="stat-card" style="background:var(--dark2);padding:24px;border-radius:12px;text-align:center">
        <div style="font-size:32px;color:var(--gold);font-family:'Cormorant Garamond',serif">${data.total_views}</div>
        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-top:8px">Portal Views</div>
      </div>
      <div class="stat-card" style="background:var(--dark2);padding:24px;border-radius:12px;text-align:center">
        <div style="font-size:32px;color:var(--gold);font-family:'Cormorant Garamond',serif">${data.pdf_downloads}</div>
        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-top:8px">PDFs Generated</div>
      </div>
      <div class="stat-card" style="background:var(--dark2);padding:24px;border-radius:12px;text-align:center">
        <div style="font-size:32px;color:var(--gold);font-family:'Cormorant Garamond',serif">${data.proposals_requested}</div>
        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-top:8px">Proposals Sent</div>
      </div>
    `;

    const cv = data.client_views || {};
    document.getElementById('dashClientViews').innerHTML = Object.keys(cv).map(slug => `
      <tr style="border-top:1px solid var(--border)">
        <td style="padding:12px 16px"><a href="/${slug}" target="_blank" style="color:var(--gold);text-decoration:none">${slug}</a></td>
        <td style="padding:12px 16px">${cv[slug]} views</td>
      </tr>
    `).join('') || `<tr><td colspan="2" style="padding:16px;text-align:center;color:var(--text3)">No views yet.</td></tr>`;
  }
}

// ── AGENTS ───────────────────────────────────────────────────────────────────
let allAgents = [];
async function loadAgents() {
  const r = await fetch('/api/agents');
  if (r.ok) {
    allAgents = await r.json();
    renderAgents();
    populateAgentSelect();
  }
}

function renderAgents() {
  const aList = document.getElementById('agentList');
  if (!allAgents.length) {
    aList.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text3)">No agents found.</div>`;
    return;
  }
  aList.innerHTML = allAgents.map(a => `
    <div class="prop-row">
      <div class="prop-row-thumb" style="font-size:24px;background:var(--dark3);background-image:url('${escHtml(a.photo||'')}');background-size:cover;background-position:center">${a.photo?'':'👔'}</div>
      <div class="prop-row-info">
        <div class="prop-row-name">${escHtml(a.name)}</div>
        <div class="prop-row-sub">WA: +${escHtml(a.whatsapp)} • Email: ${escHtml(a.email)}</div>
      </div>
      <div class="prop-row-actions">
        <button class="btn-edit" onclick="editAgent(${a.id})">Edit</button>
        <button class="btn-danger" onclick="deleteAgent(${a.id}, '${escHtml(a.name)}')">Delete</button>
      </div>
    </div>
  `).join('');
}

let editingAgentId = null;
function openAgentForm() {
  editingAgentId = null;
  document.getElementById('agentFormTitle').textContent = 'Add Agent';
  document.getElementById('agentForm').reset();
  document.getElementById('agentFormOverlay').classList.add('open');
}

async function editAgent(id) {
  editingAgentId = id;
  const a = allAgents.find(x => x.id === id);
  if (!a) return;
  document.getElementById('agentFormTitle').textContent = 'Edit Agent';
  document.getElementById('a_name').value = a.name;
  document.getElementById('a_whatsapp').value = a.whatsapp;
  document.getElementById('a_email').value = a.email;
  document.getElementById('a_photo').value = a.photo || '';
  document.getElementById('agentFormOverlay').classList.add('open');
}

function closeAgentForm() {
  document.getElementById('agentFormOverlay').classList.remove('open');
}

async function saveAgent() {
  const form = document.getElementById('agentForm');
  if (!form.checkValidity()) { form.reportValidity(); return; }

  const payload = {
    name: document.getElementById('a_name').value.trim(),
    whatsapp: document.getElementById('a_whatsapp').value.trim(),
    email: document.getElementById('a_email').value.trim(),
    photo: document.getElementById('a_photo').value.trim(),
  };

  const url = editingAgentId ? `/api/agents/${editingAgentId}` : '/api/agents';
  const method = editingAgentId ? 'PUT' : 'POST';

  const r = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  if (r.ok) {
    toast(editingAgentId ? 'Agent Updated' : 'Agent Added', 'success');
    closeAgentForm();
    loadAgents();
  } else {
    toast('Failed to save agent', 'error');
  }
}

async function deleteAgent(id, name) {
  if (!confirm(`Delete agent "${name}"?`)) return;
  const r = await fetch(`/api/agents/${id}`, { method: 'DELETE' });
  if (r.ok) { toast('Deleted', 'success'); loadAgents(); }
}

function populateAgentSelect(selectedId) {
  const sel = document.getElementById('c_agent_id');
  if (!sel) return;
  sel.innerHTML = allAgents.map(a => `<option value="${a.id}">${escHtml(a.name)}</option>`).join('');
  if (selectedId) sel.value = selectedId;
}

function showPage(pageId, btn) {
  ['propertiesPage', 'dashboardPage', 'clientsPage', 'agentsPage', 'settingsPage', 'proposalsPage'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.style.display = 'none';
  });
  
  const target = document.getElementById(pageId + 'Page');
  if(target) target.style.display = 'block';
  
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');

  if (pageId === 'clients') { loadClients(); loadAgents(); }
  if (pageId === 'properties') loadProperties();
  if (pageId === 'agents') loadAgents();
  if (pageId === 'dashboard') loadDashboard();
  if (pageId === 'proposals') loadProposals();
  if (pageId === 'settings') loadSettings();
}

function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

