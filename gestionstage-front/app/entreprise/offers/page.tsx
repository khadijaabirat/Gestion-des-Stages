import EntrepriseOffersContent from '@/components/entreprise/offers/EntrepriseOffersContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mes Offres - NexusIntern',
  description: 'Gérez vos offres de stage et d\'emploi, et suivez les candidatures.',
};

export default function EntrepriseOffersPage() {
  return <EntrepriseOffersContent />;
}
