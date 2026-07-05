'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence, useMotionValue } from 'framer-motion';



import Link from 'next/link';
import { notFound } from 'next/navigation';

// Mock Data Types
interface OfferDetail {
  id: string;
  title: string;
  company: {
    name: string;
    logo: string;
    description: string;
    website: string;
    employeeCount: string;
  };
  location: string;
  type: string; // Hybride, Remote, On-site
  duration: string;
  startDate: string;
  salary: string;
  postedAt: string;
  tags: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  tools: string[];
  status: 'open' | 'closed';
  applied: boolean;
  saved: boolean;
}

// Mock Fetch
const fetchOffer = async (id: string): Promise<OfferDetail> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 'not-found') reject(new Error('Not found'));
      resolve({
        id,
        title: 'Product Designer UI/UX (Stage)',
        company: {
          name: 'TechFlow Solutions',
          logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANHDBqExSVVAQGs1-moTqaKyrqbyG6FuuUmWV-zbmm3FvJ7dIdUPNAM7hW714mPI7FmZaq2PlaHtAZn6q_OQToUavccfj9EHti9U0-hOuH-fKkCcN3NgIuf_EfZHyl3Cz_FQ8-6AdxgoH965seCCwh2V_KoqwJJy8mpT2TLdeXQXjm9oX9IehW6Rsj2UBq0QFvpIN4w7EFUC7ZXmbQB8qSHFgHb0swad9JFii_J3Eobd3uzhQC2QZULucySfTzO3UJeA8kNJ2w1CY', // mock placeholder
          description: "TechFlow est une startup SaaS en hyper-croissance qui redéfinit l'espace de travail collaboratif pour les équipes produit.",
          website: 'https://techflow.example.com',
          employeeCount: '50-200'
        },
        location: 'Paris, France',
        type: 'Hybride (3j/semaine)',
        duration: '6 mois',
        startDate: 'Septembre 2026',
        salary: '1200â‚¬ - 1500â‚¬ / mois',
        postedAt: '2026-06-08T10:00:00Z',
        tags: ['Design', 'SaaS', 'B2B', 'Figma'],
        description: "Nous recherchons un(e) Product Designer talentueux(se) et passionné(e) pour rejoindre notre équipe design. Vous travaillerez directement avec le Head of Design et les Product Managers pour concevoir des expériences utilisateur exceptionnelles sur notre plateforme principale.",
        responsibilities: [
          "Participer à la recherche utilisateur et analyser les retours clients",
          "Concevoir des wireframes, des prototypes interactifs et des maquettes haute fidélité",
          "Maintenir et faire évoluer notre Design System (Figma)",
          "Collaborer étroitement avec les développeurs front-end pour assurer la qualité de l'implémentation",
          "Animer des ateliers d'idéation avec les parties prenantes"
        ],
        requirements: [
          "Étudiant(e) en Master (Design, UX/UI, Multimédia ou équivalent)",
          "Excellente maîtrise de Figma",
          "Forte sensibilité à la typographie, l'espacement et la hiérarchie visuelle",
          "Compréhension des contraintes de développement web (HTML/CSS/React)",
          "Portfolio démontrant votre capacité à résoudre des problèmes complexes",
          "Niveau d'anglais professionnel"
        ],
        tools: ['Figma', 'Miro', 'Notion', 'Linear', 'Framer'],
        status: 'open',
        applied: false,
        saved: false
      });
    }, 1500);
  });
};

export default function OfferDetailContent({ offerId }: { offerId: string }) {
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Interaction States
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Toast
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success'|'error'}>({show: false, message: '', type: 'success'});

  // Scroll Progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Cursor Tracking
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const loadOffer = async () => {
      try {
        const data = await fetchOffer(offerId);
        setOffer(data);
        setIsSaved(data.saved);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadOffer();
  }, [offerId]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setMousePosition({ x: e.clientX, y: e.clientY });
      setCursorGlowOpacity(1);
    };
    const handleMouseLeave = () => setCursorGlowOpacity(0);

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleApply = () => {
    setIsApplying(true);
    // Simulate API Delay
    setTimeout(() => {
      setIsApplying(false);
      setApplySuccess(true);
      if (offer) setOffer({ ...offer, applied: true });
      showToast('Candidature envoyée avec succès !', 'success');
    }, 2000);
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
    showToast(isSaved ? 'Offre retirée des favoris' : 'Offre sauvegardée', 'success');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Lien copié dans le presse-papier !', 'success');
  };

  if (error) {
    notFound();
  }

  return (
    <div className="h-full w-full relative bg-background font-sans text-on-surface">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Dynamic Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-500 mix-blend-multiply"
        style={{
          opacity: cursorGlowOpacity,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(165,59,34, 0.06), transparent 70%)`
        }}
      />

      {/* Parallax Background Pattern */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23a53b22' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      
      
      

      <main className="w-full pt-24 md:pt-10 px-4 md:px-10 pb-32 relative z-10 max-w-[1440px] mx-auto">
        
        {/* Navigation Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-on-surface-variant"
        >
          <Link href="/etudiant/opportunities" className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Retour aux offres
          </Link>
        </motion.div>

        {loading ? (
          // Premium Loading Skeleton
          <div className="animate-pulse flex flex-col gap-8">
            <div className="glass-panel p-8 rounded-3xl">
              <div className="flex gap-6 items-start">
                <div className="w-24 h-24 bg-white/80 rounded-2xl"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-white/80 rounded-lg w-1/3"></div>
                  <div className="h-4 bg-white/80 rounded-lg w-1/4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-white/80 rounded-full w-20"></div>
                    <div className="h-6 bg-white/80 rounded-full w-24"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="glass-panel p-8 rounded-3xl h-64 bg-white/80/30"></div>
                <div className="glass-panel p-8 rounded-3xl h-96 bg-white/80/30"></div>
              </div>
              <div className="lg:col-span-4">
                <div className="glass-panel p-8 rounded-3xl h-80 bg-white/80/30"></div>
              </div>
            </div>
          </div>
        ) : offer ? (
          <>
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl p-6 md:p-10 mb-8 relative overflow-hidden group"
            >
              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform duration-1000 group-hover:scale-150" />
              
              <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-2xl shadow-lg border border-outline-variant/30 flex items-center justify-center p-2 flex-shrink-0">
                  <div className="w-full h-full bg-white/80/30 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-primary">domain</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-on-surface tracking-tight">
                      {offer.title}
                    </h1>
                    {offer.applied && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 border border-green-200">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Candidature envoyée
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-on-surface-variant font-medium mb-4">
                    <span className="flex items-center gap-1.5 text-primary">
                      <span className="material-symbols-outlined text-[18px]">business</span>
                      {offer.company.name}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      {offer.location}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">work</span>
                      {offer.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {offer.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/80/50 text-on-surface border border-outline-variant/30 rounded-lg text-sm font-semibold tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex md:flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyLink}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-outline-variant/30 text-on-surface hover:text-primary hover:border-primary/50 shadow-sm transition-colors"
                    title="Partager"
                  >
                    <span className="material-symbols-outlined">share</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleSave}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-outline-variant/30 shadow-sm transition-colors
                      ${isSaved ? 'text-secondary border-secondary/50 bg-secondary/5' : 'text-on-surface hover:text-secondary'}`}
                    title={isSaved ? 'Retirer des favoris' : 'Sauvegarder'}
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>
                      bookmark
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Main Content Area */}
              <div className="xl:col-span-8 flex flex-col gap-8">
                
                {/* Specs Grid */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  <div className="glass-panel p-5 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-secondary mb-2 text-3xl">schedule</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Durée</span>
                    <span className="font-semibold text-on-surface">{offer.duration}</span>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-primary mb-2 text-3xl">event</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Début</span>
                    <span className="font-semibold text-on-surface">{offer.startDate}</span>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-tertiary mb-2 text-3xl">payments</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Rémunération</span>
                    <span className="font-semibold text-on-surface">{offer.salary}</span>
                  </div>
                  <div className="glass-panel p-5 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-error mb-2 text-3xl">update</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Publié le</span>
                    <span className="font-semibold text-on-surface">{new Date(offer.postedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </motion.div>

                {/* Description */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-panel p-8 rounded-3xl"
                >
                  <h2 className="text-2xl font-bold font-heading text-on-surface mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    Description du poste
                  </h2>
                  <p className="text-on-surface-variant leading-relaxed text-lg mb-8">
                    {offer.description}
                  </p>

                  <h3 className="text-xl font-bold font-heading text-on-surface mt-8 mb-4">Vos responsabilités</h3>
                  <ul className="space-y-3 mb-8">
                    {offer.responsibilities.map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-secondary shrink-0 mt-0.5">check_circle</span>
                        <span className="text-on-surface-variant leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-xl font-bold font-heading text-on-surface mt-8 mb-4">Profil recherché</h3>
                  <ul className="space-y-3 mb-8">
                    {offer.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">person_check</span>
                        <span className="text-on-surface-variant leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-xl font-bold font-heading text-on-surface mt-8 mb-4">Stack technique / Outils</h3>
                  <div className="flex flex-wrap gap-3">
                    {offer.tools.map((tool, i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant/30 rounded-xl shadow-sm text-on-surface font-semibold">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">build</span>
                        {tool}
                      </div>
                    ))}
                  </div>
                </motion.div>

              </div>

              {/* Sticky Sidebar */}
              <div className="xl:col-span-4 relative">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="sticky top-24 flex flex-col gap-6"
                >
                  {/* Action Card */}
                  <div className="glass-panel p-8 rounded-3xl shadow-[0_16px_48px_rgba(165,59,34,0.08)]">
                    <h3 className="font-heading font-bold text-xl mb-6 text-on-surface">Prêt(e) à postuler ?</h3>
                    
                    <div className="mb-6 p-4 bg-white/80/30 rounded-2xl border border-outline-variant/20 flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">CV Actuel</p>
                        <p className="text-sm font-semibold text-on-surface truncate pr-2">Alexia_Dupont_Marketing.pdf</p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={(!isApplying && !offer.applied) ? { scale: 1.02, y: -2 } : {}}
                      whileTap={(!isApplying && !offer.applied) ? { scale: 0.98 } : {}}
                      onClick={handleApply}
                      disabled={isApplying || offer.applied}
                      className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden group
                        ${offer.applied 
                          ? 'bg-green-100 text-green-800 border border-green-200 cursor-not-allowed' 
                          : 'bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30'
                        }
                      `}
                    >
                      {isApplying ? (
                        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="material-symbols-outlined">
                          sync
                        </motion.span>
                      ) : offer.applied ? (
                        <span className="material-symbols-outlined">check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined">send</span>
                      )}
                      
                      {isApplying ? 'Envoi en cours...' : offer.applied ? 'Candidature envoyée' : 'Postuler maintenant'}
                      
                      {!isApplying && !offer.applied && (
                        <motion.div
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                      )}
                    </motion.button>
                  </div>

                  {/* Company Card */}
                  <div className="glass-panel p-8 rounded-3xl">
                    <h3 className="font-heading font-bold text-xl mb-6 text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">business</span>
                      À propos de l&apos;entreprise
                    </h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-white border border-outline-variant/30 rounded-xl flex items-center justify-center p-2">
                        <span className="material-symbols-outlined text-3xl text-primary">domain</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-on-surface">{offer.company.name}</h4>
                        <a href={offer.company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                          Visiter le site
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </a>
                      </div>
                    </div>
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                      {offer.company.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant bg-white/80/30 p-3 rounded-xl">
                      <span className="material-symbols-outlined text-secondary">group</span>
                      Taille: {offer.company.employeeCount} employés
                    </div>
                  </div>

                </motion.div>
              </div>

            </div>
          </>
        ) : null}
      </main>

      {/* Global Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-xl ${
              toast.type === 'error' 
                ? 'bg-error-container/90 border-error/20 text-on-error-container' 
                : 'bg-green-50/90 border-green-200 text-green-800'
            }`}
          >
            <span className="material-symbols-outlined">
              {toast.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <p className="font-bold">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

