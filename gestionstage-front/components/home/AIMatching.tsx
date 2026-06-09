'use client';

import { useEffect, useRef } from 'react';

export default function AIMatching() {
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
      <div className="glass-panel rounded-3xl p-8 md:p-12 bg-gradient-to-br from-surface-container-lowest to-surface-variant/30 relative border border-primary/10">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="flex flex-col gap-6 stagger-children">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit backdrop-blur-sm">
              <span className="material-symbols-outlined text-base text-primary">auto_awesome</span>
              <span className="font-mono text-xs text-primary">Noyau NexusBrain™</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl text-on-background font-extrabold">
              L&apos;intelligence artificielle au service de votre{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">potentiel</span>.
            </h2>
            <p className="text-base text-on-surface-variant">
              Notre moteur d&apos;IA n&apos;associe pas seulement des mots-clés. Il comprend votre style de travail, votre potentiel d&apos;apprentissage et la culture de l&apos;entreprise pour créer des symbioses professionnelles parfaites.
            </p>
            <ul className="space-y-4 mt-4">
              {['Analyse prédictive de réussite', 'Évaluation d\'adéquation culturelle en temps réel', 'Recommandations de formation personnalisées'].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="material-symbols-outlined text-sm text-primary">check</span>
                  </div>
                  <span className="text-sm text-on-surface">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative h-[400px] rounded-2xl bg-gradient-to-tr from-surface to-surface-variant/50 border border-white/50 shadow-xl flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 z-10">
              <span className="material-symbols-outlined text-white text-3xl">hub</span>
            </div>
            {[
              { icon: 'person', color: 'primary', pos: 'top-1/4 left-1/4', delay: '0s' },
              { icon: 'business', color: 'secondary', pos: 'bottom-1/4 right-1/4', delay: '0.5s' },
              { icon: 'data_object', color: 'tertiary', pos: 'top-1/3 right-1/4', delay: '1s' },
              { icon: 'trending_up', color: 'text-green-500', pos: 'bottom-1/3 left-1/4', delay: '1.5s' }
            ].map((node, i) => (
              <div key={i} className={`absolute ${node.pos} w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center z-20 animate-[bounce_3s_infinite]`} style={{ animationDelay: node.delay }}>
                <span className={`material-symbols-outlined text-xl ${node.color.startsWith('text-') ? node.color : `text-${node.color}`}`}>{node.icon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
