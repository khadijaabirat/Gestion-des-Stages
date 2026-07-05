import SharedNotificationsContent from '@/components/shared/notifications/SharedNotificationsContent';

export const metadata = {
  title: 'Notifications - StageConnect',
  description: 'Vos notifications',
};

export default function EntrepriseNotificationsPage() {
  return <SharedNotificationsContent basePath="entreprise" />;
}
