'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

interface NavItem {
  icon: string;
  label: string;
  href: string;
  page: string;
  filled?: boolean;
}

const navItems: NavItem[] = [
  { icon: 'dashboard', label: 'Tableau de bord', href: '/etudiant/dashboard', page: 'dashboard', filled: true },
  { icon: 'work', label: 'Opportunités', href: '/etudiant/opportunities', page: 'opportunities' },
  { icon: 'assignment', label: 'Candidatures', href: '/etudiant/applications', page: 'applications' },
  { icon: 'description', label: 'Mes CVs', href: '/etudiant/cv', page: 'cv' },
  { icon: 'mail', label: 'Messagerie', href: '/etudiant/messages', page: 'messages' },
  { icon: 'person', label: 'Profil', href: '/etudiant/profile', page: 'profile' },
];

interface SidebarProps {
  activePage?: string;
}

export default function Sidebar({ activePage = 'dashboard' }: SidebarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.nav
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex flex-col h-screen p-10 bg-white/60 backdrop-blur-xl w-64 fixed left-0 top-0 border-r border-white/20 shadow-lg z-50"
    >
      {/* Logo Section */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-10"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer mb-2 flex items-center gap-3"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary overflow-hidden shadow-sm shrink-0">
            <div className="absolute inset-[1px] bg-surface rounded-[7px] flex items-center justify-center z-10">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4V20" stroke="url(#primaryGradientSd)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M18 10V20" stroke="url(#secondaryGradientSd)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M6 7L18 17" stroke="url(#tertiaryGradientSd)" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="18" cy="5" r="3" fill="#5644d0" />
                  <defs>
                    <linearGradient id="primaryGradientSd" x1="6" y1="4" x2="6" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ff7e5f" />
                      <stop offset="1" stopColor="#ffb4a3" />
                    </linearGradient>
                    <linearGradient id="secondaryGradientSd" x1="18" y1="10" x2="18" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#5644d0" />
                      <stop offset="1" stopColor="#6f5fea" />
                    </linearGradient>
                    <linearGradient id="tertiaryGradientSd" x1="6" y1="7" x2="18" y2="17" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ff7e5f" />
                      <stop offset="1" stopColor="#5644d0" />
                    </linearGradient>
                  </defs>
               </svg>
            </div>
          </div>
          <span className="font-heading text-2xl font-bold text-primary tracking-tight">NexusIntern</span>
        </motion.div>
        <div className="text-on-surface-variant text-sm">Espace Étudiant</div>
      </motion.div>

      {/* Navigation Items */}
      <ul className="flex-1 flex flex-col gap-2">
        {navItems.map((item, index) => {
          const isActive = activePage === item.page;
          return (
            <motion.li
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              <Link
                href={item.href}
                className={`relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'text-primary font-bold border-l-4 border-primary bg-gradient-to-r from-primary/10 to-transparent'
                    : 'text-on-surface-variant hover:text-primary hover:bg-white/10'
                }`}
              >
                {/* Hover Background Effect */}
                {hoveredIndex === index && !isActive && (
                  <motion.div
                    layoutId="navHover"
                    className="absolute inset-0 bg-white/60 rounded-xl"
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
                  style={isActive || item.filled ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </motion.span>

                <span className="relative z-10">{item.label}</span>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-3 w-2 h-2 bg-primary rounded-full"
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

      {/* Pro Upgrade Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-auto pt-6 border-t border-white/20"
      >
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-semibold shadow-lg hover:shadow-2xl transition-all relative overflow-hidden group"
        >
          {/* Shimmer Effect */}
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
          <span className="relative z-10">Passer à Pro</span>
        </motion.button>
      </motion.div>
    </motion.nav>
  );
}
