import EntrepriseMessagesContent from '@/components/entreprise/messages/EntrepriseMessagesContent';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messages - NexusIntern',
  description: 'Communiquez en temps réel avec vos candidats.',
};

export default function EntrepriseMessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
      <EntrepriseMessagesContent />
    </Suspense>
  );
}
