'use client';

import { useEffect, useRef } from 'react';
import { motion, animate, useInView } from 'framer-motion';
import { Briefcase, Building2, TrendingUp } from 'lucide-react';

const AnimatedNumber = ({ value, suffix }: { value: number; suffix: string }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "0px 0px -50px 0px" });

  useEffect(() => {
    if (isInView && nodeRef.current) {
      const node = nodeRef.current;
      const controls = animate(0, value, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate(v) {
          node.textContent = Math.round(v) + suffix;
        }
      });
      return () => controls.stop();
    }
  }, [value, suffix, isInView]);

  return <span ref={nodeRef}>0{suffix}</span>;
};

export default function Stats({ stats: initialStats }: { stats?: any }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 100, damping: 20 } },
  };

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-16 relative z-10">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {/* Large Main Bento Box */}
        <motion.div variants={itemVariants} className="md:col-span-8 glass-panel rounded-[2.5rem] p-10 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] group-hover:animate-pulse" />
          
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center border border-outline-variant/50">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-on-surface-variant">Performances</h3>
          </div>
          
          <div className="relative z-10">
            <motion.span className="font-heading text-7xl md:text-8xl font-black text-on-background">
              <AnimatedNumber value={initialStats?.taux_reussite ?? 94} suffix="%" />
            </motion.span>
            <p className="text-xl text-on-surface-variant mt-2 font-medium">Taux de réussite des recrutements sur NexusIntern</p>
          </div>
        </motion.div>

        {/* Small Bento Box 1 */}
        <motion.div variants={itemVariants} className="md:col-span-4 glass-panel rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-8">
            <Briefcase className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <span className="font-heading text-5xl font-black text-on-background block mb-1">
              <AnimatedNumber value={initialStats?.offres ?? 1500} suffix="+" />
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Stages Actifs</span>
          </div>
        </motion.div>

        {/* Small Bento Box 2 */}
        <motion.div variants={itemVariants} className="md:col-span-12 glass-panel rounded-[2.5rem] p-10 relative overflow-hidden group flex flex-col md:flex-row items-center justify-between">
          <div className="absolute inset-0 bg-gradient-to-r from-tertiary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="flex items-center gap-6 mb-6 md:mb-0 z-10">
            <div className="w-16 h-16 rounded-3xl bg-tertiary/20 flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform">
              <Building2 className="w-8 h-8 text-tertiary" />
            </div>
            <div>
              <span className="font-heading text-6xl font-black text-on-background block leading-none">
                <AnimatedNumber value={initialStats?.entreprises ?? 300} suffix="+" />
              </span>
              <span className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mt-2 block">Entreprises Vérifiées</span>
            </div>
          </div>

          <div className="z-10 text-right max-w-sm hidden md:block">
            <p className="text-on-surface-variant font-medium">Rejoignez le réseau des entreprises qui façonnent l'avenir des talents de demain.</p>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
