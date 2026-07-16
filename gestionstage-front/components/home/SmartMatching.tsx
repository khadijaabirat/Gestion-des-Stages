'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, MessageCircle, ShieldCheck } from 'lucide-react';

const FeatureCard = ({ feature, index }: { feature: any, index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // 3D Tilt effect values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 250, damping: 25, delay: feature.delay }}
      className="group relative h-full perspective-1000 z-10"
    >
      {/* 3D Glowing background aura */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-[2rem] opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700 -z-10`}
        style={{ transform: "translateZ(-50px)" }}
      />
      
      <div className="relative h-full glass-panel p-8 md:p-10 rounded-[2rem] border border-outline-variant/30 group-hover:border-white/40 overflow-hidden transition-colors duration-500 flex flex-col bg-surface/40 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
        
        {/* Subtle top border gradient */}
        <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${feature.iconColor}`} />

        <div className="relative mb-10" style={{ transform: "translateZ(60px)" }}>
          {/* Floating Icon Container */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 + index * 0.5, ease: "easeInOut" }}
            className={`w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.color} ${feature.iconColor} shadow-2xl backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform duration-500 z-10 relative group-hover:rotate-6`}
          >
            {feature.icon}
          </motion.div>
          {/* Background extreme glow for icon */}
          <div className={`absolute top-1/2 left-6 w-16 h-16 rounded-full ${feature.glowColor} opacity-0 group-hover:opacity-60 blur-2xl -translate-y-1/2 transition-opacity duration-500 -z-10`} />
        </div>

        <div style={{ transform: "translateZ(40px)" }}>
          <h3 className="font-heading text-2xl md:text-3xl font-black mb-4 text-on-background group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-on-background group-hover:to-surface-variant transition-all duration-300 tracking-tight">
            {feature.title}
          </h3>
          
          <p className="text-base text-on-surface-variant leading-relaxed font-medium mt-auto">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function SmartMatching() {
  const features = [
    {
      title: "Matching Précis",
      description: "Notre moteur de recherche connecte instantanément votre profil aux offres les plus pertinentes. Fini les recherches interminables.",
      icon: <Sparkles className="w-10 h-10" />,
      color: "from-primary/20 to-primary-container/20",
      glowColor: "bg-primary",
      iconColor: "text-primary",
      delay: 0.1
    },
    {
      title: "Connectivité Multi-canal",
      description: "Soyez alerté instantanément. Recevez vos mises à jour directement sur WhatsApp ou via nos notifications push, et discutez en direct avec les recruteurs.",
      icon: <MessageCircle className="w-10 h-10" />,
      color: "from-tertiary/20 to-tertiary-container/20",
      glowColor: "bg-tertiary",
      iconColor: "text-tertiary",
      delay: 0.2
    },
    {
      title: "Zéro Paperasse",
      description: "Générez, validez et signez vos conventions de stage électroniquement en un temps record grâce à notre signature certifiée Yousign.",
      icon: <ShieldCheck className="w-10 h-10" />,
      color: "from-secondary/20 to-secondary-container/20",
      glowColor: "bg-secondary",
      iconColor: "text-secondary",
      delay: 0.3
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-16 py-8 relative overflow-hidden" style={{ perspective: "1500px" }}>
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 w-full max-w-4xl h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 pointer-events-none" />

      <div className="text-center mb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-surface/60 border border-outline-variant/30 backdrop-blur-xl shadow-lg mb-8"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <span className="text-sm font-black tracking-widest uppercase text-on-surface">Avantages Exclusifs</span>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="font-heading text-4xl md:text-6xl text-on-background font-black mb-8 tracking-tight"
        >
          Pourquoi nous <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">choisir ?</span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-on-surface-variant max-w-3xl mx-auto font-medium"
        >
          Trouvez votre stage idéal rapidement et en toute sécurité. Nous simplifions chaque étape, de la recherche jusqu'à la signature de la convention.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
        {features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} index={index} />
        ))}
      </div>
    </section>
  );
}
