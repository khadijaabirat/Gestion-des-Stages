import PublicProfileContent from '@/components/profile/PublicProfileContent';

export default function EntreprisePublicProfilePage({ params }: { params: { id: string } }) {
  return <PublicProfileContent userId={params.id} basePath="entreprise" />;
}
