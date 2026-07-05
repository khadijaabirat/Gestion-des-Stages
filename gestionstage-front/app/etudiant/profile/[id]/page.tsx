import PublicProfileContent from '@/components/profile/PublicProfileContent';

export default function StudentPublicProfilePage({ params }: { params: { id: string } }) {
  return <PublicProfileContent userId={params.id} basePath="etudiant" />;
}
