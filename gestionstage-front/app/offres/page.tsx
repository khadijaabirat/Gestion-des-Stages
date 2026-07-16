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
  
  const initialOffers = Array.isArray(data?.data) ? data.data : [];
  const paginationData = data?.meta || data?.data || data;

  const initialPagination = {
    total: paginationData?.total || initialOffers.length || 0,
    next_page_url: data?.links?.next || paginationData?.next_page_url || null,
    current_page: paginationData?.current_page || 1,
    last_page: paginationData?.last_page || Math.ceil((paginationData?.total || initialOffers.length || 0) / 10) || 1
  };

  return (
    <div className="pt-24 min-h-screen">
      <OffersContent 
        initialOffers={initialOffers} 
        initialPagination={initialPagination as any} 
      />
    </div>
  );
}
