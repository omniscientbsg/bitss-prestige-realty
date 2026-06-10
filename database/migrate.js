#!/usr/bin/env node
/**
 * One-time migration script: data.json → Supabase
 * 
 * Usage:
 *   Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local, then run:
 *   node database/migrate.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env vars from .env.local if not already set
if (!process.env.SUPABASE_URL) {
  try {
    const envPath = join(__dirname, '..', '.env.local');
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      });
      console.log('✅ Loaded env from .env.local');
    }
  } catch (e) {}
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Load the existing JSON database
const dbFile = join(__dirname, 'data.json');
if (!existsSync(dbFile)) {
  console.error('❌ database/data.json not found. Nothing to migrate.');
  process.exit(1);
}

const data = JSON.parse(readFileSync(dbFile, 'utf8'));
const properties = Array.isArray(data) ? data : (data.properties || []);
const clients = data.clients || [];
const agents = data.agents || [];
const proposals = data.proposals || [];
const settings = data.settings || {};
const analytics = data.analytics || {};

console.log(`📦 Loaded: ${properties.length} properties, ${clients.length} clients, ${agents.length} agents, ${proposals.length} proposals`);

async function migrate() {
  // 1. Migrate settings
  console.log('\n1️⃣  Migrating settings...');
  const { error: settingsError } = await supabase.from('settings').upsert({
    id: 1,
    google_api_key: settings.google_api_key || '',
  });
  if (settingsError) console.error('  ❌ Settings error:', settingsError.message);
  else console.log('  ✅ Settings migrated');

  // 2. Migrate analytics
  console.log('\n2️⃣  Migrating analytics...');
  const { error: analyticsError } = await supabase.from('analytics').upsert({
    id: 1,
    total_views: analytics.total_views || 0,
    pdf_downloads: analytics.pdf_downloads || 0,
    proposals_requested: analytics.proposals_requested || 0,
    client_views: analytics.client_views || {},
  });
  if (analyticsError) console.error('  ❌ Analytics error:', analyticsError.message);
  else console.log('  ✅ Analytics migrated');

  // 3. Migrate agents
  console.log('\n3️⃣  Migrating agents...');
  for (const agent of agents) {
    const { id, ...agentData } = agent;
    const { error } = await supabase.from('agents').insert({
      name: agentData.name || 'Unknown Agent',
      whatsapp: agentData.whatsapp || null,
      phone: agentData.phone || null,
      email: agentData.email || null,
      photo: agentData.photo || null,
    });
    if (error) console.error(`  ❌ Agent "${agentData.name}" error:`, error.message);
    else console.log(`  ✅ Agent: ${agentData.name}`);
  }

  // 4. Migrate properties
  console.log('\n4️⃣  Migrating properties...');
  for (const prop of properties) {
    const { id, ...propData } = prop;
    const { error } = await supabase.from('properties').insert({
      name: propData.name,
      location: propData.location || null,
      location_short: propData.location_short || null,
      developer: propData.developer || null,
      type: propData.type || 'offplan',
      emoji: propData.emoji || '🏢',
      phase: propData.phase || 'Phase 1',
      handover: propData.handover || null,
      price_aed: propData.price_aed || 0,
      price_usd: propData.price_usd || 0,
      gross_yield: propData.gross_yield || 0,
      capital_gain_5yr: propData.capital_gain_5yr || 0,
      capital_appreciation: propData.capital_appreciation || 0,
      annual_rental_usd: propData.annual_rental_usd || 0,
      down_payment: propData.down_payment || 10,
      distress: Boolean(propData.distress),
      hot: Boolean(propData.hot),
      sort_order: propData.sort_order || 0,
      image: propData.image || null,
      brochure: propData.brochure || null,
      reason: propData.reason || null,
      usps: typeof propData.usps === 'string' ? propData.usps : JSON.stringify(propData.usps || []),
      hot_usps: typeof propData.hot_usps === 'string' ? propData.hot_usps : JSON.stringify(propData.hot_usps || []),
      why: typeof propData.why === 'string' ? propData.why : JSON.stringify(propData.why || []),
      payment_plan: typeof propData.payment_plan === 'string' ? propData.payment_plan : JSON.stringify(propData.payment_plan || []),
      proj_values: typeof propData.proj_values === 'string' ? propData.proj_values : JSON.stringify(propData.proj_values || [0,0,0,0,0,0]),
      unit_options: propData.unit_options ? (typeof propData.unit_options === 'string' ? propData.unit_options : JSON.stringify(propData.unit_options)) : null,
      deep_dive_data: typeof propData.deep_dive_data === 'string' ? propData.deep_dive_data : JSON.stringify(propData.deep_dive_data || {}),
    });
    if (error) console.error(`  ❌ Property "${propData.name}" error:`, error.message);
    else console.log(`  ✅ Property: ${propData.name}`);
  }

  // 5. Fetch inserted agents to build id map
  const { data: insertedAgents } = await supabase.from('agents').select('id, name');
  const agentNameToId = {};
  insertedAgents?.forEach(a => agentNameToId[a.name] = a.id);

  // 6. Migrate clients  
  console.log('\n5️⃣  Migrating clients...');
  for (const client of clients) {
    const { id, chat_history, activity_logs, ...clientData } = client;
    
    // Find the agent id by matching the old agent_id to a name
    let newAgentId = null;
    if (clientData.agent_id) {
      const oldAgent = agents.find(a => a.id === clientData.agent_id);
      if (oldAgent) newAgentId = agentNameToId[oldAgent.name] || null;
    }

    const { data: insertedClient, error } = await supabase.from('clients').insert({
      name: clientData.name,
      slug: clientData.slug,
      password: clientData.password || null,
      budget: clientData.budget || 0,
      budget_label: clientData.budget_label || 'Phase 1 Budget',
      agent_id: newAgentId,
      assigned_properties: clientData.assigned_properties || [],
      portfolio_heading: clientData.portfolio_heading || null,
      portfolio_subheading: clientData.portfolio_subheading || null,
      phase_heading: clientData.phase_heading || null,
      video_url: clientData.video_url || null,
      metric_1_label: clientData.metric_1_label || null,
      metric_1_value: clientData.metric_1_value || null,
      metric_2_label: clientData.metric_2_label || null,
      metric_2_value: clientData.metric_2_value || null,
      metric_3_label: clientData.metric_3_label || null,
      metric_3_value: clientData.metric_3_value || null,
    }).select().single();

    if (error) {
      console.error(`  ❌ Client "${clientData.name}" error:`, error.message);
      continue;
    }
    console.log(`  ✅ Client: ${clientData.name}`);

    // Migrate chat history
    if (chat_history && chat_history.length > 0) {
      for (const msg of chat_history) {
        await supabase.from('chat_history').insert({
          client_id: insertedClient.id,
          role: msg.role,
          text: msg.text || msg.content || '',
          created_at: msg.time ? new Date(msg.time).toISOString() : new Date().toISOString(),
        });
      }
      console.log(`     💬 Migrated ${chat_history.length} chat messages`);
    }

    // Migrate activity logs
    if (activity_logs && activity_logs.length > 0) {
      for (const log of activity_logs) {
        await supabase.from('activity_logs').insert({
          client_id: insertedClient.id,
          action: log.action,
          details: log.details || {},
          created_at: log.time ? new Date(log.time).toISOString() : new Date().toISOString(),
        });
      }
      console.log(`     📊 Migrated ${activity_logs.length} activity logs`);
    }
  }

  // 7. Migrate proposals
  console.log('\n6️⃣  Migrating proposals...');
  const { data: insertedClients } = await supabase.from('clients').select('id, name, slug');
  const clientSlugToId = {};
  insertedClients?.forEach(c => clientSlugToId[c.slug] = c.id);

  for (const proposal of proposals) {
    const { id, ...propData } = proposal;
    const clientId = propData.clientSlug ? clientSlugToId[propData.clientSlug] : null;
    const { error } = await supabase.from('proposals').insert({
      client_id: clientId,
      client_name: propData.clientName || propData.client_name || null,
      property_name: propData.propertyName || propData.property_name || null,
      property_ids: Array.isArray(propData.property_ids) ? propData.property_ids : [],
      message: propData.message || null,
      status: propData.status || 'sent',
      created_at: propData.created_at || new Date().toISOString(),
    });
    if (error) console.error(`  ❌ Proposal error:`, error.message);
    else console.log(`  ✅ Proposal for ${propData.clientName || 'client'}`);
  }

  console.log('\n🎉 Migration complete!');
  console.log('   You can now set SUPABASE_URL and SUPABASE_SERVICE_KEY in Render and redeploy.');
}

migrate().catch(console.error);
