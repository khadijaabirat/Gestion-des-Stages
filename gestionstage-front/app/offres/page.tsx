import OffersContent from '@/components/offers/OffersContent';

async function getInitialOffers() {
  try {
    const res = await fetch('http://localhost:8000/api/offres-stage?page=1', {
      next: { revalidate: 60 },
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching initial offers:', error);
    return null;
  }
}

export default async function PublicOffersPage() {
  const data = await getInitialOffers();
  
  const initialOffers = Array.isArray(data?.data?.data) ? data.data.data : (Array.isArray(data?.data) ? data.data : []);
  const initialPagination = data?.data?.data ? data.data : data;

  return (
    <div className="pt-24 min-h-screen">
      <OffersContent 
        initialOffers={initialOffers} 
        initialPagination={initialPagination} 
      />
    </div>
  );
}
