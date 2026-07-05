import CVManagerContent from '@/components/cv/CVManagerContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestion des CV - NexusIntern',
  description: 'Gérez et organisez vos différents CVs pour postuler rapidement.',
};

export default function CVPage() {
  return <CVManagerContent />;
}
