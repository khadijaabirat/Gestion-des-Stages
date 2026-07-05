import EntrepriseCandidatesContent from '@/components/entreprise/candidates/EntrepriseCandidatesContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Candidatures - NexusIntern',
  description: 'Gérez et analysez les candidatures reçues pour vos offres.',
};

export default function EntrepriseCandidatesPage() {
  return <EntrepriseCandidatesContent />;
}
