'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { GraduationCap, Building2, BrainCircuit } from 'lucide-react';

export default function GlobalEcosystem() {
  const nodes = [
    { icon: <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />, label: 'Talents', sub: 'La nouvelle génération', pos: 'top-[15%] left-[5%] md:left-[15%]', color: 'from-blue-500/20 to-indigo-600/20', textColor: 'text-blue-500' },
    { icon: <Building2 className="w-5 h-5 md:w-6 md:h-6" />, label: 'Entreprises', sub: 'Leaders mondiaux', pos: 'bottom-[15%] right-[5%] md:right-[15%]', color: 'from-purple-500/20 to-fuchsia-600/20', textColor: 'text-purple-500' },
    { icon: <BrainCircuit className="w-5 h-5 md:w-6 md:h-6" />, label: 'NexusBrain™', sub: 'Intelligence Artificielle', pos: 'top-[10%] right-[10%] md:right-[20%]', color: 'from-primary/20 to-tertiary/20', textColor: 'text-primary' }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-32 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-variant/50 border border-outline-variant/30 backdrop-blur-md mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-sm font-bold tracking-wide uppercase text-on-surface-variant">Réseau International</span>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl text-on-background font-black mb-6 tracking-tight"
        >
          Un Écosystème <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">Sans Frontières</span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto font-medium"
        >
          Rejoignez le réseau d'élite mondial où les talents exceptionnels rencontrent les entreprises les plus innovantes.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, type: "spring", stiffness: 100 }}
        className="relative w-full min-h-[500px] md:min-h-[700px] flex items-center justify-center rounded-[3rem] glass-panel group p-8 overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-surface-variant/30 to-transparent pointer-events-none" />
        
        <div className="relative w-full max-w-lg aspect-square">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop"
            alt="International ecosystem"
            fill
            className="object-cover rounded-full drop-shadow-2xl animate-[float_6s_ease-in-out_infinite] z-10 border-8 border-white/20"
          />
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full border border-primary/20 scale-[1.2] animate-[pulse-ring_3s_infinite]" />
          <div className="absolute inset-0 rounded-full border border-secondary/20 scale-[1.4] animate-[pulse-ring_4s_infinite_1s]" />
        </div>

        {nodes.map((node, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.2, type: "spring" }}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`absolute ${node.pos} glass-panel p-4 rounded-3xl flex items-center gap-4 z-20 cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl bg-surface/80 backdrop-blur-xl border border-white/40`}
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${node.color} ${node.textColor} shadow-inner`}>
              {node.icon}
            </div>
            <div className="hidden sm:flex sm:flex-col">
              <p className="text-sm md:text-base font-black text-on-background tracking-tight">{node.label}</p>
              <p className="text-xs text-on-surface-variant font-medium">{node.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
