import OpportunitiesContent from '@/components/opportunities/OpportunitiesContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Opportunités - NexusIntern',
  description: 'Explorez et découvrez les meilleures opportunités de stage',
};

export default function OpportunitiesPage() {
  return <OpportunitiesContent />;
}
