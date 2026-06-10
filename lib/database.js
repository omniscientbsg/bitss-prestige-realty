import { supabase } from './supabase.js';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export function formatProperty(p) {
  if (!p) return null;
  const safe = (val, fallback) => { try { return JSON.parse(val || fallback); } catch { return JSON.parse(fallback); } };
  return {
    ...p,
    usps:           safe(p.usps, '[]'),
    hot_usps:       safe(p.hot_usps, '[]'),
    why:            safe(p.why, '[]'),
    payment_plan:   safe(p.payment_plan, '[]'),
    proj_values:    safe(p.proj_values, '[0,0,0,0,0,0]'),
    unit_options:   p.unit_options ? safe(p.unit_options, 'null') : null,
    deep_dive_data: safe(p.deep_dive_data, '{}'),
    distress:       Boolean(p.distress),
    hot:            Boolean(p.hot),
    image:    p.image    ? (p.image.startsWith('http') ? p.image : p.image.startsWith('Research/') ? '/' + p.image : p.image.startsWith('/') ? p.image : '/uploads/' + p.image) : null,
    brochure: p.brochure ? (p.brochure.startsWith('http') ? p.brochure : p.brochure.startsWith('Research/') ? '/' + p.brochure : p.brochure.startsWith('/') ? p.brochure : '/uploads/' + p.brochure) : null,
  };
}

// ─── DB INTERFACE ─────────────────────────────────────────────────────────────
export const db = {

  // ── Properties ──────────────────────────────────────────────────────────────
  getAll: async () => {
    const { data, error } = await supabase.from('properties').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true });
    if (error) { console.error('db.getAll error:', error); return []; }
    return data || [];
  },

  getById: async (id) => {
    const { data, error } = await supabase.from('properties').select('*').eq('id', parseInt(id)).single();
    if (error) return null;
    return data;
  },

  insert: async (p) => {
    const { data, error } = await supabase.from('properties').insert(p).select().single();
    if (error) { console.error('db.insert error:', error); return null; }
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase.from('properties').update(updates).eq('id', parseInt(id)).select().single();
    if (error) { console.error('db.update error:', error); return null; }
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase.from('properties').delete().eq('id', parseInt(id));
    return !error;
  },

  // ── Clients ─────────────────────────────────────────────────────────────────
  getAllClients: async () => {
    const { data, error } = await supabase.from('clients').select('*').order('id', { ascending: true });
    if (error) { console.error('db.getAllClients error:', error); return []; }
    return data || [];
  },

  getClientById: async (id) => {
    const { data, error } = await supabase.from('clients').select('*').eq('id', parseInt(id)).single();
    if (error) return null;
    return data;
  },

  getClientBySlug: async (slug) => {
    const { data, error } = await supabase.from('clients').select('*').eq('slug', slug).single();
    if (error) return null;
    return data;
  },

  insertClient: async (c) => {
    const { data, error } = await supabase.from('clients').insert(c).select().single();
    if (error) { console.error('db.insertClient error:', error); return null; }
    return data;
  },

  updateClient: async (id, updates) => {
    const { data, error } = await supabase.from('clients').update(updates).eq('id', parseInt(id)).select().single();
    if (error) { console.error('db.updateClient error:', error); return null; }
    return data;
  },

  deleteClient: async (id) => {
    const { error } = await supabase.from('clients').delete().eq('id', parseInt(id));
    return !error;
  },

  // ── Agents ──────────────────────────────────────────────────────────────────
  getAllAgents: async () => {
    const { data, error } = await supabase.from('agents').select('*').order('id', { ascending: true });
    if (error) { console.error('db.getAllAgents error:', error); return []; }
    return data || [];
  },

  getAgentById: async (id) => {
    const { data, error } = await supabase.from('agents').select('*').eq('id', parseInt(id)).single();
    if (error) return null;
    return data;
  },

  insertAgent: async (a) => {
    const { data, error } = await supabase.from('agents').insert(a).select().single();
    if (error) { console.error('db.insertAgent error:', error); return null; }
    return data;
  },

  updateAgent: async (id, updates) => {
    const { data, error } = await supabase.from('agents').update(updates).eq('id', parseInt(id)).select().single();
    if (error) { console.error('db.updateAgent error:', error); return null; }
    return data;
  },

  deleteAgent: async (id) => {
    const { error } = await supabase.from('agents').delete().eq('id', parseInt(id));
    return !error;
  },

  // ── Analytics ───────────────────────────────────────────────────────────────
  getAnalytics: async () => {
    const { data } = await supabase.from('analytics').select('*').eq('id', 1).single();
    return data || { total_views: 0, pdf_downloads: 0, proposals_requested: 0, client_views: {} };
  },

  logView: async (slug) => {
    const { data: row } = await supabase.from('analytics').select('*').eq('id', 1).single();
    const views = row?.client_views || {};
    views[slug] = (views[slug] || 0) + 1;
    await supabase.from('analytics').update({
      total_views: (row?.total_views || 0) + 1,
      client_views: views
    }).eq('id', 1);
  },

  logEvent: async (eventType) => {
    const { data: row } = await supabase.from('analytics').select('*').eq('id', 1).single();
    const updates = {};
    if (eventType === 'pdf_generated') updates.pdf_downloads = (row?.pdf_downloads || 0) + 1;
    if (eventType === 'proposal_sent') updates.proposals_requested = (row?.proposals_requested || 0) + 1;
    if (Object.keys(updates).length) await supabase.from('analytics').update(updates).eq('id', 1);
  },

  // ── Activity Logs ────────────────────────────────────────────────────────────
  logActivity: async (slug, action, details = {}) => {
    const client = await db.getClientBySlug(slug);
    if (!client) return;
    await supabase.from('activity_logs').insert({ client_id: client.id, action, details });
  },

  // ── Settings ────────────────────────────────────────────────────────────────
  getSettings: async () => {
    const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
    return data || { google_api_key: '', admin_password: 'admin123' };
  },

  updateSettings: async (updates) => {
    const { data } = await supabase.from('settings').update(updates).eq('id', 1).select().single();
    return data;
  },

  // ── Chat History ─────────────────────────────────────────────────────────────
  logChat: async (slug, role, text) => {
    const client = await db.getClientBySlug(slug);
    if (!client) return;
    await supabase.from('chat_history').insert({ client_id: client.id, role, text });
  },

  getChatHistory: async (clientId) => {
    const { data } = await supabase
      .from('chat_history')
      .select('*')
      .eq('client_id', parseInt(clientId))
      .order('created_at', { ascending: true });
    return data || [];
  },

  getActivityLogs: async (clientId) => {
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('client_id', parseInt(clientId))
      .order('created_at', { ascending: false });
    return data || [];
  },

  // ── Proposals ────────────────────────────────────────────────────────────────
  getAllProposals: async () => {
    const { data, error } = await supabase.from('proposals').select('*').order('created_at', { ascending: false });
    if (error) { console.error('db.getAllProposals error:', error); return []; }
    return data || [];
  },

  insertProposal: async (p) => {
    const { data, error } = await supabase.from('proposals').insert(p).select().single();
    if (error) { console.error('db.insertProposal error:', error); return null; }
    return data;
  },

  getProposalById: async (id) => {
    const { data } = await supabase.from('proposals').select('*').eq('id', parseInt(id)).single();
    return data;
  },

  deleteProposal: async (id) => {
    const { error } = await supabase.from('proposals').delete().eq('id', parseInt(id));
    return !error;
  },
};
