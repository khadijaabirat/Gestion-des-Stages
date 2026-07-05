import { cookies } from 'next/headers';
import './dashboard/styles.css';
import UnifiedLayout from '@/components/shared/layout/UnifiedLayout';

export default function EtudiantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const userName = cookieStore.get('userName')?.value || 'Étudiant';

  return (
    <UnifiedLayout 
      role="student" 
      userName={userName} 
      userRoleLabel="Étudiant"
      userAvatar={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`}
    >
      {children}
    </UnifiedLayout>
  );
}
