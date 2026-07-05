'use client';

import { motion } from 'framer-motion';
import { Menu, Bell } from 'lucide-react';

interface TopBarProps {
  title?: string;
}

export default function TopBar({ title = 'NexusIntern' }: TopBarProps) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/60 backdrop-blur-xl border-b border-white/20 shadow-sm"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <Menu size={24} className="text-on-surface" />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary overflow-hidden shadow-sm">
              <div className="absolute inset-[1px] bg-surface rounded-[7px] flex items-center justify-center z-10">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 4V20" stroke="url(#primaryGradientTop)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M18 10V20" stroke="url(#secondaryGradientTop)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M6 7L18 17" stroke="url(#tertiaryGradientTop)" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="18" cy="5" r="3" fill="#5644d0" />
                    <defs>
                      <linearGradient id="primaryGradientTop" x1="6" y1="4" x2="6" y2="20" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#ff7e5f" />
                        <stop offset="1" stopColor="#ffb4a3" />
                      </linearGradient>
                      <linearGradient id="secondaryGradientTop" x1="18" y1="10" x2="18" y2="20" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#5644d0" />
                        <stop offset="1" stopColor="#6f5fea" />
                      </linearGradient>
                      <linearGradient id="tertiaryGradientTop" x1="6" y1="7" x2="18" y2="17" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#ff7e5f" />
                        <stop offset="1" stopColor="#5644d0" />
                      </linearGradient>
                    </defs>
                 </svg>
              </div>
            </div>
            <h1 className="text-lg font-bold text-primary font-heading tracking-tight">{title}</h1>
          </div>
        </div>
        <button className="relative p-2 hover:bg-white/20 rounded-lg transition-colors">
          <Bell size={20} className="text-on-surface-variant" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>
      </div>
    </motion.nav>
  );
}
