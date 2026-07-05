'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

interface NavItem {
  icon: string;
  label: string;
  href: string;
  page: string;
}

const navItems: NavItem[] = [
  { icon: 'dashboard', label: 'Tableau de bord', href: '/entreprise/dashboard', page: 'dashboard' },
  { icon: 'work', label: 'Mes Offres', href: '/entreprise/offers', page: 'offers' },
  { icon: 'group', label: 'Candidats', href: '/entreprise/candidates', page: 'candidates' },
  { icon: 'mail', label: 'Messages', href: '/entreprise/messages', page: 'messages' },
  { icon: 'person', label: 'Profil', href: '/entreprise/profile', page: 'profile' },
];

interface EntrepriseSidebarProps {
  activePage?: string;
}

export default function EntrepriseSidebar({ activePage = 'dashboard' }: EntrepriseSidebarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.nav
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex flex-col h-screen p-6 bg-surface/60 backdrop-blur-2xl w-64 fixed left-0 top-0 border-r border-outline-variant/20 shadow-xl z-50"
    >
      <div className="mb-8 mt-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary overflow-hidden shadow-sm shrink-0">
            <div className="absolute inset-[1px] bg-surface rounded-[7px] flex items-center justify-center z-10">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4V20" stroke="url(#primaryGradientEntSd)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M18 10V20" stroke="url(#secondaryGradientEntSd)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M6 7L18 17" stroke="url(#tertiaryGradientEntSd)" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="18" cy="5" r="3" fill="#5644d0" />
                  <defs>
                    <linearGradient id="primaryGradientEntSd" x1="6" y1="4" x2="6" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ff7e5f" />
                      <stop offset="1" stopColor="#ffb4a3" />
                    </linearGradient>
                    <linearGradient id="secondaryGradientEntSd" x1="18" y1="10" x2="18" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#5644d0" />
                      <stop offset="1" stopColor="#6f5fea" />
                    </linearGradient>
                    <linearGradient id="tertiaryGradientEntSd" x1="6" y1="7" x2="18" y2="17" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ff7e5f" />
                      <stop offset="1" stopColor="#5644d0" />
                    </linearGradient>
                  </defs>
               </svg>
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold text-primary tracking-tighter">NexusIntern</h1>
        </div>
        <p className="font-label-caps text-on-surface-variant mt-1 text-xs font-bold uppercase tracking-wider">Espace Entreprise</p>
      </div>

      <ul className="flex-1 flex flex-col gap-2">
        {navItems.map((item, index) => {
          const isActive = activePage === item.page;
          return (
            <motion.li
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              <Link
                href={item.href}
                className={`relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-primary to-tertiary shadow-md'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                }`}
              >
                {hoveredIndex === index && !isActive && (
                  <motion.div
                    layoutId="entrepriseNavHover"
                    className="absolute inset-0 bg-white/60 rounded-xl z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                <motion.span
                  animate={{ rotate: hoveredIndex === index ? [0, -10, 10, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                  className="material-symbols-outlined relative z-10"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </motion.span>

                <span className={`relative z-10 font-label-caps text-xs ${isActive ? 'font-bold' : 'font-semibold'}`}>
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="entrepriseActiveIndicator"
                    className="absolute right-3 w-2 h-2 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            </motion.li>
          );
        })}
      </ul>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-auto space-y-4"
      >
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 bg-gradient-to-r from-primary to-tertiary text-white font-label-caps font-bold text-xs rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all relative overflow-hidden group"
        >
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
          />
          <span className="relative z-10">Publier une Offre</span>
        </motion.button>
        
        <div className="pt-4 border-t border-outline-variant/30">
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/50 rounded-xl font-label-caps text-xs font-bold transition-all group"
          >
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">logout</span>
            Déconnexion
          </Link>
        </div>
      </motion.div>
    </motion.nav>
  );
}
