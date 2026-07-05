import ApplicationsContent from '@/components/applications/ApplicationsContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Candidatures - NexusIntern',
  description: 'Gérez vos candidatures de stage',
};

export default function ApplicationsPage() {
  return <ApplicationsContent />;
}
