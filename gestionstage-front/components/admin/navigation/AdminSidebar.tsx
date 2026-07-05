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
  { icon: 'dashboard', label: 'Tableau de bord', href: '/admin/dashboard', page: 'dashboard' },
  { icon: 'business', label: 'Entreprises', href: '/admin/entreprises', page: 'entreprises' },
  { icon: 'people', label: 'Utilisateurs', href: '/admin/users', page: 'users' },
  { icon: 'work', label: 'Offres & Stages', href: '/admin/offers', page: 'offers' },
  { icon: 'psychology', label: 'Compétences', href: '/admin/skills', page: 'skills' },
];

interface AdminSidebarProps {
  activePage?: string;
}

export default function AdminSidebar({ activePage = 'dashboard' }: AdminSidebarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.nav
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex flex-col h-screen p-6 bg-surface/60 backdrop-blur-2xl w-64 fixed left-0 top-0 border-r border-outline-variant/20 shadow-xl z-50"
    >
      {/* Header / Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8 }}
        className="mb-8 mt-4 flex items-center gap-4 cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm relative">
          <img
            alt="Admin Profile"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOoKNGTE2MUJkp0NDyVp4c1Mg-WgBLxTbJLMXpfrR0VhNl330oobpVtQ_PaZSrmOjnrk24dXESQmzq7DQpgH6m9VYKpk9INOP07y-lp-QlSS77t5esiLQATZPYJRQ5K6tlJiHDJR5fGzQj41hLCA96WyVyvlJyAE6WIMju2sl-rsQmjNXEhiJpt2B2TSysj2OLVDtloN2wyg9O646bFa-mMcf_AWpPOZLySy8xU9DI9iWkdHemk1R7bVHz74vI57NrF8qjw7ktzbM"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
        </div>
        <div>
          <h2 className="font-heading text-primary font-bold text-base">Admin Principal</h2>
          <span className="font-label-caps text-on-surface-variant text-xs">Système Global</span>
        </div>
      </motion.div>

      {/* Navigation Links */}
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
                {/* Hover Background Effect */}
                {hoveredIndex === index && !isActive && (
                  <motion.div
                    layoutId="adminNavHover"
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

                <span className={`relative z-10 font-label-caps ${isActive ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
                
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="adminActiveIndicator"
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

      {/* Footer / CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-auto"
      >
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 bg-surface-container-high text-primary font-label-caps rounded-xl shadow-sm border border-outline-variant/30 relative overflow-hidden group"
        >
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100"
          />
          <span className="relative z-10">Passer à la version Pro</span>
        </motion.button>
      </motion.div>
    </motion.nav>
  );
}
