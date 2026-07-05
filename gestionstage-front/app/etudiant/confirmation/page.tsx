import type { Metadata } from 'next';
import ConfirmationContent from '@/components/confirmation/ConfirmationContent';

export const metadata: Metadata = {
  title: 'Candidature envoyée ! - NexusIntern',
  description: 'Votre candidature a été transmise avec succès',
};

export default function ConfirmationPage() {
  return <ConfirmationContent />;
}
