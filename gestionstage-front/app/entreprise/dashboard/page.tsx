import EntrepriseDashboardContent from '@/components/entreprise/dashboard/EntrepriseDashboardContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de Bord Entreprise - NexusIntern',
  description: 'Gérez vos offres de stage, analysez vos performances et recrutez les meilleurs talents.',
};

export default function EntrepriseDashboardPage() {
  return <EntrepriseDashboardContent />;
}
