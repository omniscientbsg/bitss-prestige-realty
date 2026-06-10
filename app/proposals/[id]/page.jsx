import { db, formatProperty } from "../../../lib/database";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ProposalPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const proposal = db.getAllProposals().find(p => p.id == id);
  if (!proposal) return notFound();

  const client = db.getClientById(proposal.client_id);
  const properties = proposal.property_ids.map(pid => formatProperty(db.getById(pid)));
  const agent = client?.agent_id ? db.getAgentById(client.agent_id) : db.getAllAgents()[0];

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans p-12 max-w-5xl mx-auto">
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
          .page-break { page-break-before: always; }
          .no-print { display: none; }
        }
      `}} />

      {/* Cover Page */}
      <div className="flex flex-col justify-center min-h-[900px] border-b-2 border-slate-200 pb-12 mb-12">
        <div className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-4">BITSS Prestige Realty</div>
        <h1 className="text-6xl font-serif text-slate-900 mb-6 leading-tight">Exclusive Investment Proposal</h1>
        <h2 className="text-3xl text-slate-500 font-light mb-16">Prepared for {client?.name || proposal.clientName}</h2>
        
        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 max-w-3xl">
          <p className="text-xl leading-relaxed text-slate-700 whitespace-pre-wrap">{proposal.message}</p>
        </div>
      </div>

      {/* Properties Loop */}
      {properties.map((prop, idx) => (
        <div key={prop.id} className={`${idx > 0 ? 'page-break mt-12' : ''}`}>
          <div className="mb-8 border-b border-slate-200 pb-4">
            <h2 className="text-4xl font-serif text-slate-900">{prop.name}</h2>
            <p className="text-lg text-slate-500 mt-2">{prop.location} • {prop.developer}</p>
          </div>

          <div className="w-full h-[400px] bg-slate-100 rounded-2xl mb-8 overflow-hidden relative">
            {/* Using standard img tag so Puppeteer grabs it nicely */}
            <img src={prop.image || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c'} alt={prop.name} className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-4 gap-6 mb-12">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">Price</div>
              <div className="text-2xl font-semibold text-slate-900">AED {prop.price_aed?.toLocaleString()}</div>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">Gross Yield</div>
              <div className="text-2xl font-semibold text-emerald-600">{prop.gross_yield}%</div>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">5-Yr Apprec.</div>
              <div className="text-2xl font-semibold text-blue-600">{prop.capital_gain_5yr}%</div>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">Down Pmt</div>
              <div className="text-2xl font-semibold text-slate-900">{prop.down_payment}%</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-serif text-slate-900 border-b border-slate-200 pb-2 mb-6">Investment Rationale</h3>
              <div className="space-y-6">
                {prop.why?.map((w, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-2xl">{w.icon}</div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{w.title}</h4>
                      <p className="text-slate-600 mt-1 text-sm">{w.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
               <h3 className="text-xl font-serif text-slate-900 border-b border-slate-200 pb-2 mb-6">Key Selling Points</h3>
               <ul className="space-y-3">
                 {prop.usps?.map((u, i) => (
                   <li key={i} className="flex items-center gap-2 text-slate-700">
                     <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> {u}
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      ))}

      {/* Agent Profile */}
      {agent && (
        <div className="page-break mt-12 border-t border-slate-200 pt-12 flex items-center gap-8">
          {agent.image && (
            <img src={agent.image} alt={agent.name} className="w-32 h-32 rounded-full object-cover border-4 border-slate-100" />
          )}
          <div>
            <h3 className="text-2xl font-serif text-slate-900">{agent.name}</h3>
            <p className="text-slate-500 font-medium tracking-widest uppercase text-sm mt-1">{agent.title}</p>
            <div className="mt-4 space-y-1 text-slate-600">
              <p>Email: {agent.email}</p>
              <p>Phone: {agent.phone}</p>
              {agent.whatsapp && <p>WhatsApp: {agent.whatsapp}</p>}
              {agent.rera && <p>BRN: {agent.rera}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
