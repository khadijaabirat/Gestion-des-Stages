'use client';

import UnifiedLayout from '@/components/shared/layout/UnifiedLayout';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function EntrepriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiFetch('/profil');
        if (res.ok) {
          const data = await res.json();
          setUser(data.data || data);
        }
      } catch (e) {
        console.error('Failed to fetch user profile:', e);
      }
    };
    fetchUser();
  }, []);

  return (
    <UnifiedLayout 
      role="entreprise" 
      userName={user?.nom || 'Entreprise'} 
      userRoleLabel="Espace Recruteur"
      userAvatar={
        user?.photo 
          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.photo}` 
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom || 'E')}&background=2563eb&color=fff`
      }
    >
      {children}
    </UnifiedLayout>
  );
}
