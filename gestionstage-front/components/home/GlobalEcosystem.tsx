'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

const COLOR_MAP = {
  primary: '#ff7e5f',
  secondary: '#5644d0',
  tertiary: '#7f5600',
};

export default function GlobalEcosystem() {
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

  const nodes = [
    { icon: 'school', label: 'Étudiants', sub: 'Talents émergents', pos: 'top-1/4 left-4 md:left-1/4', color: 'primary' as const },
    { icon: 'corporate_fare', label: 'Entreprises', sub: 'Leaders du marché', pos: 'bottom-1/4 right-4 md:right-1/4', color: 'secondary' as const },
    { icon: 'psychology', label: 'Mentors', sub: 'Guides experts', pos: 'top-1/3 right-4 md:right-1/3', color: 'tertiary' as const }
  ];

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-6 lg:px-12 mb-24">
      <div className="text-center mb-12 stagger-children">
        <h2 className="font-heading text-3xl md:text-4xl text-on-background mb-4 font-bold">Écosystème Global</h2>
        <p className="text-base text-on-surface-variant max-w-2xl mx-auto">
          Connectez-vous au réseau d&apos;élite mondial de talents, d&apos;entreprises et de mentors.
        </p>
      </div>

      <div className="relative w-full min-h-[600px] flex items-center justify-center rounded-3xl glass-panel group p-8">
        <div className="relative w-full max-w-md aspect-square">
          <Image
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop"
            alt="Global Network"
            fill
            className="object-cover rounded-3xl drop-shadow-2xl animate-float-slow z-10"
          />
        </div>

        {nodes.map((node, i) => (
          <div
            key={i}
            className={`absolute ${node.pos} glass-panel p-3 md:p-4 rounded-2xl flex items-center gap-3 z-20 cursor-pointer spring-interactive transition-all duration-300`}
            style={{
              borderColor: `${COLOR_MAP[node.color]}33`
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = `${COLOR_MAP[node.color]}66`;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 16px ${COLOR_MAP[node.color]}20`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = `${COLOR_MAP[node.color]}33`;
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px 0 rgba(255,126,95,0.05)';
            }}
          >
            <div
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: `${COLOR_MAP[node.color]}20`,
                color: COLOR_MAP[node.color]
              }}
            >
              <span className="material-symbols-outlined text-base md:text-xl">{node.icon}</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs md:text-sm font-bold">{node.label}</p>
              <p className="text-[10px] text-on-surface-variant">{node.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
