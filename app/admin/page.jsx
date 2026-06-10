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
  const properties = db.getAll();
  const clients = db.getAllClients();
  const agents = db.getAllAgents();
  const proposals = db.getAllProposals();
  const analytics = db.getAnalytics();
  const settings = db.getSettings();

  return (
    <AdminDashboard 
      initialProperties={properties}
      initialClients={clients}
      initialAgents={agents}
      initialProposals={proposals}
      analytics={analytics}
      settings={settings}
    />
  );
}
