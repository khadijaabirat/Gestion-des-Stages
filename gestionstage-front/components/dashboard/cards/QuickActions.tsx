'use client';

import { motion } from 'framer-motion';

import Link from 'next/link';

const actions = [
  { icon: 'upload_file', label: 'Gérer mon CV', color: 'primary', href: '/etudiant/cv' },
  { icon: 'search', label: 'Chercher Offres', color: 'secondary', href: '/etudiant/offres' },
  { icon: 'work_history', label: 'Mes Candidatures', color: 'tertiary', href: '/etudiant/applications' },
];

export default function QuickActions() {
  return (
    <div className="col-span-1 md:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-5">
      {actions.map((action, index) => (
        <Link
          key={action.label}
          href={action.href}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{
              y: -8,
              scale: 1.02,
              transition: { duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }
            }}
            whileTap={{ scale: 0.98 }}
            className="h-full glass-panel rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-white/80 transition-all relative overflow-hidden shadow-xl hover:shadow-2xl group cursor-pointer"
          >
          {/* Shimmer Effect */}
          <motion.div
            initial={{ x: '-100%' }}
            whileHover={{ x: '200%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none transform -skew-x-12"
          />

          {/* Icon Container */}
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className={`w-14 h-14 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-${action.color}/10 transition-colors shadow-md relative z-10`}
          >
            <motion.span
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className={`material-symbols-outlined text-${action.color} text-2xl`}
            >
              {action.icon}
            </motion.span>

            {/* Pulse Effect on Hover */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className={`absolute inset-0 rounded-full bg-${action.color}/20`}
            />
          </motion.div>

          {/* Label */}
          <span className="font-semibold text-on-surface text-sm relative z-10">
            {action.label}
          </span>

          {/* Background Glow on Hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className={`absolute inset-0 bg-gradient-to-br from-${action.color}/5 to-transparent rounded-2xl -z-10`}
          />

          {/* Border Glow */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className={`absolute inset-0 rounded-2xl border-2 border-${action.color}/20 -z-10`}
          />
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
