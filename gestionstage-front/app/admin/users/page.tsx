import AdminUsersContent from '@/components/admin/users/AdminUsersContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestion des Utilisateurs - Admin NexusIntern',
  description: 'Gérez les comptes, les rôles et les accès à la plateforme de stage NexusIntern.',
};

export default function AdminUsersPage() {
  return <AdminUsersContent />;
}
