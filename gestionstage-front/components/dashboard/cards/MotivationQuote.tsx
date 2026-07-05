'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const quotes = [
  '"Chaque ligne de code est un pas vers votre futur."',
  '"La persévérance est la clé du succès technique."',
  '"Apprendre n\'est jamais fini, c\'est un voyage."',
  '"Votre prochain grand projet commence ici."',
];

export default function MotivationQuote() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -4,
        scale: 1.005,
        transition: { duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }
      }}
      className="col-span-1 md:col-span-4 glass-panel rounded-2xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500"
    >
      {/* Shimmer Effect */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'linear' }}
        className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none transform -skew-x-12"
      />

      <motion.span
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="material-symbols-outlined text-primary-container text-4xl mb-4"
      >
        format_quote
      </motion.span>

      <div className="h-20 flex items-center justify-center relative w-full">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="italic text-on-surface-variant px-4"
          >
            {quotes[currentIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 w-16 h-1 bg-primary/20 rounded-full overflow-hidden">
        <motion.div
          key={currentIndex}
          className="h-full bg-primary/60"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 8, ease: 'linear' }}
        />
      </div>

      {/* Dots Indicator */}
      <div className="flex gap-1.5 mt-3">
        {quotes.map((_, index) => (
          <motion.div
            key={index}
            animate={{
              scale: index === currentIndex ? 1.2 : 1,
              opacity: index === currentIndex ? 1 : 0.3,
            }}
            transition={{ duration: 0.3 }}
            className={`w-1.5 h-1.5 rounded-full ${
              index === currentIndex ? 'bg-primary' : 'bg-on-surface-variant'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
