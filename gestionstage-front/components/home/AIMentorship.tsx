'use client';

import { useEffect, useRef } from 'react';

const COLOR_MAP = {
  primary: '#ff7e5f',
  secondary: '#5644d0',
  tertiary: '#7f5600',
};

export default function AIMentorship() {
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

  const features = [
    { icon: 'psychology', title: 'Analyse cognitive', desc: 'Profilage des compétences approfondi', color: 'primary' as const, delay: '0s' },
    { icon: 'model_training', title: 'Parcours sur mesure', desc: 'Recommandations d\'apprentissage dynamiques', color: 'secondary' as const, delay: '0.5s' },
    { icon: 'forum', title: 'Interaction en temps réel', desc: 'Coaching virtuel disponible 24/7', color: 'tertiary' as const, delay: '1s' }
  ];

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-6 lg:px-12 mb-24">
      <div className="glass-panel rounded-3xl p-8 md:p-12 bg-gradient-to-tl from-surface-container-lowest to-secondary/5 relative border border-secondary/10">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="relative min-h-[400px] rounded-2xl glass-panel border border-white/50 shadow-xl flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-50 rounded-2xl" />
            <div className="relative z-10 flex flex-col gap-6 w-full">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur rounded-xl p-4 flex items-center gap-4 shadow-sm animate-float"
                  style={{
                    animationDelay: feature.delay,
                    marginLeft: `${i * 8}px`
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${COLOR_MAP[feature.color]}20`,
                      color: COLOR_MAP[feature.color]
                    }}
                  >
                    <span className="material-symbols-outlined">{feature.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-background">{feature.title}</p>
                    <p className="text-xs text-on-surface-variant">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 stagger-children">
            <h2 className="font-heading text-3xl md:text-4xl text-on-background font-extrabold">
              Mentorat augmenté par{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-tertiary">NexusBrain</span>
            </h2>
            <p className="text-base text-on-surface-variant">
              Avant même de rencontrer votre mentor humain, notre IA prépare le terrain en identifiant vos forces et vos axes d&apos;amélioration. Maximisez chaque session d&apos;échange.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
