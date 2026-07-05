import AdminEntreprisesContent from '@/components/admin/entreprises/AdminEntreprisesContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Validation KYC Entreprises - Admin NexusIntern',
  description: 'Gérez la file d\'attente KYC et modérez les comptes entreprises.',
};

export default function AdminEntreprisesPage() {
  return <AdminEntreprisesContent />;
}
