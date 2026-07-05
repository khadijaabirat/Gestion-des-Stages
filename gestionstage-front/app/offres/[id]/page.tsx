import OfferDetailContent from '@/components/offers/OfferDetailContent';
import { notFound } from 'next/navigation';

async function getOfferDetails(id: string) {
  try {
    const res = await fetch(`http://localhost:8000/api/offres-stage/${id}`, {
      next: { revalidate: 60 },
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching offer details:', error);
    return null;
  }
}

export default async function PublicOfferDetailPage({ params }: { params: { id: string } }) {
  const data = await getOfferDetails(params.id);
  
  if (!data || !data.data) {
    notFound();
  }

  // The OfferDetailContent component expects initialData
  return (
    <div className="pt-24 min-h-screen">
      <OfferDetailContent offerId={params.id} initialData={data.data} />
    </div>
  );
}
