const express  = require('express');
const session  = require('express-session');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { db, formatProperty } = require('./database');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── ENSURE UPLOADS DIR ─────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ─── PASSWORDS ───────────────────────────────────────────────────────────────
const ADMIN_PASSWORD  = 'Admin@Gurmukh2025';

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'khanna-capital-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 12 * 60 * 60 * 1000 } // 12 hours
}));

// Serve static files (index:false so GET / is handled by explicit route below)
app.use(express.static(path.join(__dirname), { index: false }));
app.use('/uploads', express.static(uploadsDir));


// ─── FILE UPLOAD ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|pdf/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  }
});

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.session.adminLoggedIn) return next();
  return res.status(401).json({ error: 'Admin authentication required' });
}

// ─── DEEP DIVE HTML BUILDER ───────────────────────────────────────────────────
function buildDeepDiveHTML(data, uploadedGallery) {
  if (!data || Object.keys(data).length === 0) return '';

  const galleryImages = [
    ...(data.gallery_images || []),
    ...(uploadedGallery || []).map(f => '/uploads/' + f.filename)
  ];
  const hasGallery = galleryImages.length > 0 || data.video_url;
  const hasFeature = data.feature_title;
  const hasMarket  = data.market_title;
  const hasComp    = data.competitors && data.competitors.length > 0;

  let html = `<div style="margin-top:32px; border-top:1px solid var(--border2); padding-top:32px;">`;

  // ── Gallery Block ──────────────────────────────────────────────────────────
  if (hasGallery) {
    html += `
  <div class="modal-section-title">360° Property Showcase</div>
  <div style="margin-bottom:32px;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h4 style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--gold);margin:0;">
        ${data.gallery_title || 'Live Site & Exterior Renders'}
      </h4>
      <div style="display:flex; gap:12px; align-items:center;">
        ${data.handover ? `<span style="font-size:12px; color:var(--text3); border:1px solid var(--border); padding:4px 10px; border-radius:100px;">📅 Handover: ${data.handover}</span>` : ''}
        ${data.map_url   ? `<a href="${data.map_url}" target="_blank" style="font-size:12px; color:var(--gold); text-decoration:none; border:1px solid var(--border); padding:4px 10px; border-radius:100px; display:flex; align-items:center; gap:4px;">📍 View Map</a>` : ''}
      </div>
    </div>
    <div style="display:flex;gap:16px;overflow-x:auto;padding-bottom:16px;scroll-snap-type:x mandatory;">
      ${data.video_url ? `<video src="${data.video_url}" onclick="openLightbox('${data.video_url}',true)" onerror="this.style.display='none'" style="cursor:pointer;height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;"></video>` : ''}
      ${galleryImages.map(src => `<img src="${src}" onclick="openLightbox('${src}',false)" onerror="this.style.display='none'" style="cursor:pointer;height:240px;border-radius:12px;border:1px solid var(--border2);flex-shrink:0;scroll-snap-align:start;object-fit:cover;">`).join('')}
    </div>
  </div>`;
  }

  // ── Feature Block ─────────────────────────────────────────────────────────
  if (hasFeature || data.feature_image) {
    const bullets = Array.isArray(data.feature_bullets) ? data.feature_bullets : [];
    html += `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
    <div>
      ${data.feature_image_label ? `<h4 style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--gold);margin-bottom:12px;">${data.feature_image_label}</h4>` : ''}
      ${data.feature_image ? `<img src="${data.feature_image}" onclick="openLightbox('${data.feature_image}',false)" onerror="this.style.display='none'" style="cursor:pointer;width:100%;border-radius:12px;border:1px solid var(--border2);object-fit:cover;height:240px;">` : ''}
    </div>
    <div>
      ${data.feature_title ? `<h4 style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--gold);margin-bottom:12px;">${data.feature_title}</h4>` : ''}
      ${data.feature_desc ? `<p style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:12px;">${data.feature_desc}</p>` : ''}
      ${bullets.length > 0 ? `<ul style="font-size:13px;color:var(--text3);line-height:1.6;padding-left:16px;">${bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
    </div>
  </div>`;
  }

  // ── Market Data Block ─────────────────────────────────────────────────────
  if (hasMarket) {
    const pts = Array.isArray(data.market_data_points) ? data.market_data_points : [];
    html += `
  <div style="background:var(--glass);border-radius:12px;padding:24px;border:1px solid var(--border);margin-bottom:32px;">
    <h4 style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--text);margin-bottom:16px;">${data.market_title}</h4>
    ${data.market_desc ? `<p style="font-size:12px;color:var(--text2);margin-bottom:16px;">${data.market_desc}</p>` : ''}
    ${pts.length > 0 ? `
    <div style="display:grid;grid-template-columns:repeat(${pts.length},1fr);gap:16px;margin-bottom:16px;">
      ${pts.map(pt => `
      <div style="background:var(--dark3);padding:12px;border-radius:8px;border:1px solid var(--border2);">
        <div style="color:var(--text);font-size:12px;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">${pt.label}</div>
        <div style="color:var(--gold);font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;">${pt.value}</div>
        ${pt.subtitle ? `<div style="font-size:11px;color:var(--text3);margin-top:4px;">${pt.subtitle}</div>` : ''}
      </div>`).join('')}
    </div>` : ''}
    ${(data.market_image || data.roi_text) ? `
    <div style="display:flex;gap:16px;">
      ${data.market_image ? `<img src="${data.market_image}" onclick="openLightbox('${data.market_image}',false)" onerror="this.style.display='none'" style="cursor:pointer;height:120px;border-radius:8px;border:1px solid var(--border2);object-fit:cover;">` : ''}
      ${data.roi_text ? `<div style="flex:1;"><div style="color:var(--gold);font-size:16px;margin-bottom:4px;">📈 ROI Calculation</div><div style="font-size:12px;color:var(--text3);line-height:1.5;">${data.roi_text}</div></div>` : ''}
    </div>` : ''}
  </div>`;
  }

  // ── Competitor Analysis ───────────────────────────────────────────────────
  if (hasComp) {
    const comps = data.competitors;
    html += `
  <h4 style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--text);margin-bottom:16px;">Competitor Pricing Gap</h4>
  ${data.competitor_desc ? `<p style="font-size:12px;color:var(--text2);margin-bottom:16px;">${data.competitor_desc}</p>` : ''}
  <div style="display:grid;grid-template-columns:${comps.length > 1 ? '1fr '.repeat(Math.min(comps.length,2)).trim() : '1fr'};gap:16px;margin-bottom:24px;">
    ${comps.map(c => `
    <div style="background:var(--dark3);padding:16px;border-radius:8px;border:1px solid var(--border2);position:relative;">
      <div style="color:var(--text);font-size:12px;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">${c.name}</div>
      <div style="color:var(--red);font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;">${c.price_psf}</div>
      ${c.details ? `<div style="font-size:11px;color:var(--text3);margin-top:8px;">${c.details}</div>` : ''}
    </div>`).join('')}
  </div>`;

    if (data.arbitrage_title || data.arbitrage_body) {
      html += `
  <div style="background:rgba(201,168,76,0.1);padding:16px;border-radius:8px;border:1px solid var(--border);">
    ${data.arbitrage_title ? `<div style="color:var(--gold);font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:600;margin-bottom:4px;">${data.arbitrage_title}</div>` : ''}
    ${data.arbitrage_body  ? `<div style="font-size:12px;color:var(--text2);line-height:1.5;">${data.arbitrage_body}</div>` : ''}
  </div>`;
    }
  }

  html += `</div>`;
  return html;
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// ── Main Dashboard (Super Admin)
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ── Admin panel fallback
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ── Client portal
app.get('/:slug', (req, res) => {
  if (['api', 'admin', 'uploads', 'Research'].includes(req.params.slug) || req.params.slug.includes('.')) {
     return res.status(404).send('Not found');
  }
  res.sendFile(path.join(__dirname, 'portal.html'));
});

// ── Client password verify

app.post('/api/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, filename: req.file.filename });
});

app.post('/api/auth/verify', (req, res) => {
  const { password } = req.body;
  // Normalize slug: decode URI, replace spaces with hyphens, lowercase
  const slug = (req.body.slug || '').replace(/\s+/g, '-').toLowerCase();
  const client = db.getClientBySlug(slug);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  if (client.password === password) {
    req.session.clientSlug = slug;
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Incorrect password' });
});


// ── Admin login
app.post('/api/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    req.session.adminLoggedIn = true;
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Incorrect admin password' });
});

// ── Admin logout
app.post('/api/admin/logout', (req, res) => {
  req.session.adminLoggedIn = false;
  res.json({ success: true });
});

// ── Check admin auth
app.get('/api/admin/check', (req, res) => {
  res.json({ loggedIn: Boolean(req.session.adminLoggedIn) });
});

// ── Get all properties (filtered for client if slug provided)
app.get('/api/properties', (req, res) => {
  let rows = db.getAll();
  const rawSlug = req.query.clientSlug;
  if (rawSlug) {
    const slug = decodeURIComponent(rawSlug).replace(/\s+/g, '-').toLowerCase();
    const client = db.getClientBySlug(slug);
    if (client && client.assigned_properties) {
      rows = rows.filter(p => client.assigned_properties.includes(p.id));
    } else {
      rows = []; // Client not found or no properties
    }
  }
  res.json(rows.map(formatProperty));
});


// ── Get single property (admin)
app.get('/api/properties/:id', requireAdmin, (req, res) => {
  const row = db.getById(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(formatProperty(row));
});

// ── Create property (admin)
const propertyUpload = upload.fields([
  { name: 'image',   maxCount: 1  },
  { name: 'brochure',maxCount: 1  },
  { name: 'gallery', maxCount: 20 },
  { name: 'feature_image_file', maxCount: 1 },
  { name: 'market_image_file',  maxCount: 1 }
]);

app.post('/api/properties', requireAdmin, propertyUpload, (req, res) => {
  try {
    const b = req.body;
    const files = req.files || {};

    const imagePath    = files.image?.[0]?.filename   || null;
    const brochurePath = files.brochure?.[0]?.filename || null;

    // Parse deep dive data and resolve uploaded file paths
    let ddData = {};
    try { ddData = JSON.parse(b.deep_dive_data || '{}'); } catch {}

    if (files.feature_image_file?.[0]) ddData.feature_image = '/uploads/' + files.feature_image_file[0].filename;
    if (files.market_image_file?.[0])  ddData.market_image  = '/uploads/' + files.market_image_file[0].filename;

    const p = {
      name: b.name,
      developer: b.developer||'',
      location: b.location||'',
      location_short: b.location_short||'',
      type: b.type||'offplan',
      emoji: b.emoji||'🏢',
      phase: b.phase||'Phase 1',
      price_aed: parseInt(b.price_aed)||0,
      price_usd: parseInt(b.price_usd)||0,
      gross_yield: parseFloat(b.gross_yield)||0,
      capital_gain_5yr: parseInt(b.capital_gain_5yr)||0,
      annual_rental_usd: parseInt(b.annual_rental_usd)||0,
      down_payment: parseInt(b.down_payment)||0,
      distress: b.distress==='true'||b.distress===true,
      hot: b.hot==='true'||b.hot===true,
      image: imagePath,
      brochure: brochurePath,
      usps: b.usps||'[]',
      hot_usps: b.hot_usps||'[]',
      why: b.why||'[]',
      payment_plan: b.payment_plan||'[]',
      proj_values: b.proj_values||'[0,0,0,0,0,0]',
      unit_options: b.unit_options||null,
      deep_dive_data: JSON.stringify(ddData),
      sort_order: parseInt(b.sort_order)||0
    };

    const result = db.insert(p);

    res.json({ id: result.id, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Update property (admin)
app.put('/api/properties/:id', requireAdmin, propertyUpload, (req, res) => {
  try {
    const b    = req.body;
    const id   = req.params.id;
    const files = req.files || {};
    const existing = db.getById(id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const imagePath    = b.remove_image === 'true' ? null : (files.image?.[0]?.filename    || existing.image);
    const brochurePath = b.remove_brochure === 'true' ? null : (files.brochure?.[0]?.filename || existing.brochure);

    let ddData = {};
    try { ddData = JSON.parse(b.deep_dive_data || existing.deep_dive_data || '{}'); } catch {}
    if (files.feature_image_file?.[0]) ddData.feature_image = '/uploads/' + files.feature_image_file[0].filename;
    if (files.market_image_file?.[0])  ddData.market_image  = '/uploads/' + files.market_image_file[0].filename;

    // Handle gallery images — append to existing in ddData
    if (files.gallery?.length) {
      ddData.gallery_images = [
        ...(ddData.gallery_images || []),
        ...files.gallery.map(f => '/uploads/' + f.filename)
      ];
    }

    const updates = {
      name: b.name,
      developer: b.developer||'',
      location: b.location||'',
      location_short: b.location_short||'',
      type: b.type||'offplan',
      emoji: b.emoji||'🏢',
      phase: b.phase||'Phase 1',
      price_aed: parseInt(b.price_aed)||0,
      price_usd: parseInt(b.price_usd)||0,
      gross_yield: parseFloat(b.gross_yield)||0,
      capital_gain_5yr: parseInt(b.capital_gain_5yr)||0,
      annual_rental_usd: parseInt(b.annual_rental_usd)||0,
      down_payment: parseInt(b.down_payment)||0,
      distress: b.distress==='true'||b.distress===true,
      hot: b.hot==='true'||b.hot===true,
      image: imagePath,
      brochure: brochurePath,
      usps: b.usps||'[]',
      hot_usps: b.hot_usps||'[]',
      why: b.why||'[]',
      payment_plan: b.payment_plan||'[]',
      proj_values: b.proj_values||'[0,0,0,0,0,0]',
      unit_options: b.unit_options||null,
      deep_dive_data: JSON.stringify(ddData),
      sort_order: parseInt(b.sort_order)||0
    };

    db.update(id, updates);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Delete property (admin)
app.delete('/api/properties/:id', requireAdmin, (req, res) => {
  db.delete(req.params.id);
  res.json({ success: true });
});

// ── Generate deep dive HTML preview (admin)
app.post('/api/properties/preview-deepdive', requireAdmin, (req, res) => {
  const html = buildDeepDiveHTML(req.body.deep_dive_data || {}, []);
  res.json({ html });
});

// ── Get deep dive HTML for a property (called by frontend)
app.get('/api/properties/:id/deepdive', (req, res) => {
  const row = db.getById(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const ddData = JSON.parse(row.deep_dive_data || '{}');
  const html = buildDeepDiveHTML(ddData, []);
  res.json({ html });
});

// ── Client Info 
app.get('/api/client-info/:slug', (req, res) => {
  const slug = decodeURIComponent(req.params.slug).replace(/\s+/g, '-').toLowerCase();
  const c = db.getClientBySlug(slug);
  if (!c) return res.status(404).json({ error: 'Not found' });

  
  const payload = { 
    name: c.name, 
    budget: c.budget,
    budget_label: c.budget_label,
    metric_1_label: c.metric_1_label, metric_1_value: c.metric_1_value,
    metric_2_label: c.metric_2_label, metric_2_value: c.metric_2_value,
    metric_3_label: c.metric_3_label, metric_3_value: c.metric_3_value
  };

  if (c.agent_id) {
    const agent = db.getAgentById(c.agent_id);
    if (agent) payload.agent = agent;
  }
  
  payload.portfolio_heading = c.portfolio_heading;
  payload.portfolio_subheading = c.portfolio_subheading;
  payload.video_url = c.video_url;
  
  // Persistent state
  payload.portfolio_state = c.portfolio_state || [];
  payload.proposals_data = c.proposals_data || [];
  payload.chat_history = c.chat_history || [];

  res.json(payload);
});

// ── Client State Syncing & PDF Upload
app.post('/api/client-state/:slug', (req, res) => {
  const slug = decodeURIComponent(req.params.slug).replace(/\s+/g, '-').toLowerCase();
  const success = db.updateClientState(slug, req.body);
  if (success) res.json({ success: true });
  else res.status(404).json({ error: 'Client not found' });
});

app.post('/api/upload-pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = '/uploads/' + req.file.filename;
  res.json({ url });
});

app.post('/api/clients/:slug/clear', requireAdmin, (req, res) => {
  const slug = decodeURIComponent(req.params.slug).replace(/\s+/g, '-').toLowerCase();
  const success = db.clearClientData(slug);
  if (success) res.json({ success: true });
  else res.status(404).json({ error: 'Client not found' });
});

// ── Client CRUD (Admin)
app.get('/api/clients', requireAdmin, (req, res) => {
  res.json(db.getAllClients().map(c => { const {password, ...rest} = c; return rest; }));
});
app.get('/api/clients/:id', requireAdmin, (req, res) => {
  const c = db.getClientById(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(c);
});
app.post('/api/clients', requireAdmin, (req, res) => {
  const c = db.insertClient(req.body);
  res.json(c);
});
app.put('/api/clients/:id', requireAdmin, (req, res) => {
  db.updateClient(req.params.id, req.body);
  res.json({ success: true });
});
app.delete('/api/clients/:id', requireAdmin, (req, res) => {
  db.deleteClient(req.params.id);
  res.json({ success: true });
});

// ── Agent CRUD (Admin)
app.get('/api/agents', (req, res) => {
  res.json(db.getAllAgents());
});
app.get('/api/agents/:id', (req, res) => {
  const a = db.getAgentById(req.params.id);
  if (!a) return res.status(404).json({ error: 'Not found' });
  res.json(a);
});
app.post('/api/agents', requireAdmin, (req, res) => {
  const a = db.insertAgent(req.body);
  res.json(a);
});
app.put('/api/agents/:id', requireAdmin, (req, res) => {
  db.updateAgent(req.params.id, req.body);
  res.json({ success: true });
});
app.delete('/api/agents/:id', requireAdmin, (req, res) => {
  db.deleteAgent(req.params.id);
  res.json({ success: true });
});

// ── Analytics & Tracking
app.post('/api/track/view', (req, res) => {
  const { slug } = req.body;
  if (slug) db.logView(slug);
  res.json({ success: true });
});

app.post('/api/track/event', (req, res) => {
  const { type } = req.body;
  if (type) db.logEvent(type);
  res.json({ success: true });
});

app.get('/api/analytics', requireAdmin, (req, res) => {
  const data = db.getAnalytics();
  res.json({
    ...data,
    total_clients: db.getAllClients().length
  });
});

// ── Settings (Admin)
app.get('/api/settings', requireAdmin, (req, res) => {
  res.json(db.getSettings());
});
app.post('/api/settings', requireAdmin, (req, res) => {
  db.updateSettings(req.body);
  res.json({ success: true });
});

// ── Proposals
app.get('/api/proposals', requireAdmin, (req, res) => {
  res.json(db.getAllProposals());
});
app.post('/api/proposals', (req, res) => {
  const p = db.insertProposal(req.body);
  db.logEvent('proposal_sent');
  res.json(p);
});

// ── AI Chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { message, clientSlug, propertiesContext, history } = req.body;
    const settings = db.getSettings();
    if (!settings.google_api_key) {
      return res.status(400).json({ reply: 'AI Assistant is currently offline (API key not configured).' });
    }

    const ai = new GoogleGenAI({ apiKey: settings.google_api_key });

    const systemInstruction = `You are a highly professional luxury real estate personal assistant for BITSS Prestige Realty.
You act on behalf of the assigned agent to assist the client (${clientSlug}).
The client has a personalized portfolio of properties. Here is the context of their properties:
${JSON.stringify(propertiesContext)}

Guidelines:
1. Be polite, concise, and persuasive about Dubai real estate benefits (No tax, high yield, safe).
2. Answer questions specifically based on the properties in their portfolio.
3. Do not invent properties or prices that are not in the context.
4. If the client asks a complex question, wants to negotiate, or asks for something out of scope, politely suggest they use the "Send Proposal" button or contact their agent directly.
5. If they want to finalize or buy, tell them to click the "Request Proposal" button in the chat or on the sidebar.`;

    const chatHistory = (history || []).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    db.logChat(clientSlug, 'user', message);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7
      }
    });

    db.logChat(clientSlug, 'model', response.text);
    res.json({ reply: response.text });
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ reply: 'I am sorry, I am having trouble connecting to the servers right now. Please try again later.' });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n\n🏢 BITSS Prestige Realty Portal running at:');
  console.log(`  📱 Company Dashboard: http://localhost:${PORT}/`);
  console.log(`  🔗 Client Portals:    http://localhost:${PORT}/:client-slug`);
  console.log(`\n  Admin password:   Admin@Gurmukh2025\n`);
});
