import type { Metadata } from 'next';
import MessagesContent from '@/components/messages/MessagesContent';

export const metadata: Metadata = {
  title: 'Messagerie - NexusIntern',
  description: 'Messagerie en temps réel pour vos communications',
};

import { Suspense } from 'react';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
