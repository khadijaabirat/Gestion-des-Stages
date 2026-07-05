import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Espace Admin - StageConnect',
  description: 'Centre de contrôle global de StageConnect',
};

import UnifiedLayout from '@/components/shared/layout/UnifiedLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UnifiedLayout 
      role="admin" 
      userName="Admin System" 
      userRoleLabel="Administrateur"
      userAvatar="https://ui-avatars.com/api/?name=Admin&background=1a1a1a&color=fff"
    >
      {children}
    </UnifiedLayout>
  );
}
