import EntrepriseOfferCreateContent from '@/components/entreprise/offers/EntrepriseOfferCreateContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Créer une offre - NexusIntern',
  description: 'Publiez une nouvelle offre de stage ou d\'emploi pour attirer les meilleurs talents.',
};

export default function EntrepriseOfferCreatePage() {
  return <EntrepriseOfferCreateContent />;
}
