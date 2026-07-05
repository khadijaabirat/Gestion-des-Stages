'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  UserCircle, 
  Settings, 
  Building2, 
  Users, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  BookOpen,
  Menu
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export type UserRole = 'student' | 'admin' | 'entreprise';

interface UnifiedSidebarProps {
  role: UserRole;
  activePath: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const MENU_CONFIG = {
  student: [
    { label: 'Dashboard', path: '/etudiant/dashboard', icon: LayoutDashboard },
    { label: 'Explorateur d\'Offres', path: '/etudiant/offres', icon: Briefcase },
    { label: 'Mes Candidatures', path: '/etudiant/applications', icon: FileText },
    { label: 'Mon CV & Portfolio', path: '/etudiant/cv', icon: BookOpen },
    { label: 'Messagerie', path: '/etudiant/messages', icon: MessageSquare },
  ],
  entreprise: [
    { label: 'Tableau de Bord', path: '/entreprise/dashboard', icon: LayoutDashboard },
    { label: 'Mes Offres de Stage', path: '/entreprise/offers', icon: Briefcase },
    { label: 'Candidatures Reçues', path: '/entreprise/candidates', icon: Users },
    { label: 'Messagerie', path: '/entreprise/messages', icon: MessageSquare },
  ],
  admin: [
    { label: 'Vue d\'ensemble', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Modération Utilisateurs', path: '/admin/users', icon: Users },
    { label: 'Validation Entreprises', path: '/admin/entreprises', icon: Building2 },
    { label: 'Toutes les Offres', path: '/admin/offers', icon: Briefcase },
    { label: 'Référentiel Compétences', path: '/admin/skills', icon: Sparkles },
  ]
};

export default function UnifiedSidebar({ role, activePath, isMobileOpen, onCloseMobile }: UnifiedSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Mouse position for subtle background interactions
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const basePath = role === 'student' ? 'etudiant' : role;

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  if (!mounted) return null;

  const menuItems = MENU_CONFIG[role] || MENU_CONFIG['student'];

  const handleLogout = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (token) {
        await apiFetch(`/logout`, {
          method: 'POST'
        });
      }
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      document.cookie = 'userRole=; Max-Age=0; path=/';
      document.cookie = 'userName=; Max-Age=0; path=/';
      window.location.href = '/login';
    }
  };

  const SidebarContent = ({ isMobile = false }) => (
    <>
      {/* Ambient Glow effect inside sidebar */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(255,126,95, 0.05), transparent 40%)`
        }}
      />

      {/* Logo Section */}
      <div className="h-24 flex items-center px-6 border-b border-outline-variant/20 shrink-0 relative">
        <Link href={`/${role}/dashboard`} onClick={isMobile ? onCloseMobile : undefined} className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary overflow-hidden shadow-md shadow-primary/20 shrink-0">
            <div className="absolute inset-[1px] bg-surface rounded-[11px] flex items-center justify-center z-10 transition-colors duration-300">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4V20" stroke="url(#primaryGradientSidebar)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M18 10V20" stroke="url(#secondaryGradientSidebar)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M6 7L18 17" stroke="url(#tertiaryGradientSidebar)" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="18" cy="5" r="3" fill="#5644d0" />
                  <defs>
                    <linearGradient id="primaryGradientSidebar" x1="6" y1="4" x2="6" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ff7e5f" />
                      <stop offset="1" stopColor="#ffb4a3" />
                    </linearGradient>
                    <linearGradient id="secondaryGradientSidebar" x1="18" y1="10" x2="18" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#5644d0" />
                      <stop offset="1" stopColor="#6f5fea" />
                    </linearGradient>
                    <linearGradient id="tertiaryGradientSidebar" x1="6" y1="7" x2="18" y2="17" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ff7e5f" />
                      <stop offset="1" stopColor="#5644d0" />
                    </linearGradient>
                  </defs>
               </svg>
            </div>
          </div>
          <AnimatePresence mode="wait">
            {(!isCollapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col whitespace-nowrap"
              >
                <span className="font-heading font-extrabold text-xl tracking-tight text-on-surface">NexusIntern</span>
                <span className="text-[10px] font-label-caps uppercase tracking-widest text-primary font-bold">
                  {role === 'admin' ? 'Administration' : role === 'entreprise' ? 'Espace Recruteur' : 'Espace Étudiant'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Toggle Button Desktop */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-surface-container border border-outline-variant/20 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:scale-105 transition-all shadow-sm z-50 hidden lg:flex"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
        
        {/* Close Button Mobile */}
        {isMobile && (
          <button
            onClick={onCloseMobile}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 space-y-1.5 relative z-10">
        {menuItems.map((item) => {
          const isActive = activePath === item.path || activePath.startsWith(`${item.path}/`);
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path} onClick={isMobile ? onCloseMobile : undefined} className="block w-full">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center p-3 rounded-2xl transition-all duration-300 group overflow-hidden ${
                  isActive 
                    ? 'text-white' 
                    : 'text-on-surface hover:text-on-surface hover:bg-surface-container-low/80'
                }`}
              >
                {/* Active Background */}
                {isActive && (
                  <motion.div
                    layoutId={isMobile ? "activeMobileSidebarIndicator" : "activeSidebarIndicator"}
                    className="absolute inset-0 bg-primary rounded-2xl shadow-md shadow-primary/20 border border-white/80"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-xl shrink-0 transition-all duration-300 ${
                  isActive ? 'bg-white/20 text-white shadow-inner' : 'bg-transparent text-on-surface-variant group-hover:text-primary'
                }`}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                {/* Label */}
                <AnimatePresence>
                  {(!isCollapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className={`relative z-10 ml-3 font-semibold text-sm whitespace-nowrap overflow-hidden transition-colors ${
                        isActive ? 'text-white' : 'text-on-surface group-hover:text-primary'
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {!isMobile && isCollapsed && (
                  <div className="absolute left-14 bg-surface-container-highest text-on-surface px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl border border-outline-variant/10 z-50">
                    {item.label}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-outline-variant/20 shrink-0 relative z-10">
        <Link href={`/${basePath}/profile`} onClick={isMobile ? onCloseMobile : undefined} className="block w-full mb-1.5">
          <motion.div
            className={`relative flex items-center p-3 rounded-2xl transition-all duration-300 group ${
              activePath === `/${basePath}/profile` ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-xl shrink-0 transition-colors">
              <Settings size={18} />
            </div>
            <AnimatePresence>
              {(!isCollapsed || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="relative z-10 ml-3 font-semibold text-sm whitespace-nowrap"
                >
                  Paramètres
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>
        
        <button onClick={handleLogout} className="block w-full text-left">
          <motion.div
            className="relative flex items-center p-3 rounded-2xl transition-all duration-300 group text-error hover:bg-error-container/50 hover:text-error"
          >
            <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-xl shrink-0 transition-colors bg-error/10">
              <LogOut size={18} />
            </div>
            <AnimatePresence>
              {(!isCollapsed || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="relative z-10 ml-3 font-semibold text-sm whitespace-nowrap"
                >
                  Déconnexion
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 88 : 280 }}
        onMouseMove={handleMouseMove}
        className="hidden md:flex flex-col h-screen sticky top-0 left-0 bg-white/60 backdrop-blur-2xl border-r border-white/80 shadow-[4px_0_24px_rgba(165,59,34,0.02)] z-40 transition-all duration-300 ease-[0.16,1,0.3,1] overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Off-canvas Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-[100] md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-[280px] h-full bg-surface shadow-2xl relative z-10 flex flex-col border-r border-outline-variant/20 overflow-hidden"
            >
              <SidebarContent isMobile={true} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav (replaces Sidebar on mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-outline-variant/20 flex justify-around items-center px-1 py-3 z-50 shadow-[0_-8px_32px_rgba(0,0,0,0.05)] pb-safe">
        {menuItems.map((item) => {
          const isActive = activePath === item.path || activePath.startsWith(`${item.path}/`);
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path} className="relative flex flex-col items-center justify-center w-12 sm:w-14 h-14 group">
              {isActive && (
                <motion.div
                  layoutId="activeMobileNav"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div whileTap={{ scale: 0.9 }}>
                <Icon size={20} className={`mb-1 transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span className={`text-[10px] font-label-caps transition-colors ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                {item.label.split(' ')[0]} {/* Shorten label for mobile */}
              </span>
            </Link>
          );
        })}
        {/* Profile Link for mobile */}
        {(() => {
          const basePath = role === 'student' ? 'etudiant' : role;
          const isActive = activePath.includes('/profile');
          return (
            <Link href={`/${basePath}/profile`} className="relative flex flex-col items-center justify-center w-12 sm:w-14 h-14 group">
              {isActive && (
                <motion.div layoutId="activeMobileNavProfile" className="absolute inset-0 bg-primary/10 rounded-xl" initial={false} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
              )}
              <motion.div whileTap={{ scale: 0.9 }}>
                <UserCircle size={20} className={`mb-1 transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span className={`text-[10px] font-label-caps ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>Profil</span>
            </Link>
          );
        })()}
      </nav>
    </>
  );
}
