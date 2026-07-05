import { Metadata } from 'next';
import AdminProfileContent from '@/components/admin/profile/AdminProfileContent';

export const metadata: Metadata = {
  title: 'Profil Administrateur - StageConnect',
  description: 'Gérez votre compte administrateur sur StageConnect',
};

export default function AdminProfilePage() {
  return <AdminProfileContent />;
}
