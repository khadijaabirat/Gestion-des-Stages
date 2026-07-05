import EntrepriseProfileContent from '@/components/entreprise/profile/EntrepriseProfileContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profil Entreprise - NexusIntern',
  description: 'Mettez à jour vos informations et gérez la présentation de votre entreprise.',
};

export default function EntrepriseProfilePage() {
  return <EntrepriseProfileContent />;
}
