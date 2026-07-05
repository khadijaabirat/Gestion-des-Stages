import OfferDetailContent from '@/components/opportunities/OfferDetailContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Détails de l\'offre - NexusIntern',
  description: 'Consultez les détails de cette opportunité de stage et postulez directement.',
};

export default function OfferDetailPage({ params }: { params: { id: string } }) {
  return <OfferDetailContent offerId={params.id} />;
}
