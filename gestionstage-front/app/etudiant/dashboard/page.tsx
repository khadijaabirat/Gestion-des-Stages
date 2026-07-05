import DashboardContent from '@/components/dashboard/DashboardContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de bord - NexusIntern',
  description: 'Votre hub de gestion de stage futuriste',
};

export default function DashboardPage() {
  return <DashboardContent />;
}
