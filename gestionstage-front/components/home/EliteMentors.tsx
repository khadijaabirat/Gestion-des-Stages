'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

const COLOR_MAP = {
  primary: '#ff7e5f',
  secondary: '#5644d0',
  tertiary: '#7f5600',
};

export default function EliteMentors() {
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

  const mentors = [
    { name: 'Sophie Laurent', role: 'Directrice IA', company: 'Google DeepMind', color: 'primary' as const, img: 'https://i.pravatar.cc/150?u=sophie@google.com&s=150' },
    { name: 'Marc Dubois', role: 'VP Engineering', company: 'Meta', color: 'secondary' as const, img: 'https://i.pravatar.cc/150?u=marc@meta.com&s=150' },
    { name: 'Elena Rostova', role: 'Chef de Produit Senior', company: 'NVIDIA', color: 'tertiary' as const, img: 'https://i.pravatar.cc/150?u=elena@nvidia.com&s=150' }
  ];

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-6 lg:px-12 mb-24">
      <div className="text-center mb-12 stagger-children">
        <h2 className="font-heading text-3xl md:text-4xl text-on-background mb-4 font-bold">Mentors d&apos;Élite</h2>
        <p className="text-base text-on-surface-variant max-w-2xl mx-auto">
          Apprenez directement des leaders qui façonnent l&apos;avenir de la technologie.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
        {mentors.map((mentor) => (
          <div
            key={mentor.name}
            className="glass-panel rounded-2xl p-6 flex flex-col items-center text-center spring-interactive transition-all duration-300"
            style={{
              borderColor: `${COLOR_MAP[mentor.color]}33`
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = `${COLOR_MAP[mentor.color]}66`;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 24px ${COLOR_MAP[mentor.color]}20`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = `${COLOR_MAP[mentor.color]}33`;
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px 0 rgba(255,126,95,0.05)';
            }}
          >
            <div className="relative w-24 h-24 rounded-full mb-4 shadow-lg border-2 border-surface-variant overflow-hidden">
              <Image src={mentor.img} alt={mentor.name} fill className="object-cover" />
            </div>
            <h3 className="font-heading text-xl font-bold text-on-background">{mentor.name}</h3>
            <p className="text-sm font-medium mb-1" style={{ color: COLOR_MAP[mentor.color] }}>
              {mentor.role}
            </p>
            <p className="font-mono text-xs text-on-surface-variant mb-4">{mentor.company}</p>
            <button
              className="px-4 py-2 text-xs font-mono rounded-full border transition-all duration-300"
              style={{
                borderColor: '#8b716b',
                color: 'inherit'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = COLOR_MAP[mentor.color];
                (e.currentTarget as HTMLElement).style.color = 'white';
                (e.currentTarget as HTMLElement).style.borderColor = COLOR_MAP[mentor.color];
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'inherit';
                (e.currentTarget as HTMLElement).style.borderColor = '#8b716b';
              }}
            >
              Réserver une session
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
