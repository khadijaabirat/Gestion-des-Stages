'use client';

import { motion } from 'framer-motion';
import { Map } from 'lucide-react';

export default function MapWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02 }}
      className="glass-panel rounded-2xl h-64 relative overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-shadow duration-500"
    >
      {/* Placeholder Map */}
      <div className="w-full h-full bg-white/80 flex items-center justify-center">
        <Map className="w-12 h-12 text-outline-variant" />
      </div>

      {/* Hover Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 bg-surface-container-high/50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-primary font-bold text-xs px-6 py-3 rounded-full shadow-lg flex items-center gap-2 uppercase tracking-wider"
        >
          <Map className="w-4 h-4" />
          Voir la carte
        </motion.button>
      </motion.div>

      {/* Animated Border */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-2xl border-2 border-primary/20 pointer-events-none"
      />
    </motion.div>
  );
}
