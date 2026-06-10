import { cookies } from 'next/headers';
import { db } from '@/lib/database';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get('adminLoggedIn')?.value === 'true';

  if (!isLoggedIn) {
    return <AdminLogin />;
  }

  // Fetch all required data for the admin dashboard
  const [properties, clients, agents, proposals, analytics, settings] = await Promise.all([
    db.getAll(),
    db.getAllClients(),
    db.getAllAgents(),
    db.getAllProposals(),
    db.getAnalytics(),
    db.getSettings(),
  ]);

  // Enrich clients with their chat + activity logs
  const enrichedClients = await Promise.all(clients.map(async (c) => {
    const [chat, activity] = await Promise.all([
      db.getChatHistory(c.id),
      db.getActivityLogs(c.id),
    ]);
    return { ...c, chat_history: chat, activity_logs: activity };
  }));

  return (
    <AdminDashboard 
      initialProperties={properties}
      initialClients={enrichedClients}
      initialAgents={agents}
      initialProposals={proposals}
      analytics={analytics}
      settings={settings}
    />
  );
}
