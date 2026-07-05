'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calendar, Star } from 'lucide-react';

export default function EliteMentors() {
  const mentors = [
    { name: 'Sophie Laurent', role: 'Directrice IA', company: 'Google DeepMind', color: 'from-blue-500 to-indigo-600', img: 'https://i.pravatar.cc/150?u=sophie@google.com&s=150', rating: 4.9 },
    { name: 'Marc Dubois', role: 'VP Engineering', company: 'Meta', color: 'from-purple-500 to-fuchsia-600', img: 'https://i.pravatar.cc/150?u=marc@meta.com&s=150', rating: 5.0 },
    { name: 'Elena Rostova', role: 'Lead Product Manager', company: 'NVIDIA', color: 'from-primary to-tertiary', img: 'https://i.pravatar.cc/150?u=elena@nvidia.com&s=150', rating: 4.8 }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-32 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none -z-10" />

      <div className="text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-variant/50 border border-outline-variant/30 backdrop-blur-md mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
          <span className="text-sm font-bold tracking-wide uppercase text-on-surface-variant">Accompagnement Premium</span>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl text-on-background font-black mb-6 tracking-tight"
        >
          Des Mentors <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-primary">d'Élite</span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto font-medium"
        >
          Accélérez votre carrière en apprenant directement des leaders qui façonnent l'avenir de la technologie mondiale.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {mentors.map((mentor, i) => (
          <motion.div
            key={mentor.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ y: -10 }}
            className="group glass-panel rounded-[2rem] p-8 flex flex-col items-center text-center relative overflow-hidden transition-shadow hover:shadow-2xl"
          >
            {/* Hover Glow */}
            <div className={`absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-b ${mentor.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none blur-[50px]`} />
            
            <div className="relative w-32 h-32 rounded-[2rem] mb-6 shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 border-2 border-white/20 rounded-[2rem] z-10" />
              <Image src={mentor.img} alt={mentor.name} fill className="object-cover" />
            </div>
            
            <h3 className="font-heading text-2xl font-bold text-on-background mb-1">{mentor.name}</h3>
            
            <div className="flex items-center gap-1.5 text-tertiary mb-3">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-bold text-on-surface">{mentor.rating}</span>
            </div>

            <p className="text-sm font-bold text-on-surface-variant mb-1">{mentor.role}</p>
            <p className="font-mono text-xs text-primary bg-primary/10 px-3 py-1 rounded-full mb-6 font-black uppercase tracking-wider">{mentor.company}</p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${mentor.color} text-white font-bold shadow-lg opacity-90 hover:opacity-100 transition-opacity`}
            >
              <Calendar className="w-4 h-4" />
              Réserver une session
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
