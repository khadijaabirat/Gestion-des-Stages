'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Check, Play, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import MagneticButton from '../ui/MagneticButton';

const Globe3D = dynamic(() => import('./Globe3D'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
      </div>
    </div>
  )
});

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Text Reveal Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    show: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } }
  };

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-6 lg:px-12 mb-16 mt-8 relative min-h-[85vh] flex items-center">
      <motion.div style={{ y: y1, opacity }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
        
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-8 z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel border border-primary/30 w-fit backdrop-blur-md"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">Plateforme 2026 en ligne</span>
          </motion.div>

          <motion.h1 
            variants={container}
            initial="hidden"
            animate="show"
            className="font-heading text-5xl md:text-6xl lg:text-7xl text-on-background font-black leading-[1.1] perspective-[1000px]"
          >
            <motion.div variants={item}>Accélérez</motion.div>
            <motion.div variants={item}>votre ascension</motion.div>
            <motion.div variants={item} className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-tertiary to-secondary pb-2">
              professionnelle.
            </motion.div>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-on-surface-variant max-w-lg leading-relaxed border-l-2 border-primary/50 pl-4"
          >
            Connectez-vous avec des entreprises d'élite et trouvez le stage qui correspond à vos ambitions. Une approche moderne pour lancer votre carrière.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-4 mt-2"
          >
            <Link href="/register?role=etudiant">
              <MagneticButton className="bg-primary hover:bg-primary/90 text-on-primary font-semibold px-8 py-4 rounded-full shadow-[0_0_40px_-10px_var(--primary)] flex items-center gap-2 group transition-all">
                Explorer les rôles
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
            </Link>
            
            <MagneticButton className="glass-panel text-on-background font-semibold px-8 py-4 rounded-full flex items-center gap-3 hover:bg-surface-container/50 transition-all">
              <div className="w-8 h-8 rounded-full bg-on-background/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 ml-1" />
              </div>
              Voir la démo
            </MagneticButton>
          </motion.div>
          
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 1 }}
             className="flex items-center gap-4 mt-8"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-background bg-surface-container-high flex items-center justify-center overflow-hidden z-[${10-i}]`}>
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span className="text-xs text-on-surface-variant font-medium mt-1">+2,000 étudiants recrutés</span>
            </div>
          </motion.div>
        </div>

        {/* 3D Globe Animation container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotateY: 15 }} 
          animate={{ opacity: 1, scale: 1, rotateY: 0 }} 
          transition={{ duration: 1.2, type: "spring" }} 
          className="col-span-1 lg:col-span-6 relative h-[500px] lg:h-[700px] rounded-[3rem] overflow-hidden group perspective-[2000px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-[3rem] pointer-events-none z-10 border border-white/5" />
          
          <Globe3D />
          
          {/* Floating glass cards */}
          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-12 right-8 glass-panel rounded-2xl p-4 z-20 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-tertiary flex items-center justify-center shadow-inner">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Match Parfait</p>
                <p className="text-sm font-black text-on-surface">Tech Innovators Inc.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 15, 0] }} 
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 left-8 glass-panel rounded-2xl p-4 z-20 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <p className="text-sm font-semibold text-on-surface">75 offres ajoutées aujourd'hui</p>
             </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
