import AdminDashboardContent from '@/components/admin/dashboard/AdminDashboardContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vue d\'ensemble - Admin NexusIntern',
  description: 'Centre de contrôle et tableau de bord principal de NexusIntern.',
};

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
