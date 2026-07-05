'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { toast } from 'react-hot-toast';

import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function EntrepriseDashboardContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const [showSpeedDial, setShowSpeedDial] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch('/entreprise/stats');
        if (res.ok) {
          const json = await res.json();
          setStats(json.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setMousePosition({ x: e.clientX, y: e.clientY });
      setCursorGlowOpacity(1);
    };
    const handleMouseLeave = () => setCursorGlowOpacity(0);
    const handleScroll = () => setScrollY(window.scrollY);

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
    }
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mouseX, mouseY]);

  const totalCandidats = stats?.total_candidatures || 0;
  const candidaturesAcceptees = stats?.candidatures_acceptees || 0;
  const entretiensCount = stats?.candidatures_en_attente || 0;
  const conversionRate = totalCandidats > 0 ? Math.round((candidaturesAcceptees / totalCandidats) * 100) : 0;

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-background text-on-background">
      {/* Reactive Animated Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(165,59,34, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(165,59,34, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: `${mousePosition.x / 10}px ${mousePosition.y / 10}px`,
          transition: 'background-position 0.2s ease-out'
        }}
      />

      {/* Zellige Pattern Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 100% 150%, var(--tw-colors-primary-container) 24%, transparent 24%),
            radial-gradient(circle at 0% 150%, var(--tw-colors-secondary-container) 24%, transparent 24%),
            radial-gradient(circle at 50% 100%, var(--tw-colors-surface-container) 10%, transparent 10%)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 30px 0, 15px 30px'
        }}
      />

      {/* Dynamic Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-500 mix-blend-multiply"
        style={{
          opacity: cursorGlowOpacity,
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,126,95, 0.08) 0%, transparent 60%)`
        }}
      />

      {/* Mobile Top Header (Fallback for consistency) */}
      <div className="md:hidden flex justify-between items-center p-4 bg-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/20">
        <h2 className="font-heading text-primary font-bold text-xl">Espace Entreprise</h2>
        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden">
          <img alt="Avatar" className="w-full h-full object-cover" src="https://ui-avatars.com/api/?name=Ent&background=random&color=fff" />
        </div>
      </div>

      <main className="w-full p-4 md:p-10 min-h-screen relative z-10 flex flex-col gap-6 pb-24 md:pb-10 max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4"
        >
          <div>
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-on-background tracking-tighter">Vue d&apos;ensemble</h2>
            <p className="font-body-base text-on-surface-variant mt-2">Bienvenue, suivez les performances de vos offres de stage.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64 group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
              <input 
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-outline-variant/50 bg-surface-container-lowest focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm transition-all shadow-sm focus:shadow-md outline-none" 
                placeholder="Rechercher candidats, offres..." 
                type="text" 
              />
            </div>
          </div>
        </motion.header>

        {/* Validation Banner 2026-Premium */}
        <AnimatePresence>
          {stats && stats.est_valide === false && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
              className="relative w-full overflow-hidden rounded-3xl p-6 md:p-8 backdrop-blur-2xl border border-white/60 shadow-[0_15px_40px_-10px_rgba(234,88,12,0.3)] group"
            >
              {/* Dynamic Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-red-500/10 to-orange-600/20 opacity-80 z-0"></div>
              
              {/* Animated Light Sweep */}
              <motion.div 
                animate={{ x: ['-100%', '200%'] }} 
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] z-0"
              />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                {/* 3D Animated Warning Icon */}
                <motion.div 
                  animate={{ 
                    y: [0, -10, 0],
                    rotateZ: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-400 flex items-center justify-center shadow-[0_10px_30px_rgba(234,88,12,0.5)] border-4 border-white/50 shrink-0"
                >
                  <span className="material-symbols-outlined text-white text-[48px] drop-shadow-md">
                    admin_panel_settings
                  </span>
                </motion.div>

                {/* Text Content */}
                <div className="flex-1 text-center md:text-left">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white/40 border border-white/60 rounded-full text-orange-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                    Validation requise
                  </motion.div>
                  
                  <h3 className="text-2xl md:text-3xl font-heading font-extrabold text-on-surface mb-2 tracking-tight">
                    Compte en cours d&apos;examen par l&apos;administration
                  </h3>
                  
                  <p className="text-on-surface-variant font-medium md:text-lg max-w-3xl leading-relaxed">
                    Votre profil entreprise est actuellement soumis à la vérification de notre équipe. 
                    Afin de garantir un écosystème de qualité, certaines actions (comme la <strong className="text-orange-600">publication de nouvelles offres</strong>) 
                    sont temporairement restreintes jusqu&apos;à la validation de votre RC et ICE.
                  </p>
                </div>

                {/* Call to Action Button */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                  className="shrink-0 mt-4 md:mt-0"
                >
                  <Link href="/entreprise/profile">
                    <motion.button 
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(234, 88, 12, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white/80 hover:bg-white text-orange-600 font-bold px-6 py-3 rounded-2xl shadow-lg border border-white transition-all flex items-center gap-2 group/btn"
                    >
                      Compléter mon profil
                      <span className="material-symbols-outlined text-lg group-hover/btn:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Performances & Stats (Left Top) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="md:col-span-8 bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/80 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-bold text-on-surface">Performances des Offres</h3>
              <button className="text-primary hover:text-primary/80 font-label-caps text-xs font-bold transition-colors">Rapports PDF</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface-container-low/80 rounded-xl p-5 border border-white/80 transition-all hover:bg-surface-container hover:shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">visibility</span>
                  <span className="font-body-sm text-on-surface-variant font-medium">Offres Publiées</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="font-heading text-3xl font-extrabold text-on-background tracking-tight">{stats?.offres_publiees || 0}</span>
                  <span className="text-green-600 font-label-caps text-[11px] font-bold mb-1.5">Actives</span>
                </div>
              </div>
              <div className="bg-surface-container-low/80 rounded-xl p-5 border border-white/80 transition-all hover:bg-surface-container hover:shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">how_to_reg</span>
                  <span className="font-body-sm text-on-surface-variant font-medium">Candidats</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="font-heading text-3xl font-extrabold text-on-background tracking-tight">{totalCandidats}</span>
                  <span className="text-green-600 font-label-caps text-[11px] font-bold mb-1.5">Total</span>
                </div>
              </div>
              <div className="bg-surface-container-low/80 rounded-xl p-5 border border-white/80 transition-all hover:bg-surface-container hover:shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">rocket_launch</span>
                  <span className="font-body-sm text-on-surface-variant font-medium">Acceptés</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="font-heading text-3xl font-extrabold text-on-background tracking-tight">{conversionRate}%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recruitment Funnel (Right Top) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="md:col-span-4 bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/80 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] hover:-translate-y-1 transition-transform duration-300 flex flex-col"
          >
            <h3 className="font-heading text-xl font-bold text-on-surface mb-6">Entonnoir de Recrutement</h3>
            <div className="flex flex-col gap-2 flex-grow justify-center">
              <div className="h-12 bg-primary/20 flex items-center justify-between px-6 text-on-surface font-label-caps text-[11px] font-bold" style={{ width: '100%', clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%)' }}>
                <span>VUES (ESTIMÉ)</span>
                <span>{stats?.offres_publiees ? stats.offres_publiees * 150 : 0}</span>
              </div>
              <div className="h-12 bg-primary/40 flex items-center justify-between px-6 text-on-surface font-label-caps text-[11px] font-bold" style={{ width: '90%', marginLeft: '5%', clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)' }}>
                <span>CANDIDATS</span>
                <span>{totalCandidats}</span>
              </div>
              <div className="h-12 bg-primary/60 flex items-center justify-between px-6 text-on-surface font-label-caps text-[11px] font-bold" style={{ width: '70%', marginLeft: '15%', clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)' }}>
                <span>EN ATTENTE</span>
                <span>{entretiensCount}</span>
              </div>
              <div className="h-12 bg-primary flex items-center justify-between px-6 text-white font-label-caps text-[11px] font-bold" style={{ width: '50%', marginLeft: '25%', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 10% 50%)' }}>
                <span>ACCEPTÉS</span>
                <span>{candidaturesAcceptees}</span>
              </div>
            </div>
          </motion.div>

          {/* Talent Pool Insights (Left Bottom) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="md:col-span-7 bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/80 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-heading text-xl font-bold text-on-surface">Talent Pool Insights</h3>
                <p className="font-body-sm text-sm text-on-surface-variant">Démographie des candidats par domaine</p>
              </div>
              <div className="flex gap-2 items-center">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-[10px] font-label-caps font-bold">Ingénierie</span>
                <span className="w-3 h-3 rounded-full bg-secondary ml-2"></span>
                <span className="text-[10px] font-label-caps font-bold">Design</span>
              </div>
            </div>
            <div className="flex items-end justify-between h-48 pt-8 gap-4 px-2">
              {[
                { label: 'Ecoles A', p: '80%', s: '40%' },
                { label: 'Ecoles B', p: '60%', s: '90%' },
                { label: 'Ecoles C', p: '45%', s: '30%' },
                { label: 'Ecoles D', p: '95%', s: '20%' },
              ].map((col, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 gap-2 h-full">
                  <div className="w-full flex gap-1.5 items-end h-full">
                    <motion.div initial={{ height: 0 }} animate={{ height: col.p }} transition={{ duration: 1, delay: 0.5 }} className="flex-1 bg-primary/80 rounded-t-lg" />
                    <motion.div initial={{ height: 0 }} animate={{ height: col.s }} transition={{ duration: 1, delay: 0.7 }} className="flex-1 bg-secondary/80 rounded-t-lg" />
                  </div>
                  <span className="font-label-caps text-[10px] font-bold text-on-surface-variant">{col.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Urgent Alerts (Right Bottom) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="md:col-span-5 bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/80 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] hover:-translate-y-1 transition-transform duration-300 flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-xl font-bold text-on-surface">Alertes & Nouveautés</h3>
              <Link href="/entreprise/candidates" className="text-primary hover:text-primary/80 font-label-caps text-xs font-bold transition-colors">Voir tout</Link>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[250px] pr-2">
              {stats?.est_valide === false && (
                <div className="bg-error-container/40 border border-error/20 rounded-xl p-4 flex gap-4 items-start shadow-[0_0_15px_rgba(186,26,26,0.1)] animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-error text-[20px]">priority_high</span>
                  </div>
                  <div>
                    <p className="font-label-caps text-xs font-bold text-error uppercase tracking-wider">Action requise</p>
                    <p className="font-body-sm text-sm text-on-surface-variant mt-1 leading-snug">Votre compte n&apos;est pas validé. Patientez ou contactez l&apos;admin.</p>
                  </div>
                </div>
              )}
              
              {stats?.recent_candidatures?.map((c: any) => (
                <div key={c.id} className="bg-surface-container-high/50 rounded-xl p-4 flex gap-4 items-start border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-[20px]">person_add</span>
                  </div>
                  <div>
                    <p className="font-label-caps text-xs font-bold text-on-surface uppercase tracking-wider">Nouvelle Candidature</p>
                    <p className="font-body-sm text-sm text-on-surface-variant mt-1 leading-snug">{c.etudiant?.nom} a postulé pour l&apos;offre &quot;{c.offre_stage?.titre}&quot;.</p>
                    <Link href={`/entreprise/candidates`} className="mt-2 inline-block text-secondary font-bold text-[12px] hover:underline transition-all">Voir la candidature →</Link>
                  </div>
                </div>
              ))}

              {!stats?.recent_candidatures?.length && (
                <p className="text-sm text-on-surface-variant italic">Aucune alerte récente.</p>
              )}
            </div>
          </motion.div>

        </div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-outline-variant/30 text-on-surface-variant text-sm font-medium"
        >
          <p>© 2026 NexusIntern. L&apos;Avenir du Travail.</p>
          <div className="flex gap-4">
            <a className="hover:text-secondary transition-colors" href="#">Confidentialité</a>
            <a className="hover:text-secondary transition-colors" href="#">Conditions</a>
            <a className="hover:text-secondary transition-colors" href="#">Aide</a>
          </div>
        </motion.footer>
      </main>

      {/* Floating Speed Dial */}
      <div 
        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 z-[60]"
        onMouseEnter={() => setShowSpeedDial(true)}
        onMouseLeave={() => setShowSpeedDial(false)}
      >
        <AnimatePresence>
          {showSpeedDial && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-16 right-0 flex flex-col gap-3 items-end mb-2"
            >
              <Link href="/entreprise/candidates" className="flex items-center gap-3 bg-white shadow-xl px-4 py-2.5 rounded-full border border-outline-variant/30 hover:bg-primary hover:text-white transition-colors group">
                <span className="font-label-caps text-[12px] font-bold">Candidats</span>
                <span className="material-symbols-outlined text-[18px]">group</span>
              </Link>
              <Link href="/entreprise/messages" className="flex items-center gap-3 bg-white shadow-xl px-4 py-2.5 rounded-full border border-outline-variant/30 hover:bg-primary hover:text-white transition-colors group">
                <span className="font-label-caps text-[12px] font-bold">Messagerie</span>
                <span className="material-symbols-outlined text-[18px]">chat</span>
              </Link>
              <button 
                className={`flex items-center gap-3 shadow-xl px-4 py-2.5 rounded-full transition-colors ${stats?.est_valide === false ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'}`}
                disabled={stats?.est_valide === false}
                onClick={(e) => {
                  if (stats?.est_valide === false) {
                    e.preventDefault();
                    toast.error("Vous devez être validé pour publier une offre.");
                  } else {
                    window.location.href = '/entreprise/offers';
                  }
                }}
              >
                <span className="font-label-caps text-[12px] font-bold">Publier une offre</span>
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-14 h-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center transition-transform duration-300 ${showSpeedDial ? 'rotate-45' : ''}`}
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </motion.button>
      </div>

    </div>
  );
}
