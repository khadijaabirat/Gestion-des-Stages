'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Menu, X, Sun, Moon, ArrowRight, ChevronRight,
  Home, Search, Building2, HelpCircle, Mail, LogOut, LayoutDashboard
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

/* ═══════════ NAV LINK CONFIG ═══════════ */
const PUBLIC_LINKS = [
  { label: 'Accueil', href: '/', icon: <Home className="w-4 h-4" /> },
  { label: 'Découvrir les offres', href: '/offres', icon: <Search className="w-4 h-4" /> },
  { label: 'Pour les Entreprises', href: '/entreprises-info', icon: <Building2 className="w-4 h-4" /> },
];

/* ═══════════ PREMIUM LOGO WITH IMAGE ═══════════ */
function NavLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label="NexusIntern — Accueil">
      <motion.div
        className="relative flex items-center justify-center w-11 h-11 rounded-[14px] bg-gradient-to-br from-primary to-secondary overflow-hidden shadow-[0_8px_16px_rgba(255,126,95,0.2)] group-hover:shadow-[0_12px_24px_rgba(86,68,208,0.3)] transition-all duration-500"
        whileHover={{ scale: 1.05, rotate: -4 }}
        whileTap={{ scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <div className="absolute inset-[1.5px] bg-surface rounded-[12px] flex items-center justify-center z-10 transition-colors duration-300 group-hover:bg-surface-container-lowest">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform duration-500">
              <path d="M6 4V20" stroke="url(#primaryGradient)" strokeWidth="3" strokeLinecap="round" />
              <path d="M18 10V20" stroke="url(#secondaryGradient)" strokeWidth="3" strokeLinecap="round" />
              <path d="M6 7L18 17" stroke="url(#tertiaryGradient)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="18" cy="5" r="3" fill="#5644d0" className="animate-pulse" />
              <defs>
                <linearGradient id="primaryGradient" x1="6" y1="4" x2="6" y2="20" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ff7e5f" />
                  <stop offset="1" stopColor="#ffb4a3" />
                </linearGradient>
                <linearGradient id="secondaryGradient" x1="18" y1="10" x2="18" y2="20" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#5644d0" />
                  <stop offset="1" stopColor="#6f5fea" />
                </linearGradient>
                <linearGradient id="tertiaryGradient" x1="6" y1="7" x2="18" y2="17" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ff7e5f" />
                  <stop offset="1" stopColor="#5644d0" />
                </linearGradient>
              </defs>
           </svg>
        </div>

        {/* Ambient glow ring */}
        <motion.div
          className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 blur-xl -z-10"
          animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className="font-heading text-xl font-extrabold tracking-tight text-on-background group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary transition-all duration-300">
          NexusIntern
        </span>
        <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-primary/70 font-semibold mt-0.5">
          Plateforme de Stages
        </span>
      </div>
    </Link>
  );
}

/* ═══════════ NAV LINK ═══════════ */
function NavItem({ link, isActive }: { link: {label: string, href: string}, isActive: boolean }) {
  return (
    <Link href={link.href} className="relative group py-2 px-1">
      <span className={`text-[13px] font-medium transition-colors duration-300 ${isActive ? 'text-primary font-semibold' : 'text-on-surface-variant/80 group-hover:text-on-background'}`}>
        {link.label}
      </span>
      <motion.div
        className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-primary to-secondary origin-left"
        initial={false}
        animate={{ scaleX: isActive ? 1 : 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
      <div className="absolute -inset-2 rounded-lg bg-primary/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Link>
  );
}

/* ═══════════ THEME TOGGLE ═══════════ */
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10 rounded-xl bg-surface-container-high/40 animate-pulse" />;

  const isDark = resolvedTheme === 'dark';

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-surface-container-high/50 hover:bg-surface-container-highest border border-outline-variant/20 hover:border-outline-variant/40 transition-all duration-300 group overflow-hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div key="moon" initial={{ y: -20, opacity: 0, rotate: -90 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ y: 20, opacity: 0, rotate: 90 }} transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}>
            <Moon className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
          </motion.div>
        ) : (
          <motion.div key="sun" initial={{ y: 20, opacity: 0, rotate: 90 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ y: -20, opacity: 0, rotate: -90 }} transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}>
            <Sun className="w-5 h-5 text-tertiary group-hover:text-primary transition-colors" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ═══════════ MOBILE MENU ═══════════ */
function MobileMenu({ isOpen, onClose, currentPath, user, handleLogout, isLoadingAuth }: {
  isOpen: boolean; onClose: () => void; currentPath: string; user: any; handleLogout: () => void; isLoadingAuth: boolean;
}) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-[90] bg-on-background/20 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-[100] w-[85vw] max-w-[380px] bg-surface-container-lowest/95 backdrop-blur-2xl border-l border-outline-variant/20 shadow-2xl flex flex-col"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          >
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/15">
              <NavLogo />
              <motion.button onClick={onClose} className="w-10 h-10 rounded-xl bg-surface-container-high/50 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" whileTap={{ scale: 0.9 }} aria-label="Fermer">
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              {PUBLIC_LINKS.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 + i * 0.04 }}>
                  <Link href={link.href} onClick={onClose}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl mb-1 transition-all ${currentPath === link.href ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-high/50 hover:text-on-background'}`}>
                    <div className={`p-2 rounded-lg ${currentPath === link.href ? 'bg-primary/15' : 'bg-surface-container-high/50'}`}>{link.icon}</div>
                    <span className="text-[15px]">{link.label}</span>
                    <ChevronRight className="w-4 h-4 ml-auto text-outline-variant/50" />
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="p-5 border-t border-outline-variant/15 space-y-3">
              {isLoadingAuth ? (
                <>
                  <div className="w-full py-5 rounded-xl bg-surface-container-highest animate-pulse" />
                  <div className="w-full py-5 rounded-xl bg-surface-container-highest animate-pulse" />
                </>
              ) : !user ? (
                <>
                  <Link href="/login" onClick={onClose} className="flex items-center justify-center w-full py-3 rounded-xl border border-outline-variant/40 text-on-surface-variant text-sm font-semibold hover:bg-surface-container-high/40 transition-all">
                    Se connecter
                  </Link>
                  <Link href="/register" onClick={onClose} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold shadow-lg shadow-primary/20 transition-shadow">
                    Créer un compte <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <>
                  <Link href={`/${user.role}/dashboard`} onClick={onClose} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/10 transition-all">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); onClose(); }} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-error/40 text-error text-sm font-semibold hover:bg-error/10 transition-all">
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════
   ▸  MAIN NAVBAR (PUBLIC ONLY)
   ═══════════════════════════════════════════════ */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    setMounted(true);
    // On vérifie la présence du cookie non-sensible "userRole" que l'on a créé au login
    const hasAuthCookie = document.cookie.includes('userRole=');
    if (hasAuthCookie) {
      apiFetch('/user').then(res => {
        if (res.ok) {
          res.json().then(data => {
            setUser(data);
            setIsLoadingAuth(false);
          });
        } else {
          setIsLoadingAuth(false);
        }
      }).catch(() => setIsLoadingAuth(false));
    } else {
      setIsLoadingAuth(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch(e) {}
    document.cookie = 'userRole=; Max-Age=0; path=/';
    document.cookie = 'userName=; Max-Age=0; path=/';
    setUser(null);
    window.location.href = '/login';
  };

  useMotionValueEvent(scrollY, 'change', (v) => setHasScrolled(v > 10));
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  if (
    pathname === '/login' || 
    pathname === '/register' || 
    pathname.startsWith('/etudiant') || 
    pathname.startsWith('/entreprise') || 
    pathname.startsWith('/admin')
  ) return null;

  // Glass style adapts to theme
  const glassBg = isDark
    ? (hasScrolled ? 'rgba(12,14,20,0.82)' : 'rgba(12,14,20,0.55)')
    : (hasScrolled ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.55)');
  const glassBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)';
  const glassShadow = hasScrolled
    ? '0 8px 40px rgba(255,126,95,0.08), 0 1.5px 6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.08)'
    : '0 4px 24px rgba(255,126,95,0.05), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.1)';
  const blurAmount = hasScrolled ? 'blur(24px) saturate(1.6)' : 'blur(16px) saturate(1.3)';

  return (
    <>
      <div className="h-6" aria-hidden />
      <motion.header
        className="fixed top-0 left-0 right-0 z-[80] flex justify-center pointer-events-none"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
      >
        <motion.nav
          role="navigation" aria-label="Navigation principale"
          className="pointer-events-auto w-[95vw] max-w-[1200px] mx-auto flex items-center justify-between relative overflow-hidden"
          animate={{
            marginTop: hasScrolled ? 8 : 16,
            paddingTop: hasScrolled ? 10 : 14,
            paddingBottom: hasScrolled ? 10 : 14,
            paddingLeft: 24, paddingRight: 24,
            borderRadius: 20,
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          style={{ background: glassBg, backdropFilter: blurAmount, WebkitBackdropFilter: blurAmount, border: `1px solid ${glassBorder}`, boxShadow: glassShadow }}
        >
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.5) 70%, transparent 100%)' }} />

          <NavLogo />

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {PUBLIC_LINKS.map((l) => <NavItem key={l.href} link={l} isActive={pathname === l.href} />)}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {isLoadingAuth ? (
              <div className="hidden lg:flex items-center gap-2.5">
                <div className="w-24 h-9 rounded-xl bg-surface-container-highest animate-pulse" />
                <div className="w-32 h-9 rounded-xl bg-surface-container-highest animate-pulse" />
              </div>
            ) : !user ? (
              <>
                <Link href="/login" className="hidden lg:flex items-center px-4 py-2 rounded-xl text-[13px] font-semibold text-on-surface-variant/80 hover:text-on-background border border-transparent hover:border-outline-variant/30 hover:bg-surface-container-high/40 transition-all duration-300">
                  Se connecter
                </Link>
                <motion.div className="hidden lg:block" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/register" className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white overflow-hidden group" style={{ background: 'linear-gradient(135deg, #ff7e5f 0%, #5644d0 100%)' }}>
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 pointer-events-none" />
                    <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/40 to-secondary/40 blur-lg -z-10 opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
                    <span className="relative z-10">Créer un compte</span>
                    <ArrowRight className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <Link href={`/${user.role}/dashboard`} className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-primary hover:text-primary border border-primary/30 hover:bg-primary/10 transition-all duration-300">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button onClick={handleLogout} className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-error hover:text-white border border-error/30 hover:bg-error transition-all duration-300">
                  <LogOut className="w-4 h-4" /> Déconnexion
                </button>
              </>
            )}

            <motion.button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-surface-container-high/50 border border-outline-variant/20 text-on-surface-variant hover:text-primary transition-all"
              onClick={() => setMobileOpen(true)} whileTap={{ scale: 0.92 }}
              aria-label="Ouvrir le menu" aria-expanded={mobileOpen}
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.nav>
      </motion.header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} currentPath={pathname} user={user} handleLogout={handleLogout} isLoadingAuth={isLoadingAuth} />
    </>
  );
}
