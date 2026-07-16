'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, UserPlus, Building, Sparkles } from 'lucide-react';

export default function CTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-24 mt-12 relative" style={{ perspective: '2000px' }}>
      <motion.div 
        ref={containerRef}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 100, rotateX: 20 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative w-full rounded-[3rem] p-10 md:p-24 overflow-hidden bg-surface-container-lowest/80 backdrop-blur-3xl border border-outline-variant/30 shadow-[0_30px_100px_-20px_rgba(var(--primary-rgb),0.3)] flex flex-col items-center text-center group"
      >
        {/* Animated Background Gradients & Glows */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-surface/50 to-secondary/10 opacity-80" />
        
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-tr from-primary/15 to-transparent rounded-full blur-[100px] pointer-events-none -z-10"
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-bl from-secondary/15 to-transparent rounded-full blur-[100px] pointer-events-none -z-10"
        />
        
        {/* Border glow on hover */}
        <div className="absolute inset-0 rounded-[3rem] border-2 border-transparent group-hover:border-white/20 transition-colors duration-700 pointer-events-none" />
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center" style={{ transform: "translateZ(80px)" }}>
          
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-[2rem] flex items-center justify-center mb-10 shadow-[0_20px_50px_rgba(255,126,95,0.4)] relative"
          >
            <div className="absolute inset-0 rounded-[2rem] bg-white/20 blur-xl animate-pulse" />
            <Sparkles className="w-12 h-12 text-white relative z-10" />
          </motion.div>
          
          <h2 className="font-heading text-5xl md:text-7xl text-on-background font-black mb-8 tracking-tight leading-tight drop-shadow-2xl">
            Prêt à commencer votre <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-shimmer">
              aventure ?
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-on-surface-variant font-medium mb-14 max-w-2xl" style={{ transform: "translateZ(40px)" }}>
            Rejoignez la plateforme de recrutement la plus avancée et propulsez votre avenir dès aujourd'hui.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center" style={{ transform: "translateZ(60px)" }}>
            <Link href="/register?role=etudiant" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-primary text-white font-bold text-lg shadow-[0_10px_30px_rgba(255,126,95,0.4)] hover:shadow-[0_20px_40px_rgba(255,126,95,0.6)] transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-[150%] skew-x-12 group-hover:animate-[shine_1.5s_ease-in-out]" />
                <UserPlus className="w-6 h-6" />
                Compte Étudiant
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </motion.button>
            </Link>

            <Link href="/register?role=entreprise" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-surface-variant/30 border-2 border-outline-variant/30 text-on-surface font-bold text-lg backdrop-blur-xl hover:bg-surface-variant/60 hover:border-outline-variant/60 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 group"
              >
                <Building className="w-6 h-6" />
                Compte Entreprise
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
