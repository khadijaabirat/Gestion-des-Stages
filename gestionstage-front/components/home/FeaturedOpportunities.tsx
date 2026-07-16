'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Zap, Building2, MapPin, Clock } from 'lucide-react';

const FALLBACK_BGS = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
];

const COLORS = ['FF7E5F', '5644D0', '00C9FF', '92FE9D', 'F5576C', '4FACFE'];

export default function FeaturedOpportunities({ offres: dynamicOffres }: { offres?: any[] }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-16 relative">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4"
      >
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-primary uppercase">Flux en Direct</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl text-on-background mb-3 font-black tracking-tight">Opportunités <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Exclusives</span></h2>
          <p className="text-lg text-on-surface-variant max-w-xl">Découvrez les meilleures offres de stage du moment et postulez en un clic.</p>
        </motion.div>
        
        <Link href="/offres">
          <motion.button
            variants={itemVariants}
            className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full border-2 border-outline-variant/30 text-on-surface font-bold text-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explorer toutes les offres
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </Link>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {dynamicOffres && dynamicOffres.length > 0 ? (
          dynamicOffres.slice(0, 6).map((offre, index) => {
            let colSpan = "md:col-span-4";
            if (index === 0 || index === 5) colSpan = "md:col-span-8";
            const isLarge = index === 0 || index === 5;

            const fallbackBg = FALLBACK_BGS[index % FALLBACK_BGS.length];
            const fallbackColor = COLORS[index % COLORS.length];
            const logoUrl = offre.logo ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${offre.logo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(offre.entreprise || 'E')}&background=${fallbackColor}&color=fff&size=128&bold=true`;

            return isLarge ? (
              <motion.div
                key={offre.id}
                variants={itemVariants}
                className={`${colSpan} glass-panel rounded-[2rem] overflow-hidden group relative cursor-pointer min-h-[360px] shadow-lg hover:shadow-2xl transition-shadow duration-500`}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Link href={`/offres/${offre.id}`} className="block w-full h-full relative">
                  <Image
                    src={fallbackBg}
                    alt={offre.entreprise || 'Entreprise'}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-6 right-6 z-10 flex gap-2">
                    {offre.tags?.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-mono font-bold text-white shadow-sm border border-white/20">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="absolute top-6 left-6 z-10 w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-white/10 backdrop-blur-md">
                     <img src={logoUrl} alt={offre.entreprise} className="w-full h-full object-cover" />
                  </div>

                  <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end z-10">
                    <motion.div className="text-white w-full">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider mb-4 border border-white/20 shadow-lg">
                        <Zap className="w-3 h-3 text-white" /> Live
                      </div>
                      <h3 className="font-heading text-3xl font-black leading-tight mb-4 drop-shadow-md">{offre.titre}</h3>
                      <div className="flex flex-wrap items-center gap-5 text-sm font-medium opacity-90">
                        <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {offre.entreprise}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {offre.localisation || 'Remote'}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {offre.duree || 'Non spécifiée'}</span>
                      </div>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key={offre.id}
                variants={itemVariants}
                className={`${colSpan} glass-panel rounded-[2rem] p-0 flex flex-col justify-between cursor-pointer min-h-[360px] group relative overflow-hidden transition-all duration-500 hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(var(--primary-rgb),0.1)] bg-surface-container-lowest`}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Link href={`/offres/${offre.id}`} className="flex flex-col h-full relative z-10 w-full">
                  {/* Top Image Half */}
                  <div className="relative w-full h-40 overflow-hidden">
                    <Image
                      src={fallbackBg}
                      alt={offre.entreprise || 'Entreprise'}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                      {offre.tags?.slice(0, 2).map((tag: string, i: number) => (
                        <span key={i} className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Logo hovering over the edge */}
                    <div className="absolute -bottom-5 left-6 w-14 h-14 rounded-xl border-4 border-background flex items-center justify-center overflow-hidden bg-white shadow-xl z-20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <img src={logoUrl} alt={offre.entreprise} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Content Half */}
                  <div className="p-6 pt-8 flex-grow flex flex-col justify-between relative z-10">
                    <h3 className="font-heading text-xl font-bold text-on-background mb-4 leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {offre.titre}
                    </h3>
                    <div className="space-y-2.5 text-sm text-on-surface-variant font-medium mt-auto">
                      <p className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary/60" /> {offre.entreprise}</p>
                      <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary/60" /> {offre.localisation || 'À distance'}</p>
                      <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary/60" /> {offre.duree || 'Non spécifiée'}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-12 text-center py-20 glass-panel rounded-[2rem]">
            <p className="text-on-surface-variant font-mono font-bold">Aucune offre à la une pour le moment.</p>
          </div>
        )}
      </motion.div>

      <motion.div className="mt-10 flex justify-center md:hidden" variants={itemVariants}>
        <Link href="/offres">
          <button className="text-white font-bold text-sm items-center gap-2 px-8 py-4 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all flex active:scale-95">
            Explorer toutes les offres
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </motion.div>
    </section>
  );
}
