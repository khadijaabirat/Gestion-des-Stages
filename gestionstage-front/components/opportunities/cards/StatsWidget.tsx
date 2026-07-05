'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function StatsWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -4,
        transition: { duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }
      }}
      className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-secondary/10 to-transparent border-t border-secondary/20 relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500"
    >
      {/* Shimmer Effect */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'linear' }}
        className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none transform -skew-x-12"
      />

      {/* Icon */}
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center mb-4 shadow-md"
      >
        <TrendingUp className="w-6 h-6 text-on-secondary-container" />
      </motion.div>

      {/* Content */}
      <h3 className="text-xl font-bold text-on-surface mb-2">
        Opportunités en Hausse
      </h3>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        Plus de <span className="font-bold text-secondary">300 nouvelles offres</span> dans le secteur de la Tech cette semaine.
      </p>

      {/* Animated Progress Bar */}
      <div className="mt-4 w-full h-1 bg-surface-container-low rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '75%' }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
        />
      </div>
    </motion.div>
  );
}
