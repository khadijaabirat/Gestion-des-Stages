import AdminOffersContent from '@/components/admin/offers/AdminOffersContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestion des Offres - Admin NexusIntern',
  description: 'Modérez et gérez toutes les offres de stage publiées sur la plateforme.',
};

export default function AdminOffersPage() {
  return <AdminOffersContent />;
}
