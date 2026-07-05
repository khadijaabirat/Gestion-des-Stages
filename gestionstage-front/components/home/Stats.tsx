'use client';

import { useEffect, useRef } from 'react';
import { motion, animate, useInView } from 'framer-motion';

const AnimatedNumber = ({ value, suffix }: { value: number; suffix: string }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "0px 0px -50px 0px" });

  useEffect(() => {
    if (isInView && nodeRef.current) {
      const node = nodeRef.current;
      const controls = animate(0, value, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate(v) {
          node.textContent = Math.round(v) + suffix;
        }
      });
      return () => controls.stop();
    }
  }, [value, suffix, isInView]);

  return <span ref={nodeRef}>0{suffix}</span>;
};

export default function Stats({ stats: initialStats }: { stats?: any }) {
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
    { value: initialStats?.offres ?? 0, suffix: '+', label: 'Stages actifs', color: '#ff7e5f' },
    { value: initialStats?.entreprises ?? 0, suffix: '+', label: 'Entreprises vérifiées', color: '#5644d0' },
    { value: initialStats?.taux_reussite ?? 0, suffix: '%', label: 'Taux de réussite', color: '#ff7e5f' },
  ];

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-6 lg:px-12 mb-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="glass-panel rounded-3xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative transition-all duration-700 hover:shadow-[0_30px_60px_rgba(255,126,95,0.15)] hover:-translate-y-2 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 group-hover:animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 group-hover:animate-pulse" />

        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="flex flex-col items-center gap-2 z-10 group/stat relative">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-2xl -z-10 opacity-0 group-hover/stat:opacity-100 transition-all duration-300 scale-90 group-hover/stat:scale-110"
            />
            <motion.span
              className="font-heading text-5xl md:text-6xl font-extrabold relative"
              style={{ color: stat.color, textShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              whileHover={{ scale: 1.15, y: -5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </motion.span>
            <motion.span
              className="font-mono text-xs font-bold uppercase tracking-widest mt-2"
              style={{ color: stat.color }}
              initial={{ opacity: 0.6 }}
              whileHover={{ opacity: 1, letterSpacing: '0.1em' }}
              transition={{ duration: 0.3 }}
            >
              {stat.label}
            </motion.span>
          </motion.div>
        ))}

        {/* Dividers */}
        <div className="hidden md:block absolute left-1/3 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-outline-variant/30 to-transparent group-hover:via-primary/20 transition-colors duration-500" />
        <div className="hidden md:block absolute right-1/3 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-outline-variant/30 to-transparent group-hover:via-secondary/20 transition-colors duration-500" />
      </motion.div>
    </section>
  );
}
