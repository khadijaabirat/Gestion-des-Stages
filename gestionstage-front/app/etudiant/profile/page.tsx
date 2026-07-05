import ProfileContent from '@/components/profile/ProfileContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mon Profil - NexusIntern',
  description: 'Gérez vos informations personnelles et mettez en valeur vos compétences.',
};

export default function ProfilePage() {
  return <ProfileContent />;
}
