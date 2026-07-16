'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Building2, Star, Trophy, Users, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function TopEntreprises({ entreprises }: { entreprises?: any[] }) {
  // Fallback premium data if none provided
  const defaultCompanies = [
    { nom: 'Apple', logo: 'https://logo.clearbit.com/apple.com', rating: 4.9, employees: '100k+', tag: 'Tech Giant', cover: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
    { nom: 'Thales', logo: 'https://logo.clearbit.com/thalesgroup.com', rating: 4.8, employees: '80k+', tag: 'Aerospace', cover: 'https://images.unsplash.com/photo-1416339442236-8ceb164046f8?auto=format&fit=crop&w=800&q=80' },
    { nom: "L'Oréal", logo: 'https://logo.clearbit.com/loreal.com', rating: 4.7, employees: '85k+', tag: 'Cosmetics', cover: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80' },
    { nom: 'Capgemini', logo: 'https://logo.clearbit.com/capgemini.com', rating: 4.6, employees: '300k+', tag: 'Consulting', cover: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80' },
    { nom: 'Dassault', logo: 'https://logo.clearbit.com/3ds.com', rating: 4.8, employees: '20k+', tag: 'Aviation', cover: 'https://images.unsplash.com/photo-1431576901776-e539bd916ba2?auto=format&fit=crop&w=800&q=80' },
    { nom: 'Ubisoft', logo: 'https://logo.clearbit.com/ubisoft.com', rating: 4.5, employees: '20k+', tag: 'Gaming', cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80' }
  ];

  const fallbackCovers = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1416339442236-8ceb164046f8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1431576901776-e539bd916ba2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
  ];

  const displayData = entreprises && entreprises.length >= 6 
    ? entreprises.slice(0, 6) 
    : defaultCompanies;

  const containerRef = useRef<HTMLElement>(null);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 100, damping: 20 } }
  };

  const getLogoUrl = (logo: string | null) => {
    if (!logo) return null;
    if (logo.startsWith('http') || logo.startsWith('data:')) return logo;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${logo}`;
  };

  return (
    <section ref={containerRef} className="max-w-7xl mx-auto px-6 lg:px-12 py-12 relative z-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary/30 mb-6"
        >
          <Trophy className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">Élite 2026</span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-black text-on-background mb-6 tracking-tight"
        >
          Rejoignez les <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-tertiary to-secondary">Leaders Mondiaux</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-on-surface-variant leading-relaxed"
        >
          Découvrez les entreprises qui recrutent le plus sur notre plateforme. Des environnements de travail sélectionnés avec soin pour votre stage.
        </motion.p>
      </div>

      {/* Premium Bento Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 perspective-[2000px]"
      >
        {displayData.map((company, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            className="group relative h-[420px]"
          >
            {/* Glossy Card with 3D Float */}
            <div className="h-full w-full glass-panel rounded-[2rem] flex flex-col justify-between floating-card-3d spring-interactive overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500 bg-gradient-to-br from-surface-container-high/60 to-background/40 relative">
              
              {/* Cover Photo Background */}
              <div className="absolute top-0 left-0 right-0 h-40 z-0 overflow-hidden">
                <img 
                  src={company.cover || fallbackCovers[idx % fallbackCovers.length]} 
                  alt="Cover" 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
              </div>

              {/* Background Glow */}
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
              
              {/* Card Content Wrapper */}
              <div className="p-6 sm:p-8 flex flex-col justify-between h-full relative z-10 pt-24">
                
                {/* Card Header (Logo & Rating) */}
                <div className="flex justify-between items-end mb-8">
                  <div className="w-20 h-20 rounded-2xl glass-panel bg-white flex items-center justify-center shadow-xl overflow-hidden border-2 border-background group-hover:-translate-y-2 transition-transform duration-500">
                    {getLogoUrl(company.logo) ? (
                      <img src={getLogoUrl(company.logo)!} alt={company.nom} className="w-14 h-14 object-contain" />
                    ) : (
                      <Building2 className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded-full border border-white/5 shadow-lg backdrop-blur-md mb-2">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-on-surface">{company.rating || (4.5 + (idx % 5) * 0.1).toFixed(1)}</span>
                  </div>
                </div>

                {/* Card Info */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-on-surface-variant font-mono uppercase tracking-wider font-semibold">{company.tag || 'Top Employeur'}</span>
                  </div>
                  <h3 className="text-3xl font-heading font-black text-on-background mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary transition-all duration-300">
                    {company.nom}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-on-surface-variant" />
                      <span className="text-sm font-medium text-on-surface-variant">{company.employees || `${10 + (idx * 7) % 40}k+`} collaborateurs</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface-container-high border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary group-hover:shadow-[0_0_20px_-5px_var(--primary)] transition-all duration-300">
                      <ArrowUpRight className="w-5 h-5 text-on-surface-variant group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

    </section>
  );
}
