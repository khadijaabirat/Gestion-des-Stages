'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, Star, Search, Building2, PenTool, MessageSquare, ArrowRight } from 'lucide-react';

export default function ProcessRoadmap() {
  const [activeTab, setActiveTab] = useState<'etudiant' | 'entreprise'>('etudiant');

  const studentSteps = [
    {
      title: "Création du profil",
      description: "Ajouter sa bio, sa filiere, et télécharger son CV en quelques clics.",
      icon: <FileText className="w-10 h-10" />,
      color: "from-primary/20 to-primary-container/20",
      glowColor: "bg-primary",
      iconColor: "text-primary"
    },
    {
      title: "Mise en valeur",
      description: "Ajoutez vos compétences et vos expériences pour vous démarquer.",
      icon: <Star className="w-10 h-10" />,
      color: "from-tertiary/20 to-tertiary-container/20",
      glowColor: "bg-tertiary",
      iconColor: "text-tertiary"
    },
    {
      title: "Action",
      description: "Trouvez l'offre idéale et postulez directement en un clic.",
      icon: <Search className="w-10 h-10" />,
      color: "from-secondary/20 to-secondary-container/20",
      glowColor: "bg-secondary",
      iconColor: "text-secondary"
    }
  ];

  const companySteps = [
    {
      title: "Inscription & Validation",
      description: "Créez votre compte entreprise et présentez votre activité en quelques minutes.",
      icon: <Building2 className="w-10 h-10" />,
      color: "from-secondary/20 to-secondary-container/20",
      glowColor: "bg-secondary",
      iconColor: "text-secondary"
    },
    {
      title: "Publication",
      description: "Publiez vos offres de stage pour attirer les meilleurs étudiants.",
      icon: <PenTool className="w-10 h-10" />,
      color: "from-tertiary/20 to-tertiary-container/20",
      glowColor: "bg-tertiary",
      iconColor: "text-tertiary"
    },
    {
      title: "Recrutement",
      description: "Gérez les candidatures, discutez en direct, et signez vos conventions en ligne.",
      icon: <MessageSquare className="w-10 h-10" />,
      color: "from-primary/20 to-primary-container/20",
      glowColor: "bg-primary",
      iconColor: "text-primary"
    }
  ];

  const currentSteps = activeTab === 'etudiant' ? studentSteps : companySteps;

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-16 py-8 relative overflow-hidden">
      {/* Ambient glowing background blobs */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-20 relative z-10"
      >
        <h2 className="font-heading text-4xl md:text-6xl text-on-background mb-10 font-black tracking-tight">
          Comment ça <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">marche ?</span>
        </h2>
        
        {/* Magic Tabs Switch */}
        <div className="relative inline-flex bg-surface/50 p-2 rounded-[2rem] border border-outline-variant/30 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => setActiveTab('etudiant')}
            className={`relative flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-sm md:text-base font-bold transition-colors duration-500 z-10 ${
              activeTab === 'etudiant' ? 'text-white' : 'text-on-surface hover:text-primary'
            }`}
          >
            {activeTab === 'etudiant' && (
              <motion.div 
                layoutId="magicTabBubble"
                className="absolute inset-0 bg-primary rounded-[1.5rem] -z-10 shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)]"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            )}
            <User className="w-5 h-5" />
            Côté Étudiant
          </button>
          
          <button
            onClick={() => setActiveTab('entreprise')}
            className={`relative flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-sm md:text-base font-bold transition-colors duration-500 z-10 ${
              activeTab === 'entreprise' ? 'text-white' : 'text-on-surface hover:text-secondary'
            }`}
          >
            {activeTab === 'entreprise' && (
              <motion.div 
                layoutId="magicTabBubble"
                className="absolute inset-0 bg-secondary rounded-[1.5rem] -z-10 shadow-[0_0_30px_rgba(var(--secondary-rgb),0.4)]"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            )}
            <Building2 className="w-5 h-5" />
            Côté Entreprise
          </button>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto" style={{ perspective: "1200px" }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
          {/* Animated Timeline connecting line */}
          <div className="hidden md:block absolute top-[4rem] left-32 right-32 h-1 bg-outline-variant/20 -translate-y-1/2 z-0 overflow-hidden rounded-full">
            <motion.div 
              key={`line-${activeTab}`}
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className={`w-full h-full bg-gradient-to-r from-transparent via-current to-transparent ${activeTab === 'etudiant' ? 'text-primary' : 'text-secondary'}`}
              style={{ opacity: 0.5 }}
            />
          </div>

          <AnimatePresence mode="wait">
            {currentSteps.map((step, index) => (
              <motion.div
                key={`${activeTab}-${index}`}
                initial={{ opacity: 0, y: 60, rotateX: -15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                exit={{ opacity: 0, y: -60, rotateX: 15, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 250, damping: 25, delay: index * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                {/* Floating 3D Icon Container */}
                <motion.div 
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 4 + index * 0.5, ease: "easeInOut" }}
                  className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center bg-gradient-to-br ${step.color} ${step.iconColor} mb-10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] backdrop-blur-2xl border border-white/20 relative z-20 group-hover:border-white/50 transition-colors duration-500`}
                >
                  <div className={`absolute inset-0 rounded-[2.5rem] ${step.glowColor} opacity-20 blur-2xl group-hover:opacity-50 transition-opacity duration-500`} />
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: index % 2 === 0 ? 12 : -12 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {step.icon}
                  </motion.div>
                </motion.div>
                
                {/* Premium Glass Card */}
                <div className="glass-panel w-full p-8 md:p-10 rounded-[2rem] relative overflow-hidden group-hover:shadow-[0_20px_40px_rgba(255,126,95,0.15)] group-hover:-translate-y-2 transition-all duration-500 border border-outline-variant/30">
                  <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${step.iconColor}`} />
                  
                  <div className="flex flex-col items-center">
                    <span className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-sm font-bold font-mono mb-6 text-on-surface shadow-inner">
                      0{index + 1}
                    </span>
                    <h3 className="font-heading text-2xl font-black mb-4 text-on-background">
                      {step.title}
                    </h3>
                    <p className="text-base text-on-surface-variant font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Arrow to next step (visible on mobile only) */}
                {index < 2 && (
                  <div className="md:hidden mt-8 mb-4 text-outline-variant">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
