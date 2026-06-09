'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedNumber = ({ value, suffix }: { value: number; suffix: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      const interval = setInterval(() => {
        setDisplayValue((prev) => (prev < value ? prev + Math.ceil(value / 50) : value));
      }, 30);
      return () => clearInterval(interval);
    }
  }, [value]);

  return (
    <span>
      {displayValue >= value ? value : displayValue}
      {suffix}
    </span>
  );
};

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

  const stats = [
    { value: 15000, suffix: '+', label: 'Stages actifs', color: '#ff7e5f' },
    { value: 2400, suffix: '+', label: 'Entreprises vérifiées', color: '#7f5600' },
    { value: 98, suffix: '%', label: 'Taux de réussite', color: '#5644d0' },
  ];

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-6 lg:px-12 mb-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="glass-panel rounded-3xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative transition-all duration-500 hover:shadow-xl hover:scale-[1.01] group"
      >
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="flex flex-col items-center gap-2 z-10 group/stat">
            <motion.span
              className="font-heading text-5xl md:text-6xl font-extrabold"
              style={{ color: stat.color }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </motion.span>
            <motion.span
              className="font-mono text-xs text-on-surface-variant uppercase tracking-wider"
              initial={{ opacity: 0.6 }}
              whileHover={{ opacity: 1 }}
            >
              {stat.label}
            </motion.span>
          </motion.div>
        ))}

        {/* Dividers */}
        <div className="hidden md:block absolute left-1/3 top-8 bottom-8 w-px bg-gradient-to-b from-outline-variant/0 via-outline-variant/20 to-outline-variant/0" />
        <div className="hidden md:block absolute right-1/3 top-8 bottom-8 w-px bg-gradient-to-b from-outline-variant/0 via-outline-variant/20 to-outline-variant/0" />
      </motion.div>
    </section>
  );
}
