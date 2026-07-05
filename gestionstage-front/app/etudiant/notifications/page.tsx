import SharedNotificationsContent from '@/components/shared/notifications/SharedNotificationsContent';

export const metadata = {
  title: 'Notifications - StageConnect',
  description: 'Vos notifications',
};

export default function EtudiantNotificationsPage() {
  return <SharedNotificationsContent basePath="etudiant" />;
}
