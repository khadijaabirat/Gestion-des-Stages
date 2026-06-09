'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function FeaturedOpportunities() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      const elements = sectionRef.current.querySelectorAll('.stagger-children');
      elements?.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-6 lg:px-12 mb-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4"
      >
        <motion.div variants={itemVariants}>
          <h2 className="font-heading text-3xl md:text-4xl text-on-background mb-2 font-bold">Offres à la une</h2>
          <p className="text-sm text-on-surface-variant">Des opportunités sélectionnées pour votre profil d&apos;élite.</p>
        </motion.div>
        <motion.button
          variants={itemVariants}
          className="hidden md:flex text-primary font-mono text-xs items-center gap-1 spring-interactive group"
          whileHover={{ x: 4 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          VOIR TOUT{' '}
          <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform duration-300">
            arrow_forward
          </span>
        </motion.button>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {/* Featured Large Card */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-8 glass-panel rounded-2xl overflow-hidden group relative cursor-pointer spring-interactive min-h-[280px]"
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Image
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
            alt="Lumina Tech"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end z-10">
            <motion.div
              className="text-white"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/20 backdrop-blur-md text-xs font-mono mb-2 border border-white/30"
                whileHover={{ scale: 1.05 }}
              >
                <span className="material-symbols-outlined text-xs text-primary">local_fire_department</span> Tendance
              </motion.div>
              <h3 className="font-heading text-2xl font-bold">Stagiaire en ingénierie de prompt IA</h3>
              <p className="text-sm opacity-80 mt-1">Lumina Tech Systems • Paris, FR</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Featured Small Card */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-4 glass-panel rounded-2xl p-6 flex flex-col justify-between cursor-pointer spring-interactive transition-all duration-300 min-h-[280px] group"
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#ff7e5f33';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(255, 126, 95, 0.15)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 126, 95, 0)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px 0 rgba(255, 126, 95, 0.05)';
          }}
        >
          <div className="flex justify-between items-start">
            <motion.div
              className="w-12 h-12 rounded-xl bg-tertiary-container/10 border border-tertiary-container/30 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <span className="material-symbols-outlined text-tertiary-container">analytics</span>
            </motion.div>
            <span className="text-xs font-mono text-on-surface-variant bg-surface-variant px-2 py-1 rounded">il y a 3 jours</span>
          </div>
          <div>
            <motion.h3
              className="font-heading text-xl font-bold text-on-background mb-2"
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
            >
              Science des données
            </motion.h3>
            <p className="text-sm text-on-surface-variant mb-4">Quantum Finance • London</p>
            <div className="flex flex-wrap gap-2">
              {['Python', 'SQL'].map((tech) => (
                <motion.span
                  key={tech}
                  className="text-xs font-mono px-2 py-1 rounded-full border border-outline-variant/50 text-on-surface-variant transition-colors cursor-pointer"
                  whileHover={{
                    backgroundColor: '#ff7e5f15',
                    borderColor: '#ff7e5f50',
                    scale: 1.05,
                  }}
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
