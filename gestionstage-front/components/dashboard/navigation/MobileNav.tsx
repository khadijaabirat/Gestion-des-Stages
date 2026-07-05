'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LayoutDashboard, Briefcase, FileText, Mail, User } from 'lucide-react';

interface MobileNavProps {
  activePage?: string;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Accueil', href: '/etudiant/dashboard', page: 'dashboard' },
  { icon: Briefcase, label: 'Offres', href: '/etudiant/opportunities', page: 'opportunities' },
  { icon: FileText, label: 'Candidatures', href: '/etudiant/applications', page: 'applications' },
  { icon: Mail, label: 'Messages', href: '/etudiant/messages', page: 'messages' },
  { icon: User, label: 'Profil', href: '/etudiant/profile', page: 'profile' },
];

export default function MobileNav({ activePage = 'dashboard' }: MobileNavProps) {
  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-white/20 shadow-lg"
    >
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.page;
          return (
            <Link
              key={item.page}
              href={item.href}
              className="flex flex-col items-center gap-1 p-2 min-w-[60px] group"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`relative ${
                  isActive ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                <Icon
                  size={24}
                  className={`transition-colors ${
                    isActive ? 'fill-primary' : 'group-hover:text-primary'
                  }`}
                  fill={isActive ? 'currentColor' : 'none'}
                />
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
