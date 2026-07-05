import OfferDetailContent from '@/components/offers/OfferDetailContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Détail Offre - NexusIntern',
  description: 'Détails et candidature pour cette offre de stage',
};

export default function OfferDetailPage({ params }: { params: { id: string } }) {
  return <OfferDetailContent offerId={params.id} />;
}
