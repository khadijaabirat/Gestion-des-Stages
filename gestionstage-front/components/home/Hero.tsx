'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check, Play } from 'lucide-react';

export default function Hero() {
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
      const elements = sectionRef.current.querySelectorAll('.reveal-on-scroll, .stagger-children');
      elements?.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-6 lg:px-12 mb-24 mt-12 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="col-span-1 lg:col-span-6 flex flex-col gap-6 z-10 stagger-children">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30 w-fit backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs text-primary">Plateforme 2026 en ligne</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-on-background font-extrabold leading-tight">
            Accélérez votre <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-tertiary to-secondary">
              ascension professionnelle
            </span>
          </h1>
          <p className="text-base text-on-surface-variant max-w-lg">
            Connectez-vous avec des entreprises d&apos;élite grâce à notre moteur de mise en relation basé sur l&apos;IA. Expérimentez une approche ultra-moderne pour lancer votre carrière avec un suivi transparent et des mentors vérifiés.
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            <button className="bg-gradient-to-r from-primary to-tertiary text-on-primary font-semibold px-8 py-4 rounded-xl spring-interactive shadow-lg shadow-primary/30">
              Explorer les rôles
            </button>
            <button className="glass-panel text-on-background font-semibold px-8 py-4 rounded-xl spring-interactive flex items-center gap-2 hover:border-primary/50">
              <Play className="w-5 h-5" />
              Voir la démo
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="col-span-1 lg:col-span-6 relative h-[400px] lg:h-[600px] rounded-3xl overflow-hidden glass-panel group">
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=600&fit=crop"
              alt="Nexus Portal 2026"
              fill
              className="object-cover rounded-2xl drop-shadow-2xl transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
          <div className="absolute top-8 right-8 glass-panel rounded-2xl p-4 animate-float z-20 hover:scale-105 transition-transform border border-primary/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                <Check className="w-5 h-5 text-on-secondary-container" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Correspondance trouvée</p>
                <p className="text-sm font-semibold">Tech Innovators Inc.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
