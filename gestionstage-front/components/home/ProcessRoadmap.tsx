'use client';

import { useEffect, useRef } from 'react';

export default function ProcessRoadmap() {
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

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-6 lg:px-12 mb-24">
      <div className="text-center mb-12 stagger-children">
        <h2 className="font-heading text-3xl md:text-4xl text-on-background mb-4 font-bold">Votre parcours vers le succès</h2>
        <p className="text-base text-on-surface-variant max-w-2xl mx-auto">
          Un processus fluide, optimisé par l&apos;intelligence artificielle pour vous connecter aux meilleures opportunités.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative stagger-children">
        <div className="relative glass-panel rounded-2xl p-8 text-center flex flex-col items-center gap-4 spring-interactive hover:border-primary/50">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-4xl">person_add</span>
          </div>
          <h3 className="font-heading text-xl font-bold">1. Créez votre profil</h3>
          <p className="text-sm text-on-surface-variant">
            Mettez en valeur vos compétences, vos projets et vos aspirations professionnelles.
          </p>
        </div>

        <div className="relative glass-panel rounded-2xl p-8 text-center flex flex-col items-center gap-4 spring-interactive hover:border-secondary/50">
          <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-2 shadow-lg shadow-secondary/20 animate-pulse">
            <span className="material-symbols-outlined text-4xl">psychology_alt</span>
          </div>
          <h3 className="font-heading text-xl font-bold">2. Matching par IA</h3>
          <p className="text-sm text-on-surface-variant">
            Notre algorithme NexusBrain analyse votre profil et vous connecte aux offres idéales.
          </p>
        </div>

        <div className="relative glass-panel rounded-2xl p-8 text-center flex flex-col items-center gap-4 spring-interactive hover:border-tertiary/50">
          <div className="w-16 h-16 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center mb-2 shadow-lg shadow-tertiary/20">
            <span className="material-symbols-outlined text-4xl">rocket_launch</span>
          </div>
          <h3 className="font-heading text-xl font-bold">3. Décollez</h3>
          <p className="text-sm text-on-surface-variant">
            Acceptez l&apos;offre parfaite, accédez à votre mentor et propulsez votre carrière.
          </p>
        </div>
      </div>
    </section>
  );
}
