'use client';

import { usePathname } from 'next/navigation';
import UnifiedSidebar, { UserRole } from '../navigation/UnifiedSidebar';
import UnifiedTopNavbar from '../navigation/UnifiedTopNavbar';
import { useState, useEffect, useRef } from 'react';

interface UnifiedLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  userName?: string;
  userAvatar?: string;
  userRoleLabel?: string;
}

export default function UnifiedLayout({ 
  children, 
  role,
  userName,
  userAvatar,
  userRoleLabel
}: UnifiedLayoutProps) {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);

  // Cursor glow — direct DOM manipulation, zero React re-renders
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.background = `radial-gradient(200px circle at ${e.clientX}px ${e.clientY}px, rgba(165,59,34,0.28) 0%, transparent 70%)`;
      glowRef.current.style.opacity = '1';
    };
    const handleMouseLeave = () => {
      if (glowRef.current) glowRef.current.style.opacity = '0';
    };

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const getPageTitle = (path: string) => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length <= 1) return 'Tableau de bord';
    const lastPart = parts[parts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-surface text-on-surface flex">

      {/* Cursor glow — CSS only, zero re-render */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed inset-0 z-50 opacity-0 transition-opacity duration-300"
        style={{ mixBlendMode: 'normal' }}
      />

      {/* Static background — single source of truth for all pages */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, rgba(165,59,34,0.6) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, rgba(86,68,208,0.6) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23a53b22' fill-rule='evenodd'/%3E%3C/svg%3E")` }}
        />
      </div>

      <UnifiedSidebar 
        role={role} 
        activePath={pathname || `/${role}/dashboard`} 
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen w-full relative z-10">
        <UnifiedTopNavbar 
          role={role}
          userName={userName}
          userAvatar={userAvatar}
          userRole={userRoleLabel}
          pageTitle={getPageTitle(pathname || '')}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
        
        <main className="flex-1 w-full pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
