import OffersContent from '@/components/offers/OffersContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offres de Stage - NexusIntern',
  description: 'Explorez et découvrez les meilleures opportunités de stage',
};

// Next.js Server Component asynchrone (SSR)
export default async function OffersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string; localisation?: string; duree?: string }
}) {
  // SSR Fetch : On récupère les données directement côté serveur
  // URL du backend (idéalement via process.env.NEXT_PUBLIC_API_URL)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  
  // Construction des paramètres de recherche pour l'API
  const params = new URLSearchParams();
  if (searchParams.page) params.append('page', searchParams.page);
  if (searchParams.q) params.append('search', searchParams.q);
  if (searchParams.localisation) params.append('localisation', searchParams.localisation);
  if (searchParams.duree) params.append('duree', searchParams.duree);

  let initialData = null;
  
  try {
    // Requête fetch SSR avec revalidation ou cache (ici on force le SSR dynamique)
    const res = await fetch(`${apiUrl}/offres-stage?${params.toString()}`, {
      cache: 'no-store' // Équivalent de getServerSideProps (toujours à jour)
    });
    
    if (res.ok) {
      initialData = await res.json();
    }
  } catch (error) {
    console.error('Erreur SSR fetch offres:', error);
  }

  // On extrait les offres et la pagination comme le faisait apiFetch
  // Laravel renvoie souvent la pagination sous la clé "data" ou directement
  const rawOffers = initialData?.data?.data || initialData?.data || initialData || [];
  const paginationData = initialData?.data || initialData;

  // On passe ces données pré-fetchées au Client Component (Leaf Component)
  return (
    <OffersContent 
      initialOffers={Array.isArray(rawOffers) ? rawOffers : []} 
      initialPagination={{
        total: paginationData?.total || rawOffers.length || 0,
        next_page_url: paginationData?.next_page_url || null,
        current_page: paginationData?.current_page || 1
      }}
    />
  );
}
