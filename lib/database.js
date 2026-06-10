import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'database');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
const dbFile = path.join(dbDir, 'data.json');

// ─── INIT & SEED DATA ────────────────────────────────────────────────────────
let properties = [];
let clients = [];
let agents = [];
let analytics = {
  total_views: 0,
  pdf_downloads: 0,
  proposals_requested: 0,
  client_views: {} // { "slug": count }
};
let settings = {
  google_api_key: ''
};
let proposals = [];

function loadDB() {
  if (fs.existsSync(dbFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
      if (Array.isArray(data)) {
        // Legacy format migration
        properties = data;
        clients = [];
        agents = [];
        analytics = { total_views: 0, pdf_downloads: 0, proposals_requested: 0, client_views: {} };
        console.log('Migrating legacy data.json array to object format...');
      } else {
        properties = data.properties || [];
        clients = data.clients || [];
        agents = data.agents || [];
        analytics = data.analytics || { total_views: 0, pdf_downloads: 0, proposals_requested: 0, client_views: {} };
        settings = data.settings || { google_api_key: '' };
        proposals = data.proposals || [];
      }
    } catch (e) {
      console.error('Error reading db:', e);
      properties = [];
      clients = [];
      agents = [];
      analytics = { total_views: 0, pdf_downloads: 0, proposals_requested: 0, client_views: {} };
      settings = { google_api_key: '' };
      proposals = [];
    }
  }
  
  if (properties.length === 0) {
    console.log('🌱 Seeding database with initial properties...');
    const seedData = [
      {
        name: 'Sobha Hartland II', developer: 'Sobha Realty',
        location: 'Mohammed Bin Rashid City', location_short: 'MBR City',
        type: 'offplan', emoji: '🌿', phase: 'Phase 1',
        price_aed: 1762000, price_usd: 480000,
        gross_yield: 9.2, capital_gain_5yr: 48, annual_rental_usd: 44160,
        down_payment: 10, distress: false, hot: true,
        image: 'Research/sobha_hartland.jpg',
        usps: '["Lagoon Views","10% Down","RERA Registered","Handover Q3 2026"]',
        hot_usps: '["Pre-Launch Price","Only 10% Now"]',
        why: JSON.stringify([
          {icon:'📈',title:'15% Below Market',desc:'Pre-launch pricing locked before public sales open. Expect 15–20% gain at handover.'},
          {icon:'🏊',title:'Crystal Lagoon',desc:'Artificial lagoon + beach access drives premium short-term rental demand.'},
          {icon:'💰',title:'10% Secures It',desc:'AED 176K down payment to control a AED 1.76M asset. Maximum leverage.'},
          {icon:'📍',title:'MBR City Corridor',desc:"Under 10 minutes from Downtown Dubai. One of city's fastest-appreciating corridors."}
        ]),
        payment_plan: JSON.stringify([
          {l:'On Booking',p:10,phase:'Now'},
          {l:'Construction (12 Mths)',p:50,phase:'During Build'},
          {l:'On Handover',p:40,phase:'Q3 2026'}
        ]),
        proj_values: '[480000,518000,562000,612000,672000,720000]',
        unit_options: null,
        deep_dive_data: '{}',
        sort_order: 0
      },
      {
        name: 'Raw District', developer: 'Imtiaz Developments',
        location: 'Sheikh Zayed Road, Downtown Jebel Ali', location_short: 'SZR / Jebel Ali',
        type: 'offplan', emoji: '🏗️', phase: 'Phase 1',
        price_aed: 649000, price_usd: 176000,
        gross_yield: 10.5, capital_gain_5yr: 45, annual_rental_usd: 18480,
        down_payment: 20, distress: false, hot: true,
        image: 'Research/render2.jpg', brochure: 'Research/Raw_District_Brochure.pdf',
        usps: '["Submit EOI Now","Launch: Mid June","3-Yr Post Handover","Direct Metro Bridge"]',
        hot_usps: '["40% Post Handover","AED 649K Entry"]',
        why: JSON.stringify([
          {icon:'🌟',title:'Azizi Baseline Premium',desc:'The Azizi plot next door establishes baseline rental yields, but Imtiaz superior urban lifestyle build quality guarantees a rental premium.'},
          {icon:'⏳',title:'Pre-Launch EOI Window',desc:'Over 500+ EOIs received in 10 days. Launch is mid-June. We need to lock the EOI immediately to secure Studios or 2BRs before allocation closes.'},
          {icon:'📈',title:'Underpriced SZR Entry',desc:'Other recent SZR launches hit the market at much higher psf. AED 649K for an SZR address with metro access is instant built-in equity.'},
          {icon:'🏨',title:'Raw Stay Management',desc:'Turnkey hospitality model. Imtiaz owns and operates the serviced apartments, ensuring premium yields over long-term lets.'}
        ]),
        payment_plan: JSON.stringify([
          {l:'On Booking',p:24,phase:'Now'},
          {l:'Construction',p:35,phase:'Quarterly'},
          {l:'Handover',p:5,phase:'Q1 2029'},
          {l:'Post Handover',p:40,phase:'3 Yrs (3.3%/Q)'}
        ]),
        proj_values: '[176000,195000,215000,235000,255000,280000]',
        unit_options: JSON.stringify([
          {label:'Studio (380 Sq.Ft)', priceAED:649000, yield:10.5},
          {label:'1 Bed (610 Sq.Ft)', priceAED:889000, yield:9.8},
          {label:'2 Bed (1,054 Sq.Ft)', priceAED:1400000, yield:9.2},
          {label:'3 Bed (1,400 Sq.Ft)', priceAED:1900000, yield:8.9},
          {label:'Office (700 Sq.Ft)', priceAED:1200000, yield:11.2},
          {label:'Retail (1,000 Sq.Ft)', priceAED:2500000, yield:12.5}
        ]),
        deep_dive_data: JSON.stringify({
          gallery_title: 'Live Site & Exterior Renders',
          handover: 'Q1 2029',
          map_url: 'https://maps.app.goo.gl/KB3iK2axbgYHSFf59',
          video_url: 'Research/live-site.mp4',
          gallery_images: ['Research/render1.jpg','Research/raw_district_new_render.jpg','Research/raw_district_sketch.jpg'],
          feature_image: 'Research/render2.jpg',
          feature_title: 'The Raw Collection',
          feature_desc: '"Where Art Meets Use." Every apartment comes fully furnished with bespoke sculptural pieces. The lobby features permanent installations including a vintage Porsche 911, Dodge Charger, and kinetic furniture like the Vortex Spun Chair.',
          feature_bullets: [
            '<strong>Honest Materials:</strong> Raw timber, exposed rebar, and embossed chrome.',
            '<strong>Kintsugi Lighting:</strong> Gold/brass lighting set into cracked concrete.',
            '<strong>Turnkey Luxury:</strong> Custom "Soft Landing" sofas and floating leather chairs.'
          ],
          market_title: 'Verified Market Data (DXB Interact)',
          market_desc: 'Live rental contracts from <strong>Azizi Aura Residences</strong> (the immediate neighboring plot, non-premium build) registered in Feb 2026. Imtiaz\'s superior build and Raw Stay management guarantees a premium above these baselines.',
          market_data_points: [
            {label:'Studio Baseline', value:'AED 55K', subtitle:'391 sq.ft. (16th Flr)'},
            {label:'1-Bed Baseline', value:'AED 70K', subtitle:'694 sq.ft. (15th Flr)'},
            {label:'2-Bed Baseline', value:'AED 110K', subtitle:'Registered Contract'}
          ],
          market_image: 'Research/azizi_data.jpg',
          roi_text: 'At AED 649K entry for a Studio, capturing just the baseline AED 55K rent yields an <strong>8.4% gross ROI</strong>. With Imtiaz\'s turnkey \'Raw Stay\' hospitality model and direct metro bridge premium, targeting AED 65K+ is highly probable, pushing gross yields past <strong>10%</strong>. Add the 40% post-handover leverage, and the cash-on-cash return is exceptional.',
          competitor_desc: 'Comparative analysis against other recent Sheikh Zayed Road launches proves the aggressive underpricing of Raw District\'s entry point.',
          competitors: [
            {name:'Sobha Central', price_psf:'Avg AED 2,960 / sq.ft.', details:'1-Bed starting at <strong>AED 1.45M</strong><br>2-Bed starting at <strong>AED 2.48M</strong>'},
            {name:'Danube Shahrukhz', price_psf:'Avg AED 4,000 / sq.ft.', details:'Premium commercial SZR tower.<br>Trading up to AED 5,050 / sq.ft.'}
          ],
          arbitrage_title: 'The Imtiaz Arbitrage',
          arbitrage_body: 'Raw District is launching from <strong>AED 649K</strong> (~AED 1,700 / sq.ft.). This represents a massive <strong>40% to 50% discount</strong> per square foot compared to direct SZR competitors like Sobha Central, locking in immediate, undeniable day-one equity before the shovel even hits the dirt.'
        }),
        sort_order: 1
      },
      {
        name: 'Alef One Masdar City', developer: 'Alef Group',
        location: 'Masdar City, Abu Dhabi', location_short: 'Masdar City',
        type: 'offplan', emoji: '🌱', phase: 'Phase 1',
        price_aed: 1432000, price_usd: 390000,
        gross_yield: 8.5, capital_gain_5yr: 55, annual_rental_usd: 33150,
        down_payment: 15, distress: false, hot: true,
        image: 'Research/alef_masdar.jpg',
        usps: '["Sustainable City","Alef Group","Abu Dhabi Golden Visa","High Cap Gain"]',
        hot_usps: '["Unique Asset Class","55% 5Yr Gain Est."]',
        why: JSON.stringify([
          {icon:'🌍',title:'Sustainability Premium',desc:'Net-zero city. ESG-compliant assets command 15-20% rental premium. Future-proof investment.'},
          {icon:'🏆',title:'Alef Pedigree',desc:"Alef Group is Abu Dhabi's fastest-growing developer. Seamless delivery record."},
          {icon:'📋',title:'Golden Visa Eligible',desc:'Investment qualifies for UAE 10-Year Golden Visa. Strategic for portfolio holders.'},
          {icon:'🚀',title:'Masdar Expansion Phase',desc:'USD 1.5B infrastructure expansion underway. Capital appreciation play.'}
        ]),
        payment_plan: JSON.stringify([
          {l:'On Booking',p:15,phase:'Now'},
          {l:'Construction Milestones',p:40,phase:'Quarterly'},
          {l:'On Handover',p:45,phase:'Q1 2027'}
        ]),
        proj_values: '[390000,420000,462000,510000,565000,605000]',
        sort_order: 2
      },
      {
        name: 'DAMAC Bay by Cavalli', developer: 'DAMAC Properties',
        location: 'Dubai Harbour', location_short: 'Dubai Harbour',
        type: 'ready', emoji: '⛵', phase: 'Phase 1',
        price_aed: 2754000, price_usd: 750000,
        gross_yield: 8.1, capital_gain_5yr: 38, annual_rental_usd: 60750,
        down_payment: 100, distress: false, hot: false,
        image: 'Research/damac_bay.jpg',
        usps: '["Ready to Rent","Marina Views","Short-Term Permit","Cavalli Branded"]',
        hot_usps: '["Instant Rental Income","Premium Tenant Profile"]',
        why: JSON.stringify([
          {icon:'🎪',title:'Instant Cash Flow',desc:'Ready unit. List on Airbnb within 30 days. Start earning AED 250K+ per year immediately.'},
          {icon:'⚓',title:'Marina & Yacht Views',desc:'Unobstructed marina views. Premium nightly rates AED 1,200–2,500 on short-term.'},
          {icon:'👗',title:'Cavalli Brand Premium',desc:'Fashion-branded residences command 25-35% rental premium vs unbranded equivalents.'},
          {icon:'✈️',title:'2 Min from Airport Route',desc:'Dubai Harbour proximity means HNW tenant pool. Concierge lifestyle demand.'}
        ]),
        payment_plan: JSON.stringify([{l:'Full Payment',p:100,phase:'On Transfer'}]),
        proj_values: '[750000,795000,842000,892000,945000,1005000]',
        sort_order: 3
      },
      {
        name: 'DISTRESS: Marina Gate I', developer: 'Select Group',
        location: 'Dubai Marina', location_short: 'Dubai Marina',
        type: 'distress', emoji: '🏙️', phase: 'Phase 1',
        price_aed: 2277000, price_usd: 620000,
        gross_yield: 10.4, capital_gain_5yr: 32, annual_rental_usd: 64480,
        down_payment: 100, distress: true, hot: true,
        image: 'Research/marina_gate.jpg',
        usps: '["18% Below Market","Ready to Rent","Urgent Seller","Marina Views"]',
        hot_usps: '["Distress Deal","Instant Equity"]',
        why: JSON.stringify([
          {icon:'🚨',title:'18% Below Market Value',desc:"Seller motivated by overseas relocation. Comparable units traded at AED 2.77M last quarter. Instant equity day one."},
          {icon:'💵',title:'10.4% Gross Yield',desc:'Highest yield in the portfolio. Marina address commands AED 23K/month in rentals. Immediate income.'},
          {icon:'📊',title:"Dubai Marina Never Dips",desc:"Marina transactional volume up 34% YoY. One of Dubai's most liquid assets."},
          {icon:'⚡',title:'72hr Window',desc:'Distress pricing available for 72 hours. First mover advantage critical.'}
        ]),
        payment_plan: JSON.stringify([{l:'Full Payment on Transfer',p:100,phase:'Now'}]),
        proj_values: '[620000,650000,680000,710000,745000,820000]',
        sort_order: 4
      },
      {
        name: 'Sobha Seahaven Tower B', developer: 'Sobha Realty',
        location: 'Dubai Harbour', location_short: 'Dubai Harbour',
        type: 'ready', emoji: '🌊', phase: 'Phase 1',
        price_aed: 3287000, price_usd: 895000,
        gross_yield: 7.8, capital_gain_5yr: 35, annual_rental_usd: 69810,
        down_payment: 100, distress: false, hot: false,
        image: 'Research/sobha_seahaven.jpg',
        usps: '["Sobha Built","Sea Views","HNWI Tenant Profile","Low Supply Area"]',
        hot_usps: '["Trophy Asset","Instant Rental"]',
        why: JSON.stringify([
          {icon:'🏅',title:'Sobha Construction Quality',desc:'Zero-defect delivery record. Premium materials. Highest tenant retention rates in Dubai.'},
          {icon:'🌊',title:'Sea + Ain Dubai Views',desc:'Both sea-facing and Ain Dubai views. Dual-attraction premium of 20-30% over single view.'},
          {icon:'🎯',title:'HNWI Tenant Profile',desc:'Anchor tenants: tech executives, finance professionals. 24-month lease cycles reduce vacancy.'},
          {icon:'📉',title:'Low Supply Constraint',desc:'Dubai Harbour has fixed supply. 3,200 total units ever. Scarcity drives value.'}
        ]),
        payment_plan: JSON.stringify([{l:'Full Payment on Transfer',p:100,phase:'Now'}]),
        proj_values: '[895000,940000,988000,1040000,1100000,1210000]',
        sort_order: 5
      },
      {
        name: 'DISTRESS: Downtown Studio', developer: 'Emaar',
        location: 'Downtown Dubai', location_short: 'Downtown',
        type: 'distress', emoji: '🌃', phase: 'Phase 1',
        price_aed: 973000, price_usd: 265000,
        gross_yield: 11.2, capital_gain_5yr: 28, annual_rental_usd: 29680,
        down_payment: 100, distress: true, hot: true,
        image: 'Research/downtown_studio.jpg',
        usps: '["22% Below Market","Burj Khalifa View","Airbnb Permit","Emaar Built"]',
        hot_usps: '["Best Distress Deal","Highest Yield"]',
        why: JSON.stringify([
          {icon:'🔥',title:'22% Below Market — Best Deal',desc:"Probate sale. Market comp AED 1.25M. You pay AED 973K. Immediate AED 277K equity."},
          {icon:'🗼',title:'Burj Khalifa View',desc:"Direct Burj Khalifa view commands AED 3,500+/night on short-term. One of Dubai's most booked views."},
          {icon:'📲',title:"11.2% — Portfolio's Top Yield",desc:'At AED 973K investment, annual rental of AED 109K. Self-funding asset from month one.'},
          {icon:'🏗️',title:'Emaar Developer Premium',desc:'Emaar resale always commanded. Zero risk on quality. Institutional-grade build.'}
        ]),
        payment_plan: JSON.stringify([{l:'Full Payment',p:100,phase:'Now'}]),
        proj_values: '[265000,285000,305000,325000,345000,340000]',
        sort_order: 6
      },
      {
        name: 'Imtiyaz Azure Gardens', developer: 'Imtiyaz Developers',
        location: 'Arjan, Dubai', location_short: 'Arjan',
        type: 'offplan', emoji: '🌺', phase: 'Phase 1',
        price_aed: 771000, price_usd: 210000,
        gross_yield: 10.1, capital_gain_5yr: 45, annual_rental_usd: 21210,
        down_payment: 5, distress: false, hot: true,
        image: 'Research/azure_gardens.jpg',
        usps: '["5% Down — AED 38K","High ROI","Arjan Emerging","Garden District"]',
        hot_usps: '["Lowest Entry","Pre-Launch Price"]',
        why: JSON.stringify([
          {icon:'🌱',title:'Arjan: Next JVC Story',desc:'Arjan 3 years behind JVC in the cycle. Buy low, hold 3 years, sell premium. Proven pattern.'},
          {icon:'💸',title:'AED 38K Secures It',desc:'Lowest absolute entry in the portfolio. Perfect for portfolio diversification.'},
          {icon:'🏡',title:'Garden District Premium',desc:'Landscaped communities hold value better than towers. Family tenant demographic = longer leases.'},
          {icon:'📈',title:'10.1% Yield at Handover',desc:'Imtiyaz track record delivers 10%+ yield consistently across JVC portfolio.'}
        ]),
        payment_plan: JSON.stringify([
          {l:'On Booking',p:5,phase:'Now'},
          {l:'Construction',p:55,phase:'Monthly'},
          {l:'On Handover',p:40,phase:'Q2 2027'}
        ]),
        proj_values: '[210000,228000,252000,282000,315000,305000]',
        sort_order: 7
      }
    ];
    
    seedData.forEach((p, i) => {
      p.id = i + 1;
      properties.push(p);
    });
  }

  if (clients.length === 0) {
    console.log('🌱 Seeding database with initial client (Prateek Khanna)...');
    clients.push({
      id: 1,
      name: 'Prateek Khanna',
      slug: 'prateek-khanna',
      password: 'PrateekKhanna@5M',
      budget: 5000000,
      budget_label: 'Phase 1 Budget',
      assigned_properties: properties.map(p => p.id),
      agent_id: 1,
      metric_1_label: 'Market Avg. YoY Growth', metric_1_value: 'AED 91.8M',
      metric_2_label: 'Rental Yield Range',     metric_2_value: '8–12%',
      metric_3_label: 'Capital Gains Tax',      metric_3_value: '0%'
    });
  }

  if (agents.length === 0) {
    console.log('🌱 Seeding database with initial agent (Gurmukh Singh)...');
    agents.push({
      id: 1,
      name: 'Gurmukh Singh',
      whatsapp: '971553874314',
      email: 'gurmukh@bitss.ae',
      photo: 'Research/Gurmukh.png'
    });
  }

  saveDB();
}

function saveDB() {
  fs.writeFileSync(dbFile, JSON.stringify({ properties, clients, agents, analytics, settings, proposals }, null, 2));
}

loadDB();

// ─── CRUD METHODS ────────────────────────────────────────────────────────────

const db = {
  getAll: () => {
    return [...properties].sort((a,b) => (a.sort_order||0) - (b.sort_order||0) || a.id - b.id);
  },
  getById: (id) => {
    return properties.find(p => p.id === parseInt(id));
  },
  insert: (p) => {
    const nextId = properties.length > 0 ? Math.max(...properties.map(x => x.id)) + 1 : 1;
    p.id = nextId;
    properties.push(p);
    saveDB();
    return p;
  },
  update: (id, updates) => {
    const idx = properties.findIndex(p => p.id === parseInt(id));
    if (idx !== -1) {
      properties[idx] = { ...properties[idx], ...updates, id: parseInt(id) };
      saveDB();
      return properties[idx];
    }
    return null;
  },
  delete: (id) => {
    const initLen = properties.length;
    properties = properties.filter(p => p.id !== parseInt(id));
    if (properties.length !== initLen) {
      saveDB();
      return true;
    }
    return false;
  },
  
  // ── Clients
  getAllClients: () => {
    return [...clients].sort((a,b) => a.id - b.id);
  },
  getClientById: (id) => {
    return clients.find(c => c.id === parseInt(id));
  },
  getClientBySlug: (slug) => {
    return clients.find(c => c.slug === slug);
  },
  insertClient: (c) => {
    const nextId = clients.length > 0 ? Math.max(...clients.map(x => x.id)) + 1 : 1;
    c.id = nextId;
    clients.push(c);
    saveDB();
    return c;
  },
  updateClient: (id, updates) => {
    const idx = clients.findIndex(c => c.id === parseInt(id));
    if (idx !== -1) {
      clients[idx] = { ...clients[idx], ...updates, id: parseInt(id) };
      saveDB();
      return clients[idx];
    }
    return null;
  },
  deleteClient: (id) => {
    const initLen = clients.length;
    clients = clients.filter(c => c.id !== parseInt(id));
    if (clients.length !== initLen) {
      saveDB();
      return true;
    }
    return false;
  },

  // ── Agents
  getAllAgents: () => [...agents].sort((a,b) => a.id - b.id),
  getAgentById: (id) => agents.find(a => a.id === parseInt(id)),
  insertAgent: (a) => {
    const nextId = agents.length > 0 ? Math.max(...agents.map(x => x.id)) + 1 : 1;
    a.id = nextId;
    agents.push(a);
    saveDB();
    return a;
  },
  updateAgent: (id, updates) => {
    const idx = agents.findIndex(a => a.id === parseInt(id));
    if (idx !== -1) {
      agents[idx] = { ...agents[idx], ...updates, id: parseInt(id) };
      saveDB();
      return agents[idx];
    }
    return null;
  },
  deleteAgent: (id) => {
    const initLen = agents.length;
    agents = agents.filter(a => a.id !== parseInt(id));
    if (agents.length !== initLen) {
      saveDB();
      return true;
    }
    return false;
  },

  // ── Analytics
  getAnalytics: () => analytics,
  logView: (slug) => {
    analytics.total_views++;
    if (!analytics.client_views[slug]) analytics.client_views[slug] = 0;
    analytics.client_views[slug]++;
    saveDB();
  },
  logActivity: (slug, action, details = {}) => {
    const c = clients.find(x => x.slug === slug);
    if (c) {
      if (!c.activity_logs) c.activity_logs = [];
      c.activity_logs.push({ action, details, time: Date.now() });
      saveDB();
    }
  },
  logEvent: (eventType) => {
    if (eventType === 'pdf_generated') analytics.pdf_downloads++;
    if (eventType === 'proposal_sent') analytics.proposals_requested++;
    saveDB();
  },

  // ── Settings
  getSettings: () => settings,
  updateSettings: (updates) => {
    settings = { ...settings, ...updates };
    saveDB();
    return settings;
  },

  // ── Client State & Chat
  updateClientState: (slug, state) => {
    const c = clients.find(x => x.slug === slug);
    if (c) {
      if (state.portfolio !== undefined) c.portfolio_state = state.portfolio;
      if (state.proposals !== undefined) c.proposals_data = state.proposals;
      if (state.chat !== undefined) c.chat_history = state.chat;
      saveDB();
      return true;
    }
    return false;
  },
  clearClientData: (slug) => {
    const c = clients.find(x => x.slug === slug);
    if (c) {
      c.portfolio_state = [];
      c.proposals_data = [];
      c.chat_history = [];
      if (analytics.client_views && analytics.client_views[slug]) {
        delete analytics.client_views[slug];
      }
      proposals = proposals.filter(p => p.clientSlug !== slug);
      saveDB();
      return true;
    }
    return false;
  },
  getAllProposals: () => {
    try {
      const fs = require('fs');
      const path = require('path');
      const dbFile = path.join(process.cwd(), 'database', 'data.json');
      if (fs.existsSync(dbFile)) {
        const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
        proposals = data.proposals || [];
      }
    } catch(e) {}
    return [...proposals].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  },
  logChat: (slug, role, text) => {
    const c = clients.find(x => x.slug === slug);
    if (c) {
      if (!c.chat_history) c.chat_history = [];
      c.chat_history.push({ role, text, time: Date.now() });
      saveDB();
    }
  },
  insertProposal: (p) => {
    p.id = proposals.length > 0 ? Math.max(...proposals.map(x => x.id)) + 1 : 1;
    p.created_at = new Date().toISOString();
    proposals.push(p);
    saveDB();
    return p;
  },
  deleteProposal: (id) => {
    const initLen = proposals.length;
    proposals = proposals.filter(p => p.id !== parseInt(id));
    if (proposals.length !== initLen) {
      saveDB();
      return true;
    }
    return false;
  }
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function formatProperty(p) {
  return {
    ...p,
    usps:         JSON.parse(p.usps         || '[]'),
    hot_usps:     JSON.parse(p.hot_usps     || '[]'),
    why:          JSON.parse(p.why          || '[]'),
    payment_plan: JSON.parse(p.payment_plan || '[]'),
    proj_values:  JSON.parse(p.proj_values  || '[0,0,0,0,0,0]'),
    unit_options: p.unit_options ? JSON.parse(p.unit_options) : null,
    deep_dive_data: JSON.parse(p.deep_dive_data || '{}'),
    distress:     Boolean(p.distress),
    hot:          Boolean(p.hot),
    // Resolve image/brochure paths
    image:    p.image   ? (p.image.startsWith('Research/') ? '/' + p.image : (p.image.startsWith('/uploads/') ? p.image : '/uploads/' + p.image)) : null,
    brochure: p.brochure ? (p.brochure.startsWith('Research/') ? '/' + p.brochure : (p.brochure.startsWith('/uploads/') ? p.brochure : '/uploads/' + p.brochure)) : null,
  };
}

export { db, formatProperty };
