import { cookies } from 'next/headers';
import { db, formatProperty } from '@/lib/database';
import { notFound } from 'next/navigation';
import ClientDashboard from './ClientDashboard';
import ClientLogin from './ClientLogin';

export default async function ClientPortalPage({ params }) {
  const { slug } = await params; // Note: In Next.js 16+, params must be awaited in app dir
  
  // Clean slug like the original code
  const cleanSlug = decodeURIComponent(slug).toLowerCase().replace(/\s+/g, '-');
  const client = db.getClientBySlug(cleanSlug);

  if (!client) {
    notFound();
  }

  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get('clientSlug')?.value === cleanSlug;

  if (!isLoggedIn) {
    return <ClientLogin clientName={client.name} clientSlug={cleanSlug} />;
  }

  // Fetch properties assigned to this client
  const allProperties = db.getAll();
  const assignedProperties = client.assigned_properties 
    ? client.assigned_properties.map(id => allProperties.find(p => p.id === id)).filter(Boolean).map(formatProperty)
    : [];

  const clientProposals = db.getAllProposals().filter(p => p.client_id === client.id);
  const agent = client.agent_id ? db.getAgentById(client.agent_id) : null;

  return (
    <ClientDashboard 
      client={client}
      properties={assignedProperties}
      initialProposals={clientProposals}
      agent={agent}
    />
  );
}
