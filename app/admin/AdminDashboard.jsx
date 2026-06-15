"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, Users, FileText, Settings, LayoutDashboard, 
  Plus, Edit2, Trash2, LogOut, ExternalLink, Link as LinkIcon, X, CheckCircle, MessageSquare, Download
} from "lucide-react";
import { addPropertyAction, updatePropertyAction, deletePropertyAction, addClientAction, updateClientAction, deleteClientAction, updateSettingsAction, addAgentAction, updateAgentAction, deleteAgentAction } from "./actions";
import { StringArrayInput, ObjectArrayInput, DeepDiveInput, ProjectionsInput } from "./DynamicJSONInputs";
import { FileUploadInput } from "./FileUploadInput";

const DraggablePropertyList = ({ initialProperties, currentClient }) => {
  const [assigned, setAssigned] = useState(currentClient?.assigned_properties || []);

  useEffect(() => {
    setAssigned(currentClient?.assigned_properties || []);
  }, [currentClient]);

  const handleToggle = (id) => {
    if (assigned.includes(id)) setAssigned(assigned.filter(x => x !== id));
    else setAssigned([...assigned, id]);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("dragIndex", index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndexStr = e.dataTransfer.getData("dragIndex");
    if (!dragIndexStr) return;
    const dragIndex = parseInt(dragIndexStr);
    if (dragIndex === dropIndex) return;
    const newAssigned = [...assigned];
    const [draggedItem] = newAssigned.splice(dragIndex, 1);
    newAssigned.splice(dropIndex, 0, draggedItem);
    setAssigned(newAssigned);
  };

  return (
    <div className="space-y-4 bg-dark3 border border-white/10 p-4 rounded-xl">
      <input type="hidden" name="assigned_properties_json" value={JSON.stringify(assigned)} />
      {assigned.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs text-platinum/50 uppercase block">Drag to Reorder Properties</label>
           {assigned.map((id, idx) => {
               const p = initialProperties.find(x => String(x.id) === String(id));
               if(!p) return null;
               return (
                 <div 
                   key={id} 
                   draggable 
                   onDragStart={e => handleDragStart(e, idx)}
                   onDragOver={e => e.preventDefault()}
                   onDrop={e => handleDrop(e, idx)}
                   className="flex items-center gap-3 p-3 bg-dark2 border border-white/10 rounded-lg cursor-grab active:cursor-grabbing hover:border-gold/30 transition-colors"
                 >
                   <span className="text-platinum/40 cursor-grab text-lg">≡</span>
                   <div className="flex-1 flex flex-col pointer-events-none">
                     <span className="text-sm text-white">{p.name}</span>
                     <span className="text-xs text-platinum/50">AED {(p.price_aed / 1000000).toFixed(2)}M</span>
                   </div>
                   <button type="button" onClick={() => handleToggle(id)} className="text-red-400/80 hover:text-red-400 text-xs px-2 py-1 bg-red-400/10 rounded transition-colors z-10">Remove</button>
                 </div>
               )
           })}
        </div>
      )}
      
      <div className="pt-4 border-t border-white/5">
        <label className="text-xs text-platinum/50 uppercase mb-2 block">Add Property to Portfolio</label>
        <select 
          style={{color: 'white', backgroundColor: '#111827'}}
          className="w-full border border-white/10 rounded p-3 text-sm focus:outline-none focus:border-gold/50" 
          onChange={(e) => { 
            if(e.target.value) handleToggle(parseInt(e.target.value)); 
            e.target.value = ""; 
          }}
        >
          <option value="" style={{backgroundColor: '#111827', color: 'white'}}>-- Select property to add --</option>
          {initialProperties.filter(p => !assigned.includes(p.id)).map(p => (
            <option key={p.id} value={p.id} style={{backgroundColor: '#111827', color: 'white'}}>{p.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default function AdminDashboard({ 
  initialProperties, 
  initialClients, 
  initialAgents,
  initialProposals, 
  analytics, 
  settings 
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Modals state
  const [isPropModalOpen, setIsPropModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [currentProp, setCurrentProp] = useState(null);
  const [currentClient, setCurrentClient] = useState(null);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  
  // Agents state
  const [agents, setAgents] = useState(initialAgents || []);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);

  // Proposals state
  const [proposals, setProposals] = useState(initialProposals || []);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const client_id = formData.get("client_id");
    const property_ids = formData.getAll("property_ids");
    const message = formData.get("message");
    
    const client = initialClients.find(c => c.id == client_id);
    const props = initialProperties.filter(p => property_ids.includes(p.id.toString()));
    
    const newProposal = {
      client_id: parseInt(client_id),
      client_name: client.name,
      property_ids: property_ids.map(Number),
      property_name: props.map(p => p.name).join(", "),
      message: message
    };
    
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(newProposal)
    });
    
    if (res.ok) {
      const data = await res.json();
      setProposals([data.proposal, ...proposals]);
      setIsProposalModalOpen(false);
    }
  };

  const handleDeleteProposal = async (id) => {
    if(!confirm("Are you sure you want to delete this proposal?")) return;
    const res = await fetch(`/api/proposals/${id}`, { method: "DELETE" });
    if(res.ok) {
      setProposals(proposals.filter(p => p.id !== id));
      router.refresh();
    }
  };

  const handleSendProposal = (proposal) => {
    const cName = proposal.client_name || proposal.clientName || 'Valued Client';
    const pName = proposal.property_name || proposal.propertyName || 'these exclusive properties';
    const text = `Hi ${cName},\n\nI've prepared a personalized investment proposal for you featuring: ${pName}.\n\nYou can view and download your full proposal here: ${window.location.origin}/proposals/${proposal.id}\n\nBest,\nYour Agent`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLogout = async () => {
    document.cookie = "adminLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "properties", label: "Properties", icon: Building2 },
    { id: "clients", label: "Clients", icon: Users },
    { id: "proposals", label: "Proposals", icon: FileText },
    { id: "agents", label: "Agents", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handlePropSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      location: formData.get("location"),
      location_short: formData.get("location_short"),
      developer: formData.get("developer"),
      handover: formData.get("handover"),
      phase: formData.get("phase") || "Phase 1",
      emoji: formData.get("emoji") || "🏢",
      price_aed: Number(formData.get("price_aed")),
      price_usd: Number(formData.get("price_usd")),
      gross_yield: Number(formData.get("gross_yield")),
      capital_appreciation: Number(formData.get("capital_appreciation")),
      capital_gain_5yr: Number(formData.get("capital_appreciation")), // map to original structure
      annual_rental_usd: Number(formData.get("annual_rental_usd")),
      down_payment: Number(formData.get("down_payment")),
      reason: formData.get("reason"),
      image: formData.get("image") || "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000&auto=format&fit=crop",
      brochure: formData.get("brochure"),
      hot: formData.get("hot") === "on",
      distress: formData.get("distress") === "on",
      sort_order: Number(formData.get("sort_order")) || 0,
      usps: formData.get("usps"),
      hot_usps: formData.get("hot_usps"),
      why: formData.get("why"),
      payment_plan: formData.get("payment_plan"),
      proj_values: formData.get("proj_values"),
      unit_options: formData.get("unit_options"),
      deep_dive_data: formData.get("deep_dive_data"),
      our_offer: formData.get("our_offer"),
      payment_plan_ratio: formData.get("payment_plan_ratio") || null,
      status: formData.get("status") || null,
      below_market: formData.get("below_market") ? Number(formData.get("below_market")) : null
    };

    let res;
    if (currentProp) {
      res = await updatePropertyAction(currentProp.id, data);
    } else {
      res = await addPropertyAction(data);
    }
    
    if (!res.success) {
      alert("Failed to save property: " + res.error);
      return;
    }
    setIsPropModalOpen(false);
    setCurrentProp(null);
    router.refresh();
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const assigned_properties = JSON.parse(formData.get("assigned_properties_json") || "[]").map(id => Number(id));

    const name = formData.get("name");
    const slugInput = formData.get("slug");
    const slug = slugInput ? slugInput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const data = {
      name: name,
      slug: slug,
      password: formData.get("password"),
      budget: Number(formData.get("budget")),
      budget_label: formData.get("budget_label") || "Phase 1 Budget",
      assigned_properties: assigned_properties,
      agent_id: formData.get("agent_id") ? Number(formData.get("agent_id")) : null,
      portfolio_heading: formData.get("portfolio_heading"),
      portfolio_subheading: formData.get("portfolio_subheading"),
      phase_heading: formData.get("phase_heading"),
      video_url: formData.get("video_url"),
      metric_1_label: formData.get("metric_1_label"),
      metric_1_value: formData.get("metric_1_value"),
      metric_2_label: formData.get("metric_2_label"),
      metric_2_value: formData.get("metric_2_value"),
      metric_3_label: formData.get("metric_3_label"),
      metric_3_value: formData.get("metric_3_value"),
      brief_text: formData.get("brief_text") || "Confidential Investment Brief · 2025"
    };

    let res;
    if (currentClient) {
      res = await updateClientAction(currentClient.id, data);
    } else {
      res = await addClientAction(data);
    }
    
    if (!res.success) {
      alert("Failed to save client: " + res.error);
      return;
    }
    setIsClientModalOpen(false);
    setCurrentClient(null);
    router.refresh();
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    const apiKey = new FormData(e.target).get("google_api_key");
    const res = await updateSettingsAction({ google_api_key: apiKey });
    if (!res.success) {
      alert("Failed to save settings: " + res.error);
      return;
    }
    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/5 bg-dark2/50 flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-white/5">
          <Building2 className="w-6 h-6 text-gold" />
          <div className="font-heading text-xl font-semibold text-white">
            BITSS <span className="text-gold font-light">Prestige</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  activeTab === item.id 
                    ? "bg-gold/10 text-gold border border-gold/20" 
                    : "text-platinum/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all text-sm font-medium text-red-400 hover:bg-red-400/10"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
        <div className="max-w-6xl mx-auto">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-heading text-white">Dashboard Overview</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Views", value: analytics.total_views, icon: LayoutDashboard },
                  { label: "Active Properties", value: initialProperties.length, icon: Building2 },
                  { label: "Exclusive Clients", value: initialClients.length, icon: Users },
                  { label: "Proposals Sent", value: initialProposals.length, icon: FileText }
                ].map((stat, i) => (
                  <div key={i} className="bg-dark2 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-platinum/50 uppercase tracking-wider">{stat.label}</span>
                      <stat.icon className="w-5 h-5 text-gold" />
                    </div>
                    <div className="text-4xl font-heading text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Client Activity Logs */}
              <div className="bg-dark2 border border-white/5 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-heading text-white mb-2">Client Activity</h3>
                <p className="text-xs text-platinum/40 uppercase tracking-widest mb-5">Portal opens · Proposals · Last seen</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-dark3 text-platinum/50 border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-xl">Client</th>
                        <th className="px-4 py-3">Portal Opens</th>
                        <th className="px-4 py-3">Properties Viewed</th>
                        <th className="px-4 py-3">Proposals</th>
                        <th className="px-4 py-3 rounded-tr-xl">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initialClients.map(c => {
                        const opens = (c.activity_logs || []).filter(l => l.action === 'viewed_portal').length;
                        const viewed = (c.activity_logs || []).filter(l => l.action === 'viewed_property').length;
                        const proposalCount = initialProposals.filter(p => p.client_id === c.id).length;
                        const lastActivity = (c.activity_logs || []).length > 0
                          ? (() => {
                              const ts = Math.max(...c.activity_logs.map(l => new Date(l.created_at || l.time || 0).getTime()).filter(t => !isNaN(t)));
                              return isNaN(ts) || ts === -Infinity ? '—' : new Date(ts).toLocaleString('en-GB', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'});
                            })()
                          : '—';
                        return (
                          <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-4">
                              <div className="font-medium text-white">{c.name}</div>
                              <div className="text-xs text-platinum/40 mt-0.5">/{c.slug}</div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`font-semibold text-lg ${opens > 0 ? 'text-gold' : 'text-platinum/30'}`}>{opens}</span>
                              <span className="text-platinum/40 text-xs ml-1">times</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`font-semibold text-lg ${viewed > 0 ? 'text-white' : 'text-platinum/30'}`}>{viewed}</span>
                              <span className="text-platinum/40 text-xs ml-1">views</span>
                            </td>
                            <td className="px-4 py-4">
                              {proposalCount > 0 
                                ? <span className="px-2 py-1 rounded-full text-xs bg-gold/10 text-gold border border-gold/20">{proposalCount} sent</span>
                                : <span className="text-platinum/30 text-xs">None</span>
                              }
                            </td>
                            <td className="px-4 py-4 text-platinum/50 text-xs">{lastActivity}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {initialClients.length === 0 && (
                    <div className="text-center py-8 text-platinum/30 text-sm">No clients yet.</div>
                  )}
                </div>
              </div>

              <div className="bg-dark2 border border-white/5 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-heading text-white mb-4">Recent Proposals</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-dark3 text-platinum/50 border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-xl">Client</th>
                        <th className="px-4 py-3">Property</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 rounded-tr-xl">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initialProposals.slice(0, 5).map(p => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-4 text-white font-medium">{p.client_name || p.clientName || '—'}</td>
                          <td className="px-4 py-4 text-platinum/70">{p.property_name || p.propertyName || '—'}</td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-1 rounded-full text-xs bg-gold/10 text-gold border border-gold/20">Sent</span>
                          </td>
                          <td className="px-4 py-4 text-platinum/50">{p.created_at ? new Date(p.created_at).toLocaleDateString("en-GB") : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PROPERTIES TAB */}
          {activeTab === "properties" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-heading text-white">Properties Vault</h2>
                <button 
                  onClick={() => { setCurrentProp(null); setIsPropModalOpen(true); }}
                  className="bg-gold text-[#0A0A0F] font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#D4B35E] transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Asset
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialProperties.map(prop => (
                  <div key={prop.id} className="bg-dark2 border border-white/5 rounded-2xl overflow-hidden hover:border-gold/30 transition-all flex flex-col">
                    <div className="h-48 relative bg-dark1">
                      {prop.image && <img src={prop.image} alt={prop.name} className="w-full h-full object-cover opacity-80" />}
                      <div className="absolute top-2 right-2 flex gap-2">
                        {prop.hot && <span className="bg-red-500/80 text-white text-xs px-2 py-1 rounded border border-red-500">HOT</span>}
                        {prop.distress && <span className="bg-orange-500/80 text-white text-xs px-2 py-1 rounded border border-orange-500">DISTRESS</span>}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-heading text-xl text-white">{prop.name}</h3>
                        <div className="flex gap-2 text-platinum/40">
                          <button onClick={() => { setCurrentProp(prop); setIsPropModalOpen(true); }} className="hover:text-gold transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={async () => { await deletePropertyAction(prop.id); router.refresh(); }} className="hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <p className="text-xs text-platinum/50 mb-4">{prop.location}</p>
                      
                      <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-end">
                        <div>
                          <div className="text-[10px] text-platinum/40 uppercase tracking-wider">Entry Price</div>
                          <div className="text-gold font-medium">AED {prop.price_aed.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-platinum/40 uppercase tracking-wider">Yield</div>
                          <div className="text-white">{prop.gross_yield}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLIENTS TAB */}
          {activeTab === "clients" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-heading text-white">Client Management</h2>
                <button 
                  onClick={() => { setCurrentClient(null); setIsClientModalOpen(true); }}
                  className="bg-gold text-[#0A0A0F] font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#D4B35E] transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Client
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {initialClients.map(client => (
                  <div key={client.id} className="bg-dark2 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-heading text-2xl text-white flex items-center gap-2">
                          {client.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-platinum/50 mt-1">
                          <LinkIcon className="w-3 h-3" /> /{client.slug}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={`/${client.slug}`} target="_blank" className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-platinum transition-all" title="View Portal">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button onClick={() => { setCurrentClient(client); setIsChatHistoryOpen(true); }} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-gold/20 text-gold transition-all" title="View Chat History"><MessageSquare className="w-4 h-4" /></button>
                        <button onClick={() => { setCurrentClient(client); setIsClientModalOpen(true); }} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-platinum transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={async () => { await deleteClientAction(client.id); router.refresh(); }} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="bg-dark3 p-3 rounded-xl border border-white/5">
                        <div className="text-[10px] text-platinum/40 uppercase tracking-wider">{client.budget_label || 'Budget'}</div>
                        <div className="text-gold font-medium mt-1">AED {client.budget ? client.budget.toLocaleString() : 'N/A'}</div>
                      </div>
                      <div className="bg-dark3 p-3 rounded-xl border border-white/5">
                        <div className="text-[10px] text-platinum/40 uppercase tracking-wider">Assigned Assets</div>
                        <div className="text-white font-medium mt-1">{client.assigned_properties?.length || 0} Properties</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AGENTS TAB */}
          {activeTab === 'agents' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-heading font-medium text-white">Agents</h2>
                  <p className="text-platinum/60 mt-1">Manage broker profiles for proposals.</p>
                </div>
                <button 
                  onClick={() => { setCurrentAgent(null); setIsAgentModalOpen(true); }}
                  className="bg-gold hover:bg-[#E8C97A] text-[#0A0A0F] px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-medium"
                >
                  <Plus className="w-4 h-4"/> Add Agent
                </button>
              </div>

              <div className="bg-dark2 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-dark3/50 text-platinum/40">
                    <tr>
                      <th className="p-4 font-medium">Agent</th>
                      <th className="p-4 font-medium">Title</th>
                      <th className="p-4 font-medium">Phone / WhatsApp</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {agents.map(a => (
                      <tr key={a.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-4 flex items-center gap-3">
                          {a.photo ? (
                            <img src={a.photo} className="w-10 h-10 rounded-full object-cover" alt="" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">{a.name.charAt(0)}</div>
                          )}
                          <div>
                            <div className="font-medium text-white">{a.name}</div>
                            <div className="text-xs text-platinum/50">{a.email}</div>
                          </div>
                        </td>
                        <td className="p-4 text-platinum/80">{a.title}</td>
                        <td className="p-4 text-platinum/80 text-xs">
                          <div>Call: {a.phone}</div>
                          <div className="text-platinum/50">WA: {a.whatsapp || a.phone}</div>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button 
                            onClick={() => { setCurrentAgent(a); setIsAgentModalOpen(true); }}
                            className="p-2 text-platinum/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4"/>
                          </button>
                          <button 
                            onClick={async () => {
                              if(confirm('Delete agent?')) {
                                await deleteAgentAction(a.id);
                                setAgents(agents.filter(x => x.id !== a.id));
                                router.refresh();
                              }
                            }}
                            className="p-2 text-red-400/50 hover:text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROPOSALS TAB */}
          {activeTab === "proposals" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-heading text-white">Sent Proposals</h2>
                <button onClick={() => setIsProposalModalOpen(true)} className="bg-gold hover:bg-[#E8C97A] text-[#0A0A0F] px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
                  <Plus className="w-5 h-5"/> New Proposal
                </button>
              </div>
              <div className="bg-dark2 border border-white/5 rounded-2xl p-6">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-dark3 text-platinum/50 border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Date Sent</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposals.map(p => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-4 text-white font-medium">{p.client_name || p.clientName || '—'}</td>
                        <td className="px-4 py-4 text-platinum/70">{p.property_name || p.propertyName || '—'}</td>
                        <td className="px-4 py-4 text-platinum/50">{p.created_at ? new Date(p.created_at).toLocaleDateString("en-GB") : '—'}</td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a href={`/proposals/${p.id}`} target="_blank" className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-platinum transition-all" title="View Proposal"><ExternalLink className="w-4 h-4" /></a>
                            <a href={`/api/proposals/${p.id}/pdf`} target="_blank" className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-gold/20 text-gold transition-all" title="Download PDF"><Download className="w-4 h-4"/></a>
                            <button onClick={() => handleSendProposal(p)} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-green-500/20 text-green-400 transition-all" title="Send via WhatsApp"><MessageSquare className="w-4 h-4"/></button>
                            <button onClick={() => handleDeleteProposal(p.id)} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-red-500/20 text-red-400 transition-all" title="Delete Proposal"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {proposals.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-platinum/50">No proposals found. Create one to get started.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-heading text-white">System Settings</h2>
              
              <div className="bg-dark2 border border-white/5 p-6 rounded-2xl max-w-2xl">
                <h3 className="text-lg font-medium text-white mb-4">Google AI Configuration</h3>
                <p className="text-sm text-platinum/60 mb-6">
                  The AI Assistant uses Gemini 2.5 Flash to automatically respond to client inquiries in their portals.
                </p>
                <form onSubmit={handleSettingsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-platinum/50 mb-2">API Key</label>
                    <input 
                      type="password" 
                      name="google_api_key"
                      defaultValue={settings.google_api_key} 
                      className="w-full bg-dark3 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <button type="submit" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl transition-all font-medium text-sm">
                    Save Settings
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Property Modal */}
      {isPropModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark2 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-heading text-2xl text-white">{currentProp ? 'Edit Asset' : 'Add New Asset'}</h3>
              <button onClick={() => setIsPropModalOpen(false)} className="text-platinum/50 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handlePropSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Property Name *</label>
                  <input name="name" defaultValue={currentProp?.name} required className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Developer</label>
                  <input name="developer" defaultValue={currentProp?.developer} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Full Location *</label>
                  <input name="location" defaultValue={currentProp?.location} required className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Location Short</label>
                  <input name="location_short" defaultValue={currentProp?.location_short} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Emoji</label>
                  <input name="emoji" defaultValue={currentProp?.emoji || "🏢"} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4 border-t border-white/5 pt-4">
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Price (AED) *</label>
                  <input type="number" name="price_aed" defaultValue={currentProp?.price_aed} required className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Our Offer (Optional)</label>
                  <input type="text" name="our_offer" defaultValue={currentProp?.our_offer} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" placeholder="e.g. AED 599,000" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Alt Price (AED)</label>
                  <input type="number" name="price_usd" defaultValue={currentProp?.price_usd} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Down Payment %</label>
                  <input type="number" name="down_payment" defaultValue={currentProp?.down_payment} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Handover Phase</label>
                  <input name="handover" defaultValue={currentProp?.handover} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" placeholder="e.g. Q3 2026" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Gross Yield (%) *</label>
                  <input type="number" step="0.1" name="gross_yield" defaultValue={currentProp?.gross_yield} required className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Capital Apprec. 5Yr (%)</label>
                  <input type="number" step="0.1" name="capital_appreciation" defaultValue={currentProp?.capital_appreciation || currentProp?.capital_gain_5yr} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Annual Rental (AED)</label>
                  <input type="number" name="annual_rental_usd" defaultValue={currentProp?.annual_rental_usd} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 border-t border-white/5 pt-4">
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Status</label>
                  <select name="status" defaultValue={currentProp?.status || ""} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none">
                    <option value="" className="text-black bg-white">— Select Status —</option>
                    <option value="Ready" className="text-black bg-white">Ready</option>
                    <option value="Pre-Launch" className="text-black bg-white">Pre-Launch</option>
                    <option value="Under Construction" className="text-black bg-white">Under Construction</option>
                    <option value="Ready to Rent" className="text-black bg-white">Ready to Rent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Payment Plan Ratio</label>
                  <input type="text" name="payment_plan_ratio" defaultValue={currentProp?.payment_plan_ratio} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" placeholder="e.g. 60/40" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">% Below Market (Optional)</label>
                  <input type="number" name="below_market" defaultValue={currentProp?.below_market} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" placeholder="e.g. 10" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Sort Order</label>
                  <input type="number" name="sort_order" defaultValue={currentProp?.sort_order || 0} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
              </div>


              <div className="border-t border-white/5 pt-4">
                <label className="block text-xs text-platinum/50 uppercase mb-1">Investment Rationale / Reason</label>
                <textarea name="reason" defaultValue={currentProp?.reason} rows={2} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FileUploadInput name="image" defaultValue={currentProp?.image} label="Image URL" />
                </div>
                <div>
                  <FileUploadInput name="brochure" defaultValue={currentProp?.brochure} label="Brochure PDF URL" />
                </div>
              </div>

              {/* JSON Arrays */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <StringArrayInput name="usps" label="Standard USPs" defaultValue={currentProp?.usps} placeholder="e.g. Lagoon Views" />
                <StringArrayInput name="hot_usps" label="Hot USPs" defaultValue={currentProp?.hot_usps} placeholder="e.g. Pre-Launch Price" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <ObjectArrayInput 
                  name="why" 
                  label="Investment Drivers (Why This Property)" 
                  defaultValue={currentProp?.why} 
                  fields={[
                    { key: "icon", label: "Icon (Emoji)", type: "text", placeholder: "📈" },
                    { key: "title", label: "Title", type: "text", placeholder: "Underpriced Entry" },
                    { key: "desc", label: "Description", type: "textarea", placeholder: "Explanation...", fullWidth: true }
                  ]}
                />
                
                <ObjectArrayInput 
                  name="payment_plan" 
                  label="Payment Plan" 
                  defaultValue={currentProp?.payment_plan} 
                  fields={[
                    { key: "phase", label: "Phase/Timeline", type: "text", placeholder: "Now" },
                    { key: "l", label: "Label", type: "text", placeholder: "On Booking" },
                    { key: "p", label: "Percentage (%)", type: "number", placeholder: "10" }
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <ProjectionsInput name="proj_values" defaultValue={currentProp?.proj_values} />
                </div>
                <div className="md:col-span-2">
                  <ObjectArrayInput 
                    name="unit_options" 
                    label="Unit Options" 
                    defaultValue={currentProp?.unit_options} 
                    fields={[
                      { key: "label", label: "Unit Type", type: "text", placeholder: "Studio" },
                      { key: "price_aed", label: "Price (AED)", type: "number", placeholder: "649000" },
                      { key: "yield", label: "Yield (%)", type: "number", placeholder: "10.5" },
                      { key: "size_sqft", label: "Size (sqft)", type: "number", placeholder: "450" },
                      { key: "plot_size_sqft", label: "Plot Size sqft (Villa/TH)", type: "number", placeholder: "2000" }
                    ]}
                  />
                </div>
              </div>

              <div>
                <DeepDiveInput name="deep_dive_data" defaultValue={currentProp?.deep_dive_data} />
              </div>

              <div className="flex gap-6 py-2 border-t border-white/5 pt-4">
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input type="checkbox" name="hot" defaultChecked={currentProp?.hot} className="accent-gold w-4 h-4" />
                  Mark as HOT Deal
                </label>
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input type="checkbox" name="distress" defaultChecked={currentProp?.distress} className="accent-gold w-4 h-4" />
                  Mark as DISTRESS Sale
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setIsPropModalOpen(false)} className="px-6 py-2 rounded-lg text-platinum hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-lg bg-gold text-[#0A0A0F] font-semibold hover:bg-[#D4B35E] transition-all">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark2 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-heading text-2xl text-white">{currentClient ? 'Edit Client' : 'Add New Client'}</h3>
              <button onClick={() => setIsClientModalOpen(false)} className="text-platinum/50 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleClientSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Client Full Name *</label>
                  <input name="name" defaultValue={currentClient?.name} required className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Portal Slug (Optional)</label>
                  <input name="slug" defaultValue={currentClient?.slug} placeholder="e.g. prateek-khanna" className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-platinum/50 uppercase mb-1">Access Password *</label>
                <input name="password" type="text" defaultValue={currentClient?.password} required className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Budget Amount (AED)</label>
                  <input type="number" name="budget" defaultValue={currentClient?.budget} required className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Budget Label (e.g. Max Budget)</label>
                  <input name="budget_label" defaultValue={currentClient?.budget_label || "Max Budget"} required className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Portfolio Main Heading</label>
                  <input name="portfolio_heading" defaultValue={currentClient?.portfolio_heading} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" placeholder="e.g. Exclusive Portfolio Review" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Portfolio Subheading</label>
                  <input name="portfolio_subheading" defaultValue={currentClient?.portfolio_subheading} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" placeholder="e.g. Prepared for..." />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Investment Brief Tag</label>
                  <input name="brief_text" defaultValue={currentClient?.brief_text || "Confidential Investment Brief · 2025"} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Assigned Agent</label>
                  <select name="agent_id" defaultValue={currentClient?.agent_id || ''} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none ">
                    <option value="" className="text-black bg-white">No Agent</option>
                    {agents.map(a => <option key={a.id} value={a.id} className="text-black bg-white">{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Phase/Top Heading</label>
                  <input name="phase_heading" defaultValue={currentClient?.phase_heading} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" placeholder="e.g. PHASE 1 STRATEGY" />
                </div>
                <div>
                  <FileUploadInput name="video_url" defaultValue={currentClient?.video_url} label="Hero Video URL (.mp4)" />
                </div>
              </div>

              {/* Metric 1 */}
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Metric 1 Label</label>
                  <input name="metric_1_label" defaultValue={currentClient?.metric_1_label || "Market Avg. YoY Growth"} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Metric 1 Value</label>
                  <input name="metric_1_value" defaultValue={currentClient?.metric_1_value || "AED 91.8M"} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
              </div>

              {/* Metric 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Metric 2 Label</label>
                  <input name="metric_2_label" defaultValue={currentClient?.metric_2_label || "Rental Yield Range"} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Metric 2 Value</label>
                  <input name="metric_2_value" defaultValue={currentClient?.metric_2_value || "8-12%"} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
              </div>

              {/* Metric 3 */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/5">
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Metric 3 Label</label>
                  <input name="metric_3_label" defaultValue={currentClient?.metric_3_label || "Capital Gains Tax"} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-platinum/50 uppercase mb-1">Metric 3 Value</label>
                  <input name="metric_3_value" defaultValue={currentClient?.metric_3_value || "0%"} className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none" />
                </div>
              </div>

              <DraggablePropertyList initialProperties={initialProperties} currentClient={currentClient} />

              {currentClient && currentClient.chat_history && currentClient.chat_history.length > 0 && (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <h4 className="text-white text-sm uppercase tracking-widest font-medium mb-4">Chat History</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto bg-dark3 p-4 rounded-xl">
                    {currentClient.chat_history.map((msg, i) => (
                      <div key={i} className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-gold/10 text-white ml-8 border border-gold/20' : msg.role === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-platinum/80 mr-8 border border-white/5'}`}>
                        <div className="text-[10px] uppercase opacity-50 mb-1">{msg.role} - {new Date(msg.time).toLocaleString()}</div>
                        {msg.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentClient && currentClient.activity_logs && currentClient.activity_logs.length > 0 && (
                <div className="mt-4 border-t border-white/10 pt-6">
                  <h4 className="text-white text-sm uppercase tracking-widest font-medium mb-4">Activity Logs</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto bg-dark3 p-4 rounded-xl text-sm">
                    {currentClient.activity_logs.slice().reverse().map((log, i) => (
                      <div key={i} className="flex justify-between items-start border-b border-white/5 pb-2">
                        <div>
                          <span className="text-gold capitalize">{log.action.replace('_', ' ')}</span>
                          {log.details && <pre className="text-xs text-platinum/50 mt-1">{JSON.stringify(log.details)}</pre>}
                        </div>
                        <span className="text-[10px] uppercase text-platinum/40 whitespace-nowrap ml-4">{new Date(log.time).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setIsClientModalOpen(false)} className="px-6 py-2 rounded-lg text-platinum hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-lg bg-gold text-[#0A0A0F] font-semibold hover:bg-[#D4B35E] transition-all">Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat History Modal */}
      {isChatHistoryOpen && currentClient && (() => {
        const history = currentClient.chat_history || [];
        // Build a unified thread: prepend the welcome message
        const thread = [
          { role: 'assistant', text: `Welcome back, ${currentClient.name.split(' ')[0]}. How can I assist you today?`, time: null, isWelcome: true },
          ...history
        ];
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark2 border border-white/10 rounded-2xl w-full max-w-lg flex flex-col max-h-[85vh] animate-in zoom-in-95">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-dark3 rounded-t-2xl flex-shrink-0">
                <div>
                  <h3 className="font-heading text-xl text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gold"/> {currentClient.name}'s Chat History
                  </h3>
                  <p className="text-xs text-platinum/40 mt-1">{history.length} message{history.length !== 1 ? 's' : ''} logged</p>
                </div>
                <button onClick={() => setIsChatHistoryOpen(false)} className="text-platinum/50 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 overflow-y-auto flex flex-col gap-3 flex-1">
                {thread.map((msg, i) => {
                  const isUser = msg.role === 'user';
                  const isError = msg.role === 'error';
                  return (
                    <div key={i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {!isUser && <span className="text-[10px] uppercase tracking-widest text-platinum/30 font-medium">{isError ? '⚠ System' : 'AI Assistant'}</span>}
                        {msg.time && <span className="text-[10px] text-platinum/25">{new Date(msg.time).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'})}</span>}
                        {isUser && <span className="text-[10px] uppercase tracking-widest text-gold/60 font-medium">Client</span>}
                      </div>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isUser ? 'bg-gold text-[#0A0A0F] rounded-br-sm' 
                        : isError ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-bl-sm' 
                        : 'bg-dark3 border border-white/5 text-platinum/90 rounded-bl-sm'
                      }`}>
                        {msg.text || msg.content}
                      </div>
                    </div>
                  );
                })}
                {history.length === 0 && (
                  <div className="text-center py-8 text-platinum/30 text-sm">
                    <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    No chat messages yet. The welcome message is shown above.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Agent Modal */}
      {isAgentModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark2 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-dark2/90 backdrop-blur z-10">
              <h3 className="font-heading text-2xl text-white">{currentAgent ? 'Edit Agent' : 'Add Agent'}</h3>
              <button onClick={() => setIsAgentModalOpen(false)} className="text-platinum/50 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData.entries());
              
              // Map image to photo for the DB
              if (data.image !== undefined) {
                data.photo = data.image;
                delete data.image;
              }
              
              let res;
              if (currentAgent) {
                res = await updateAgentAction(currentAgent.id, data);
              } else {
                res = await addAgentAction(data);
              }

              if (!res.success) {
                alert("Failed to save agent: " + res.error);
                return;
              }

              setIsAgentModalOpen(false);
              router.refresh();
            }} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-platinum/60 mb-2">Name</label>
                  <input name="name" defaultValue={currentAgent?.name} className="w-full bg-dark3 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50" required />
                </div>
                <div>
                  <label className="block text-sm text-platinum/60 mb-2">Title</label>
                  <input name="title" defaultValue={currentAgent?.title} className="w-full bg-dark3 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50" />
                </div>
                <div>
                  <label className="block text-sm text-platinum/60 mb-2">Email</label>
                  <input name="email" defaultValue={currentAgent?.email} className="w-full bg-dark3 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50" />
                </div>
                <div>
                  <label className="block text-sm text-platinum/60 mb-2">Call Number</label>
                  <input name="phone" defaultValue={currentAgent?.phone} className="w-full bg-dark3 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50" required />
                </div>
                <div>
                  <label className="block text-sm text-platinum/60 mb-2">WhatsApp Number</label>
                  <input name="whatsapp" defaultValue={currentAgent?.whatsapp} className="w-full bg-dark3 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50" />
                </div>
                <div>
                  <label className="block text-sm text-platinum/60 mb-2">RERA BRN</label>
                  <input name="rera" defaultValue={currentAgent?.rera} className="w-full bg-dark3 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50" />
                </div>
                <div>
                  <FileUploadInput name="image" defaultValue={currentAgent?.photo} label="Image URL" />
                </div>
              </div>
              <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAgentModalOpen(false)} className="px-6 py-3 rounded-xl text-platinum/60 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-gold hover:bg-[#E8C97A] text-[#0A0A0F] font-medium px-8 py-3 rounded-xl transition-all">Save Agent</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Proposal Modal */}
      {isProposalModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark2 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-heading text-2xl text-white">Create Proposal</h3>
              <button onClick={() => setIsProposalModalOpen(false)} className="text-platinum/50 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreateProposal} className="p-6 space-y-6">
              <div>
                <label className="block text-xs text-platinum/50 uppercase mb-2">Select Client</label>
                <select name="client_id" required className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none ">
                  <option value="" className="bg-dark2 text-white">Select a client...</option>
                  {initialClients.map(c => <option key={c.id} value={c.id} className="bg-dark2 text-white">{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-platinum/50 uppercase mb-2">Select Properties (Hold Ctrl/Cmd to multi-select)</label>
                <select name="property_ids" required multiple className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none min-h-[150px] ">
                  {initialProperties.map(p => <option key={p.id} value={p.id} className="bg-dark2 text-white">{p.name} (AED {p.price_aed.toLocaleString()})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-platinum/50 uppercase mb-2">Personalized Message</label>
                <textarea name="message" required rows={4} placeholder="Write a custom introductory message for the client..." className="w-full bg-dark3 border border-white/10 rounded-lg p-3 text-white focus:border-gold/50 focus:outline-none"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-4 border-t border-white/5">
                <button type="button" onClick={() => setIsProposalModalOpen(false)} className="px-6 py-2 rounded-xl font-medium text-platinum hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-gold hover:bg-[#E8C97A] text-[#0A0A0F] px-6 py-2 rounded-xl font-medium transition-colors">Create Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Agent Modal is injected inside the main div instead:
