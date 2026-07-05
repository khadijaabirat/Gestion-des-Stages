'use client';

import { usePathname } from 'next/navigation';
import UnifiedSidebar, { UserRole } from '../navigation/UnifiedSidebar';
import UnifiedTopNavbar from '../navigation/UnifiedTopNavbar';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

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
  const [scrollY, setScrollY] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine page title based on pathname
  const getPageTitle = (path: string) => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length <= 1) return 'Tableau de bord';
    const lastPart = parts[parts.length - 1];
    
    // Capitalize and format
    const formatted = lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
    return formatted;
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-surface text-on-surface flex">
      {/* Global Background Pattern */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23a53b22' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          transform: `translateY(${scrollY * 0.05}px)`,
        }}
      />

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
