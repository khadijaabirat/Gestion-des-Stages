import EntrepriseOfferCandidatesContent from '@/components/entreprise/offers/candidates/EntrepriseOfferCandidatesContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Candidats pour l\'offre - NexusIntern',
  description: 'Gérez les candidatures spécifiques à cette offre.',
};

export default function OfferCandidatesPage({ params }: { params: { id: string } }) {
  return <EntrepriseOfferCandidatesContent offerId={params.id} />;
}
