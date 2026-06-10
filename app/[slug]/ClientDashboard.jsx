"use client";
import { useState, useEffect } from "react";
import { Diamond, LogOut, MessageSquare, Send, X, ExternalLink, CalendarDays, PlayCircle } from "lucide-react";

export default function ClientDashboard({ client, properties, initialProposals = [], agent }) {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [bundleOpen, setBundleOpen] = useState(false);
  const [proposalsOpen, setProposalsOpen] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [proposals, setProposals] = useState(initialProposals);
  const [chatMessage, setChatMessage] = useState("");
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [proposalMessage, setProposalMessage] = useState(`Hi ${client.name.split(' ')[0]},\n\nBased on your selections, here is your customized acquisition proposal.`);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [previewImage, setPreviewImage] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: `Welcome back, ${client.name.split(' ')[0]}. I am ${agent?.name || 'your AI Wealth Advisor'}. How can I assist you with your portfolio today?` }
  ]);

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: client.slug, action: "viewed_portal", details: { browser: window.navigator.userAgent } })
    }).catch(e => console.error(e));
  }, [client.slug]);

  const handlePropertySelect = (p) => {
    setSelectedProperty(p);
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: client.slug, action: "viewed_property", details: { propertyName: p.name } })
    }).catch(e => console.error(e));
  };

  const handleLogout = () => {
    document.cookie = "clientSlug=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
  };

  const filteredProperties = properties.filter(p => {
    if (filterType === 'all') return true;
    if (filterType === 'hot') return p.hot;
    if (filterType === 'distress') return p.distress;
    if (filterType === 'offplan') return p.type?.toLowerCase() === 'offplan';
    if (filterType === 'ready') return p.type?.toLowerCase() === 'ready';
    return true;
  });

  const togglePropertyInPortfolio = (propId) => {
    setPortfolio(prev => 
      prev.includes(propId) ? prev.filter(id => id !== propId) : [...prev, propId]
    );
  };

  const totalBudget = client.budget || 5000000;
  const usedBudget = portfolio.reduce((acc, propId) => {
    const p = properties.find(x => x.id === propId);
    return acc + (p ? p.price_aed : 0);
  }, 0);
  const budgetPercentage = Math.min((usedBudget / totalBudget) * 100, 100);
  const remainingBudget = totalBudget - usedBudget;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatMessage("");
    
    const newHistory = [...chatHistory, { role: "user", content: userMsg }];
    setChatHistory(newHistory);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory,
          clientContext: { slug: client.slug, name: client.name, properties, agentName: agent ? agent.name.split(' ')[0] : null }
        })
      });
      const data = await res.json();
      if (data.reply) {
        setChatHistory(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setChatHistory(prev => [...prev, { role: "assistant", content: "I'm sorry, I'm having trouble connecting right now." }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "assistant", content: "Error connecting to AI server." }]);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Diamond className="w-8 h-8 text-gold" />
            <div className="font-heading text-xl font-semibold tracking-wide text-white">
              BITSS Prestige <span className="text-gold font-light">Realty</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-sm text-platinum/70">
              Welcome, <span className="text-white font-medium">{client.name}</span>
            </div>
            <button onClick={handleLogout} className="text-platinum/50 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full relative">
        {/* Advanced Hero Section */}
        <section className="relative min-h-[90vh] py-20 px-6 flex flex-col justify-center items-center text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,168,76,0.12)_0%,transparent_60%),radial-gradient(ellipse_at_80%_80%,rgba(74,158,255,0.05)_0%,transparent_50%),var(--background)] pointer-events-none"></div>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)' }}></div>
          
          <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-5 py-2 text-xs tracking-widest uppercase text-gold mb-8 shadow-[0_0_20px_rgba(201,168,76,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
              Confidential Investment Brief · 2025
            </div>
            
            <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-light leading-none tracking-tight mb-6">
              {client.portfolio_heading || "Client Portfolio"}<br/>
              <em className="italic text-gold">{client.phase_heading || "Dubai Real Estate"}</em>
            </h1>
            
            <p className="text-platinum/70 text-base sm:text-lg max-w-2xl font-light leading-relaxed mb-12">
              {client.portfolio_subheading || `An exclusive, highly curated strategy designed specifically for you — focusing on high-leverage distress deals, premium pre-launches, and maximum rental yields.`}
            </p>

            {client.video_url && (
              <div className="w-full max-w-4xl mb-16 rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] bg-dark1">
                <video src={client.video_url} controls autoPlay muted playsInline loop className="w-full aspect-video object-cover"></video>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-8 sm:gap-16 mb-16">
              <div className="text-center">
                <div className="font-heading text-3xl sm:text-5xl font-semibold text-gold mb-1">{client.metric_1_value || "AED 91.8M"}</div>
                <div className="text-[11px] tracking-widest uppercase text-platinum/50">{client.metric_1_label || "Market Avg. YoY Growth"}</div>
              </div>
              <div className="text-center">
                <div className="font-heading text-3xl sm:text-5xl font-semibold text-gold mb-1">{client.metric_2_value || "8–12%"}</div>
                <div className="text-[11px] tracking-widest uppercase text-platinum/50">{client.metric_2_label || "Rental Yield Range"}</div>
              </div>
              <div className="text-center">
                <div className="font-heading text-3xl sm:text-5xl font-semibold text-gold mb-1">{client.metric_3_value || "0%"}</div>
                <div className="text-[11px] tracking-widest uppercase text-platinum/50">{client.metric_3_label || "Capital Gains Tax"}</div>
              </div>
              <div className="text-center">
                <div className="font-heading text-3xl sm:text-5xl font-semibold text-gold mb-1">{client.budget ? `${(client.budget / 1000000).toFixed(1)}M` : "5M"}</div>
                <div className="text-[11px] tracking-widest uppercase text-platinum/50">{client.budget_label || "AED Phase 1 Budget"}</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 text-[11px] tracking-widest uppercase text-platinum/40 mt-8 animate-bounce">
              <span>Explore Properties</span>
              <div className="w-px h-10 bg-gradient-to-b from-gold to-transparent mx-auto"></div>
            </div>
          </div>
        </section>

        {/* Budget Bar */}
        <div className="bg-[#0A0A0F]/90 backdrop-blur-3xl border-b border-white/5 px-6 py-4 flex flex-col sm:flex-row items-center gap-6 sticky top-20 z-30 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          <div className="flex-shrink-0 text-center sm:text-left">
            <div className="text-[11px] tracking-widest uppercase text-platinum/50 mb-1">{client.budget_label || "Phase 1 Budget"}</div>
            <div className="font-heading text-2xl font-semibold text-gold">AED {totalBudget.toLocaleString("en-US")}</div>
          </div>
          <div className="flex-1 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gold to-[#E8C97A] transition-all duration-500 ease-out" style={{ width: `${budgetPercentage}%` }}></div>
          </div>
          <div className="flex-shrink-0 text-sm text-platinum/60">
            <strong className="text-white font-medium">AED {remainingBudget.toLocaleString("en-US")}</strong> remaining
          </div>
          <button 
            onClick={() => setBundleOpen(true)}
            className="flex items-center gap-3 bg-gold hover:bg-[#E8C97A] text-[#0A0A0F] px-5 py-2.5 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center"
          >
            My Portfolio
            <div className="bg-[#0A0A0F] text-gold text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {portfolio.length}
            </div>
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="inline-flex items-center gap-3 text-[11px] tracking-widest uppercase text-gold mb-4">
                Curated Picks
                <div className="h-px bg-gold/20 w-16"></div>
              </div>
              <h2 className="font-heading text-4xl sm:text-5xl text-white">
                {client.phase_heading || "Phase 1"} — <strong className="font-semibold italic text-gold">AED {client.budget ? `${(client.budget / 1000000).toFixed(1)}M` : "5M"}</strong>
              </h2>
            </div>
            <button 
              onClick={() => setChatOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-full border border-white/10 transition-all font-medium"
            >
              <MessageSquare className="w-4 h-4" /> Ask AI Advisor
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button onClick={() => setFilterType('all')} className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-gold text-[#0A0A0F] font-bold' : 'bg-dark3 text-platinum/60 hover:bg-white/10 hover:text-white'}`}>All</button>
            <button onClick={() => setFilterType('hot')} className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all ${filterType === 'hot' ? 'bg-red-500 text-white font-bold' : 'bg-dark3 text-platinum/60 hover:bg-white/10 hover:text-white'}`}>Hot</button>
            <button onClick={() => setFilterType('distress')} className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all ${filterType === 'distress' ? 'bg-orange-500 text-white font-bold' : 'bg-dark3 text-platinum/60 hover:bg-white/10 hover:text-white'}`}>Distress</button>
            <button onClick={() => setFilterType('offplan')} className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all ${filterType === 'offplan' ? 'bg-white/20 text-white font-bold' : 'bg-dark3 text-platinum/60 hover:bg-white/10 hover:text-white'}`}>Off-Plan</button>
            <button onClick={() => setFilterType('ready')} className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all ${filterType === 'ready' ? 'bg-white/20 text-white font-bold' : 'bg-dark3 text-platinum/60 hover:bg-white/10 hover:text-white'}`}>Ready to Rent</button>
          </div>

        {filteredProperties.length === 0 ? (
          <div className="bg-dark2 border border-white/5 rounded-2xl p-12 text-center">
            <Diamond className="w-12 h-12 text-gold/30 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">No assets currently assigned</h3>
            <p className="text-platinum/50">Your advisor is currently sourcing off-market opportunities that match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map(p => (
              <div 
                key={p.id} 
                className="bg-dark2 border border-white/5 rounded-2xl overflow-hidden hover:border-gold/30 transition-all flex flex-col group cursor-pointer"
                onClick={() => handlePropertySelect(p)}
              >
                <div className="h-64 relative bg-dark1 overflow-hidden">
                    {p.image ? (
                      <img src={p.image} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700 cursor-zoom-in" onClick={(e) => { e.stopPropagation(); setPreviewImage(p.image); }} />
                    ) : null}
                    <div className="absolute top-4 right-4 flex gap-2">
                    {p.hot && <span className="bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">HOT</span>}
                    {p.distress && <span className="bg-orange-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">DISTRESS</span>}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-heading text-2xl text-white mb-2 group-hover:text-gold transition-colors">{p.name}</h3>
                  <p className="text-sm text-platinum/60 mb-6 flex-1">{p.location}</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 mb-4">
                    <div>
                      <div className="text-xs text-platinum/40 uppercase tracking-widest mb-1">Entry Price</div>
                      <div className="text-white font-medium text-lg">AED {p.price_aed.toLocaleString("en-US")}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-platinum/40 uppercase tracking-widest mb-1">Projected Yield</div>
                      <div className="text-gold font-semibold text-lg">{p.gross_yield}%</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-auto">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedProperty(p); }}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm transition-colors border border-white/10"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); togglePropertyInPortfolio(p.id); }}
                      className={`py-2 px-4 rounded-lg text-sm transition-colors border ${portfolio.includes(p.id) ? 'bg-gold/20 text-gold border-gold/50' : 'bg-transparent text-platinum/60 border-white/10 hover:border-gold hover:text-gold'}`}
                    >
                      {portfolio.includes(p.id) ? 'Added' : '+'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

        {/* Why Dubai & Compare Section */}
        {properties.length > 0 && (
          <div className="bg-dark2 border-t border-white/5 pt-20 pb-24 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.05)_0%,transparent_70%)] pointer-events-none"></div>
            <div className="max-w-7xl mx-auto relative z-10">
              
              <div className="mb-20">
                <div className="inline-flex items-center gap-3 text-[11px] tracking-widest uppercase text-gold mb-4">
                  Market Intelligence
                  <div className="h-px bg-gold/20 w-16"></div>
                </div>
                <h2 className="font-heading text-4xl sm:text-5xl text-white mb-12">
                  Why Dubai <strong className="font-semibold text-gold">Outperforms</strong>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-dark3 border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-all hover:-translate-y-1">
                    <div className="text-gold font-heading text-4xl mb-4 opacity-50">01</div>
                    <h3 className="text-xl text-white font-medium mb-3">Zero Tax Environment</h3>
                    <p className="text-sm text-platinum/60 leading-relaxed">No capital gains, no income tax on rental yields, no inheritance tax. Maximum net returns every year.</p>
                  </div>
                  <div className="bg-dark3 border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-all hover:-translate-y-1 delay-75">
                    <div className="text-gold font-heading text-4xl mb-4 opacity-50">02</div>
                    <h3 className="text-xl text-white font-medium mb-3">8–12% Gross Yield</h3>
                    <p className="text-sm text-platinum/60 leading-relaxed">Dubai consistently delivers the highest rental yields among global prime markets — vs 3-4% in London, 2-3% in Singapore.</p>
                  </div>
                  <div className="bg-dark3 border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-all hover:-translate-y-1 delay-150">
                    <div className="text-gold font-heading text-4xl mb-4 opacity-50">03</div>
                    <h3 className="text-xl text-white font-medium mb-3">60% Expat Rental Demand</h3>
                    <p className="text-sm text-platinum/60 leading-relaxed">Over 3.5M expats create perpetual rental demand. Vacancy rates in prime corridors stay below 4%.</p>
                  </div>
                  <div className="bg-dark3 border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-all hover:-translate-y-1 delay-200">
                    <div className="text-gold font-heading text-4xl mb-4 opacity-50">04</div>
                    <h3 className="text-xl text-white font-medium mb-3">Off-Plan Leverage</h3>
                    <p className="text-sm text-platinum/60 leading-relaxed">Buy at launch prices. 10–20% down secures the unit. Flip at completion for 30–60% capital gain. No loan required.</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-3 text-[11px] tracking-widest uppercase text-gold mb-4">
                  Head to Head
                  <div className="h-px bg-gold/20 w-16"></div>
                </div>
                <h2 className="font-heading text-4xl sm:text-5xl text-white mb-8">
                  All Picks — <strong className="font-semibold text-gold">Instant Comparison</strong>
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-4 px-4 text-xs tracking-widest text-platinum/40 uppercase font-medium">Property</th>
                        <th className="py-4 px-4 text-xs tracking-widest text-platinum/40 uppercase font-medium">Type</th>
                        <th className="py-4 px-4 text-xs tracking-widest text-platinum/40 uppercase font-medium">Location</th>
                        <th className="py-4 px-4 text-xs tracking-widest text-platinum/40 uppercase font-medium">Price (AED)</th>
                        <th className="py-4 px-4 text-xs tracking-widest text-platinum/40 uppercase font-medium">Gross Yield</th>
                        <th className="py-4 px-4 text-xs tracking-widest text-platinum/40 uppercase font-medium">5-Yr Cap Gain</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map(p => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedProperty(p)}>
                          <td className="py-4 px-4 text-white font-medium flex items-center gap-3">
                            <div className="w-10 h-10 rounded overflow-hidden bg-dark1 flex-shrink-0">
                              {p.image && <img src={p.image} className="w-full h-full object-cover" />}
                            </div>
                            {p.name}
                          </td>
                          <td className="py-4 px-4 text-platinum/70 text-sm capitalize">{p.type}</td>
                          <td className="py-4 px-4 text-platinum/70 text-sm">{p.location}</td>
                          <td className="py-4 px-4 text-gold font-medium">{(p.price_aed / 1000000).toFixed(2)}M</td>
                          <td className="py-4 px-4 text-green-400 text-sm">{p.gross_yield}%</td>
                          <td className="py-4 px-4 text-platinum/70 text-sm">{p.capital_appreciation}% Est.</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agent Profile Section */}
        {agent && (
          <div className="mt-12 bg-dark2 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-white/10 bg-dark3 flex-shrink-0 flex items-center justify-center">
              {agent.image ? (
                <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-gold font-heading">{agent.name?.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-heading text-white mb-2">{agent.name}</h3>
              <p className="text-platinum/60 text-sm mb-4 leading-relaxed max-w-2xl">{agent.title || 'Licensed Dubai Realtor • Specialist in High-Value Investment Portfolios'}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {agent.email && (
                  <a href={`mailto:${agent.email}`} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-full text-sm font-medium transition-all">
                    Email
                  </a>
                )}
                {agent.phone && (
                  <a href={`tel:${agent.phone}`} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-full text-sm font-medium transition-all">
                    Call
                  </a>
                )}
                <a href={`https://wa.me/${(agent.whatsapp || agent.phone || '971500000000').replace(/\+/g, '')}`} target="_blank" className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 rounded-full text-sm font-medium transition-all">
                  <svg viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                  WhatsApp
                </a>
                {agent.rera && (
                  <span className="bg-dark3 border border-white/5 text-platinum/50 px-4 py-2 rounded-full text-xs font-medium">
                    BRN: {agent.rera}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Chat Button for Mobile */}
      <button 
        onClick={() => setChatOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-gold rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(201,168,76,0.3)] z-40"
      >
        <MessageSquare className="w-6 h-6 text-[#0A0A0F]" />
      </button>

      {/* WhatsApp Floating Button */}
      <a 
        href={`https://wa.me/${(agent?.phone || '971500000000').replace(/\+/g, '')}`}
        target="_blank"
        className="fixed bottom-[6.5rem] right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40 cursor-pointer"
      >
        <svg viewBox="0 0 448 512" fill="white" className="w-8 h-8">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </a>

      {/* Property Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark2 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedProperty(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="h-80 relative bg-dark1">
              {selectedProperty.image && <img src={selectedProperty.image} alt={selectedProperty.name} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setPreviewImage(selectedProperty.image)} />}
              <div className="absolute inset-0 bg-gradient-to-t from-dark2 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 mb-2">
                  {selectedProperty.hot && <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded">HOT</span>}
                  {selectedProperty.distress && <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded">DISTRESS</span>}
                </div>
                <h2 className="font-heading text-4xl text-white mb-2">{selectedProperty.name}</h2>
                <p className="text-platinum/80 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> {selectedProperty.handover}</p>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-dark3 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-platinum/40 uppercase tracking-widest mb-1">Developer</div>
                  <div className="text-white font-medium">{selectedProperty.developer}</div>
                </div>
                <div className="bg-dark3 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-platinum/40 uppercase tracking-widest mb-1">Entry Price</div>
                  <div className="text-gold font-medium">AED {(selectedProperty.price_aed || 0).toLocaleString("en-US")}</div>
                </div>
                <div className="bg-dark3 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-platinum/40 uppercase tracking-widest mb-1">Capital Apprec.</div>
                  <div className="text-white font-medium">{selectedProperty.capital_appreciation}% Est.</div>
                </div>
                <div className="bg-dark3 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-platinum/40 uppercase tracking-widest mb-1">Gross Yield</div>
                  <div className="text-white font-medium">{selectedProperty.gross_yield}% Projected</div>
                </div>
              </div>

              {/* USPs */}
              {(selectedProperty.usps?.length > 0 || selectedProperty.hot_usps?.length > 0) && (
                <div className="mb-10 flex flex-wrap gap-2">
                  {selectedProperty.hot_usps?.map((u, i) => (
                    <span key={'hot'+i} className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full text-sm font-medium">{u}</span>
                  ))}
                  {selectedProperty.usps?.map((u, i) => (
                    <span key={'std'+i} className="bg-white/5 text-platinum/80 border border-white/10 px-3 py-1.5 rounded-full text-sm">{u}</span>
                  ))}
                </div>
              )}

              {selectedProperty.unit_options && selectedProperty.unit_options.length > 0 && (
                <div className="mb-10">
                  <h3 className="font-heading text-xl text-white mb-4">Unit Availability</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedProperty.unit_options.map((opt, i) => (
                      <div key={i} className="bg-dark3 border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-gold/30 transition-colors">
                        <div className="text-white font-medium mb-2">{opt.label}</div>
                        <div className="flex justify-between items-end">
                          <div className="text-gold font-semibold text-lg">AED {(opt.priceAED || opt.price_aed || 0).toLocaleString("en-US")}</div>
                          <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded font-medium">{opt.yield}% Yield</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProperty.payment_plan && selectedProperty.payment_plan.length > 0 && (
                <div className="mb-10">
                  <h3 className="font-heading text-xl text-white mb-4">Payment Plan</h3>
                  <div className="flex overflow-x-auto gap-4 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {selectedProperty.payment_plan.map((step, i) => (
                      <div key={i} className="bg-dark3 border border-white/5 rounded-xl p-5 min-w-[200px] flex-shrink-0 relative overflow-hidden group snap-start">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gold/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                        <div className="text-xs text-platinum/50 uppercase tracking-widest mb-1">{step.phase}</div>
                        <div className="text-white font-medium mb-3">{step.l || step.label}</div>
                        <div className="text-3xl font-heading text-gold">{step.p}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProperty.why && selectedProperty.why.length > 0 && (
                <div className="mb-10">
                  <h3 className="font-heading text-xl text-white mb-6">Key Investment Drivers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedProperty.why.map((w, i) => (
                      <div key={i} className="bg-dark3 rounded-xl p-5 border border-white/5 flex gap-4">
                        <div className="text-2xl">{w.icon || "📈"}</div>
                        <div>
                          <div className="font-medium text-white mb-1">{w.title}</div>
                          <div className="text-sm text-platinum/60 leading-relaxed">{w.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProperty.deep_dive_data && Object.keys(selectedProperty.deep_dive_data).length > 0 && (
                <div className="mb-10 pt-10 border-t border-white/5">
                  <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full text-xs uppercase tracking-widest font-semibold mb-8 border border-gold/20 shadow-[0_0_20px_rgba(201,168,76,0.1)]">
                    <Diamond className="w-3 h-3" /> Deep Dive Analysis
                  </div>
                  
                  {selectedProperty.deep_dive_data.feature_title && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-center">
                      <div>
                        <h4 className="font-heading text-3xl text-gold mb-4">{selectedProperty.deep_dive_data.feature_title}</h4>
                        <p className="text-platinum/70 leading-relaxed mb-6">{selectedProperty.deep_dive_data.feature_desc}</p>
                        {selectedProperty.deep_dive_data.feature_bullets && selectedProperty.deep_dive_data.feature_bullets.length > 0 && (
                          <ul className="space-y-3">
                            {selectedProperty.deep_dive_data.feature_bullets.map((b, i) => (
                              <li key={i} className="flex gap-3 text-sm text-platinum/60">
                                <span className="text-gold mt-0.5">•</span>
                                <span dangerouslySetInnerHTML={{__html: b}}></span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {selectedProperty.deep_dive_data.feature_image && (
                        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                          <img src={'/' + selectedProperty.deep_dive_data.feature_image.replace(/^\//, '')} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-zoom-in" alt="Feature" onClick={() => setPreviewImage('/' + selectedProperty.deep_dive_data.feature_image.replace(/^\//, ''))} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Gallery & Map & Video */}
                  {(selectedProperty.deep_dive_data.gallery_images?.length > 0 || selectedProperty.deep_dive_data.map_url || selectedProperty.deep_dive_data.video_url) && (
                    <div className="mb-12">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-heading text-xl text-white">{selectedProperty.deep_dive_data.gallery_title || "Gallery"}</h3>
                        <div className="flex gap-4">
                          {selectedProperty.deep_dive_data.video_url && (
                            <button onClick={() => setPreviewImage(selectedProperty.deep_dive_data.video_url)} className="text-gold text-sm flex items-center gap-2 hover:underline">
                              <PlayCircle className="w-4 h-4"/> Watch Video
                            </button>
                          )}
                          {selectedProperty.deep_dive_data.map_url && (
                            <a href={selectedProperty.deep_dive_data.map_url} target="_blank" className="text-gold text-sm flex items-center gap-2 hover:underline">
                              <ExternalLink className="w-4 h-4"/> View Map
                            </a>
                          )}
                        </div>
                      </div>
                      {selectedProperty.deep_dive_data.gallery_images?.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedProperty.deep_dive_data.gallery_images.map((img, i) => {
                            const isVideo = img.toLowerCase().endsWith('.mp4') || img.toLowerCase().endsWith('.webm') || img.toLowerCase().endsWith('.ogg');
                            return (
                              <div key={i} className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition-transform cursor-zoom-in" onClick={() => setPreviewImage('/' + img.replace(/^\//, ''))}>
                                {isVideo ? (
                                  <>
                                    <video src={'/' + img.replace(/^\//, '')} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40"><PlayCircle className="w-8 h-8 text-white/80" /></div>
                                  </>
                                ) : (
                                  <img src={'/' + img.replace(/^\//, '')} className="w-full h-full object-cover" alt="Gallery" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
\n                  {selectedProperty.deep_dive_data.market_title && (
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10 mb-8 backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                      <h4 className="font-heading text-2xl text-white mb-3 relative z-10">{selectedProperty.deep_dive_data.market_title}</h4>
                      <p className="text-sm text-platinum/60 mb-8 relative z-10" dangerouslySetInnerHTML={{__html: selectedProperty.deep_dive_data.market_desc}}></p>
                      
                      {selectedProperty.deep_dive_data.market_data_points && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 relative z-10">
                          {selectedProperty.deep_dive_data.market_data_points.map((dp, i) => (
                            <div key={i} className="bg-dark3 rounded-xl p-4 border border-white/5">
                              <div className="text-xs text-platinum/40 uppercase tracking-widest mb-2">{dp.label}</div>
                              <div className="text-gold font-heading text-3xl mb-1">{dp.value}</div>
                              <div className="text-xs text-platinum/60">{dp.subtitle}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedProperty.deep_dive_data.roi_text && (
                        <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
                          {selectedProperty.deep_dive_data.market_image && (
                            <img src={'/' + selectedProperty.deep_dive_data.market_image.replace(/^\//, '')} className="w-32 h-32 rounded-xl object-cover border border-white/10 flex-shrink-0 shadow-lg cursor-zoom-in" alt="Market" onClick={() => setPreviewImage('/' + selectedProperty.deep_dive_data.market_image.replace(/^\//, ''))} />
                          )}
                          <div>
                            <div className="text-gold font-medium mb-2 flex items-center gap-2">
                              <span className="text-lg">📈</span> ROI Calculation
                            </div>
                            <p className="text-sm text-platinum/60 leading-relaxed" dangerouslySetInnerHTML={{__html: selectedProperty.deep_dive_data.roi_text}}></p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedProperty.deep_dive_data.arbitrage_title && (
                    <div className="bg-gradient-to-br from-gold/10 to-transparent p-6 rounded-xl border border-gold/20 shadow-inner">
                      <h4 className="text-gold font-heading text-xl mb-2">{selectedProperty.deep_dive_data.arbitrage_title}</h4>
                      <p className="text-sm text-platinum/70 leading-relaxed" dangerouslySetInnerHTML={{__html: selectedProperty.deep_dive_data.arbitrage_body}}></p>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-10">
                <h3 className="font-heading text-2xl text-white mb-4">Investment Rationale</h3>
                <p className="text-platinum/70 leading-relaxed whitespace-pre-wrap">{selectedProperty.reason}</p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setChatOpen(true);
                    setChatMessage(`I am interested in ${selectedProperty.name}. Can we discuss further?`);
                    setSelectedProperty(null);
                  }}
                  className="flex-1 bg-gold hover:bg-[#D4B35E] text-[#0A0A0F] font-semibold py-4 rounded-xl transition-all text-center"
                >
                  Discuss with Advisor
                </button>
                {selectedProperty.link && (
                  <a href={selectedProperty.link} target="_blank" className="flex items-center justify-center gap-2 px-8 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all">
                    View Docs <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Drawer */}
      {chatOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[#0A0A0F]/80 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="h-20 border-b border-white/5 px-6 flex items-center justify-between bg-dark3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center border border-gold/20">
                <Diamond className="w-5 h-5 text-gold" />
              </div>
              <div>
                <div className="text-white font-medium">{agent ? agent.name.split(' ')[0] + ' Assistant' : 'Wealth Advisor'}</div>
                <div className="text-xs text-gold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse"></span> Online
                </div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-platinum/50 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-gold text-[#0A0A0F] rounded-br-sm font-medium' 
                    : 'bg-dark3 border border-white/5 text-platinum/90 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-4 px-6 pb-2">
            {[
              { label: "📈 Best yield?", text: "What are the best properties for rental yield?" },
              { label: "💰 Lowest entry?", text: "Which property has the lowest entry point?" },
              { label: "📋 Payment plans", text: "Tell me about payment plans available" },
              { label: "🔥 Distress deals", text: "Which properties are distress deals?" },
              { label: "📄 Send proposal", text: "I want to send a formal proposal to my agent" },
              { label: "🏛️ Tax benefits", text: "What are the tax benefits of investing in Dubai?" }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setChatMessage(chip.text);
                  // Optionally submit immediately or let user submit
                }}
                className="text-xs bg-white/5 border border-white/10 text-platinum/70 hover:text-gold hover:border-gold/30 hover:bg-gold/10 px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
              >
                {chip.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-dark3 flex gap-2">
            <input 
              type="text" 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask about your portfolio..."
              className="flex-1 bg-dark1 border border-white/10 rounded-full px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/50"
            />
            <button 
              type="submit"
              disabled={!chatMessage.trim()}
              className="w-12 h-12 bg-gold text-[#0A0A0F] rounded-full flex items-center justify-center hover:bg-[#D4B35E] transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4 ml-1" />
            </button>
          </form>
        </div>
      )}

      {/* Portfolio Bundle Drawer */}
      {bundleOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end animate-in fade-in">
          <div className="w-full sm:w-[500px] bg-dark2 border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="h-20 border-b border-white/5 px-6 flex items-center justify-between bg-dark3 flex-shrink-0">
              <h2 className="font-heading text-2xl text-white">Your Portfolio</h2>
              <button onClick={() => setBundleOpen(false)} className="text-platinum/50 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {portfolio.length === 0 ? (
                <div className="text-center py-12 text-platinum/50">
                  <Diamond className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Your portfolio is currently empty.</p>
                  <p className="text-sm mt-2">Add properties to see your aggregated projected returns.</p>
                </div>
              ) : (
                <>
                  {/* Pie Chart */}
                  {(() => {
                    let acc = 0;
                    const colors = ['#C9A84C', '#4A9EFF', '#2ECC71', '#E74C3C', '#9B59B6', '#E67E22'];
                    const gradient = portfolio.map((id, i) => {
                      const p = properties.find(x => x.id === id);
                      if (!p) return null;
                      const pct = (p.price_aed / usedBudget) * 100;
                      const start = acc;
                      acc += pct;
                      return `${colors[i % colors.length]} ${start}% ${acc}%`;
                    }).filter(Boolean).join(', ');
                    
                    return (
                      <div className="flex flex-col sm:flex-row items-center gap-6 mb-4 p-4 bg-dark3/50 rounded-xl border border-white/5">
                        <div className="w-24 h-24 rounded-full shadow-[0_0_20px_rgba(201,168,76,0.15)] flex-shrink-0" style={{ background: `conic-gradient(${gradient})` }}></div>
                        <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                          {portfolio.map((id, i) => {
                            const p = properties.find(x => x.id === id);
                            if (!p) return null;
                            return (
                              <div key={id} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: colors[i % colors.length]}}></span>
                                <span className="text-platinum/80 truncate" title={p.name}>{p.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Portfolio List */}
                  {portfolio.map(id => {
                    const p = properties.find(x => x.id === id);
                    if (!p) return null;
                    return (
                      <div key={id} className="bg-dark3 border border-white/5 rounded-xl p-4 flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-lg bg-dark1 flex-shrink-0 overflow-hidden border border-white/10">
                          {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">{p.emoji || "🏢"}</div>}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white mb-1">{p.name}</div>
                          <div className="text-xs text-platinum/50">{p.location}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gold font-medium">AED {(p.price_aed / 1000000).toFixed(1)}M</div>
                          <div className="text-xs text-green-400">{p.gross_yield}% Yield</div>
                        </div>
                        <button onClick={() => togglePropertyInPortfolio(id)} className="p-2 text-platinum/40 hover:text-red-400 transition-colors ml-2">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
            
            {portfolio.length > 0 && (
              <div className="border-t border-white/5 p-6 bg-dark3 flex-shrink-0 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-platinum/60">Total Investment</span>
                  <span className="font-medium text-white">AED {usedBudget.toLocaleString("en-US")}</span>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setProposalsOpen(true)}
                      className="bg-dark3 hover:bg-white/10 text-white border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium"
                    >
                      View Proposals
                    </button>
                    <button 
                      onClick={() => setIsMessageModalOpen(true)}
                      className="bg-gold hover:bg-[#E8C97A] text-[#0A0A0F] py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold"
                    >
                      Save Proposal
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => window.print()} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-medium">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Download PDF
                    </button>
                    <a href={`https://wa.me/${(agent?.phone || '971500000000').replace(/\+/g, '')}?text=${encodeURIComponent(`Hi ${agent?.name ? agent.name.split(' ')[0] : 'there'},\n\nI want to acquire my portfolio:\n` + portfolio.map(id => `- ${properties.find(x => x.id === id)?.name}`).join('\n'))}`} target="_blank" className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-medium">
                      <svg viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proposals Modal */}
      {proposalsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark2 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-heading text-2xl text-white">My Proposals</h3>
              <button onClick={() => setProposalsOpen(false)} className="text-platinum/50 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              {proposals.length === 0 ? (
                <div className="text-center py-8 text-platinum/50">You have no saved proposals yet.</div>
              ) : (
                proposals.map(p => (
                  <div key={p.id} className="bg-dark3 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-white mb-1">{p.propertyName}</div>
                      <div className="text-xs text-platinum/50">Generated on {new Date(p.created_at).toLocaleDateString("en-GB")}</div>
                    </div>
                    <div className="flex gap-2">
                      <a href={`/proposals/${p.id}`} target="_blank" className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg transition-colors" title="View Proposal"><ExternalLink className="w-4 h-4"/></a>
                      <a href={`/api/proposals/${p.id}/pdf`} target="_blank" className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg transition-colors" title="Download PDF">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                      </a>
                      <a href={`https://wa.me/${client.agent_whatsapp || '971500000000'}?text=${encodeURIComponent(`Hi, I've reviewed my proposal for ${p.propertyName}. Here is the link: ${window.location.origin}/proposals/${p.id}. Let's proceed.`)}`} target="_blank" className="bg-green-500/10 hover:bg-green-500/20 text-green-400 p-2 rounded-lg transition-colors" title="Send to Agent via WhatsApp">
                        <svg viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                      </a>
                      <button onClick={async () => {
                        if(!confirm("Delete this proposal?")) return;
                        const res = await fetch(`/api/proposals/${p.id}`, { method: "DELETE" });
                        if(res.ok) setProposals(proposals.filter(x => x.id !== p.id));
                      }} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-colors" title="Delete Proposal">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Proposal Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-dark2 border border-white/10 rounded-2xl w-full max-w-lg animate-in zoom-in-95">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-heading text-2xl text-white">Save Proposal</h3>
              <button onClick={() => setIsMessageModalOpen(false)} className="text-platinum/50 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-platinum/80">Enter a personalized message for this proposal. This will appear on the cover page of the generated PDF.</p>
              <textarea 
                rows={5}
                value={proposalMessage}
                onChange={e => setProposalMessage(e.target.value)}
                className="w-full bg-dark3 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold/50"
                placeholder="Write your custom message here..."
              ></textarea>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button onClick={() => setIsMessageModalOpen(false)} className="px-6 py-2 rounded-xl text-platinum hover:text-white transition-colors">Cancel</button>
                <button 
                  onClick={async () => {
                    setIsGenerating(true);
                    const props = properties.filter(p => portfolio.includes(p.id));
                    const newProposal = {
                      client_id: client.id,
                      clientName: client.name,
                      clientSlug: client.slug,
                      property_ids: portfolio,
                      propertyName: props.map(p => p.name).join(", "),
                      message: proposalMessage
                    };
                    const res = await fetch("/api/proposals", {
                      method: "POST",
                      headers: {"Content-Type": "application/json"},
                      body: JSON.stringify(newProposal)
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setProposals([data.proposal, ...proposals]);
                      setIsMessageModalOpen(false);
                      setBundleOpen(false);
                      setProposalsOpen(true);
                    }
                    setIsGenerating(false);
                  }}
                  disabled={isGenerating}
                  className="bg-gold hover:bg-[#E8C97A] text-[#0A0A0F] font-semibold px-6 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? 'Saving...' : 'Save & Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gold transition-colors z-50">
            <X className="w-8 h-8" />
          </button>
          {(previewImage.toLowerCase().endsWith('.mp4') || previewImage.toLowerCase().endsWith('.webm') || previewImage.toLowerCase().endsWith('.ogg')) ? (
            <video src={previewImage} autoPlay controls className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain select-none" onClick={e => e.stopPropagation()} />
          ) : (
            <img src={previewImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain select-none cursor-default" onClick={e => e.stopPropagation()} />
          )}
        </div>
      )}
    </div>
  );
}
