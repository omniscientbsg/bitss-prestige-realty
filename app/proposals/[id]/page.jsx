import { db, formatProperty } from "../../../lib/database";
import { notFound } from "next/navigation";
import PrintTrigger from "./PrintTrigger";

export const dynamic = 'force-dynamic';

export default async function ProposalPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const id = resolvedParams.id;
  const shouldPrint = resolvedSearch?.print === "1";

  let proposal = null;
  try {
    const allProposals = await db.getAllProposals();
    proposal = allProposals.find(p => p.id == id);
  } catch (e) {
    console.error("Proposal fetch error:", e);
  }
  if (!proposal) return notFound();

  let client = null, allAgents = [], agent = null;
  try {
    [client, allAgents] = await Promise.all([
      proposal.client_id ? db.getClientById(proposal.client_id) : Promise.resolve(null),
      db.getAllAgents(),
    ]);
    agent = client?.agent_id ? await db.getAgentById(client.agent_id) : allAgents[0] || null;
  } catch (e) {
    console.error("Agent/client fetch error:", e);
  }

  let properties = [];
  try {
    const propertyIds = Array.isArray(proposal.property_ids) ? proposal.property_ids : [];
    const rawProps = await Promise.all(propertyIds.map(pid => db.getById(pid)));
    properties = rawProps.filter(Boolean).map(formatProperty);
  } catch (e) {
    console.error("Properties fetch error:", e);
  }
  const clientName = client?.name || proposal.client_name || proposal.clientName || "Valued Client";

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans">
      {/* PrintTrigger handles toolbar + auto-print (client component) */}
      <PrintTrigger shouldPrint={shouldPrint} clientName={clientName} />

      {/* Print + screen styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
          .page-break { page-break-before: always; break-before: page; }
          .no-print { display: none !important; }
          @page { margin: 16mm; size: A4 portrait; }
        }
        @media screen {
          .proposal-inner { max-width: 900px; margin: 0 auto; padding: 48px; }
        }
      `}} />

      <div className="proposal-inner">
        {/* Cover Page */}
        <div className="flex flex-col justify-center min-h-[860px] border-b-2 border-slate-200 pb-12 mb-12">
          <div className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-4">BITSS Prestige Realty</div>
          <h1 className="text-6xl font-serif text-slate-900 mb-6 leading-tight">Exclusive Investment<br/>Proposal</h1>
          <h2 className="text-3xl text-slate-500 font-light mb-16">Prepared for {clientName}</h2>
          
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 max-w-3xl">
            <p className="text-xl leading-relaxed text-slate-700 whitespace-pre-wrap">{proposal.message}</p>
          </div>

          {agent && (
            <div className="mt-16 flex items-center gap-6">
              {agent.photo && (
                <img src={agent.photo} alt={agent.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-200" />
              )}
              <div>
                <div className="font-semibold text-slate-900 text-lg">{agent.name}</div>
                <div className="text-slate-500 text-sm">{agent.email} · {agent.phone}</div>
              </div>
            </div>
          )}
        </div>

        {/* Properties Loop */}
        {properties.map((prop, idx) => (
          <div key={prop.id} className={`${idx > 0 ? 'page-break mt-12' : ''} pb-16 mb-16 border-b border-slate-200`}>
            <div className="mb-8 border-b border-slate-200 pb-4">
              <h2 className="text-4xl font-serif text-slate-900">{prop.name}</h2>
              <p className="text-lg text-slate-500 mt-2">{prop.location} · {prop.developer}</p>
            </div>

            <div className="w-full h-[380px] bg-slate-100 rounded-2xl mb-8 overflow-hidden">
              <img src={prop.image || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c'} alt={prop.name} className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Price', value: `AED ${prop.price_aed?.toLocaleString()}`, color: 'text-slate-900' },
                { label: 'Gross Yield', value: `${prop.gross_yield}%`, color: 'text-emerald-600' },
                { label: '5-Yr Appreciation', value: `${prop.capital_gain_5yr}%`, color: 'text-blue-600' },
                { label: 'Down Payment', value: `${prop.down_payment}%`, color: 'text-slate-900' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">{s.label}</div>
                  <div className={`text-xl font-semibold ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div>
                <h3 className="text-xl font-serif text-slate-900 border-b border-slate-200 pb-2 mb-5">Investment Rationale</h3>
                <div className="space-y-5">
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
                <h3 className="text-xl font-serif text-slate-900 border-b border-slate-200 pb-2 mb-5">Key Highlights</h3>
                <ul className="space-y-3">
                  {prop.usps?.map((u, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></span> {u}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}

        {/* Agent Footer */}
        {agent && (
          <div className="page-break mt-12 border-t border-slate-200 pt-10 flex items-center gap-8">
            {agent.photo && (
              <img src={agent.photo} alt={agent.name} className="w-28 h-28 rounded-full object-cover border-4 border-slate-100" />
            )}
            <div>
              <h3 className="text-2xl font-serif text-slate-900">{agent.name}</h3>
              <div className="mt-3 space-y-1 text-slate-600 text-sm">
                <p>Email: {agent.email}</p>
                <p>Phone: {agent.phone}</p>
                {agent.whatsapp && <p>WhatsApp: {agent.whatsapp}</p>}
                {agent.rera && <p>BRN: {agent.rera}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
