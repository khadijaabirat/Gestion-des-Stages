'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';

import Link from 'next/link';

export default function EntrepriseOfferCreateContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [workModel, setWorkModel] = useState('Hybride'); // Remote, Onsite, Hybrid
  const [contractType, setContractType] = useState('Stage PFE');
  const [salary, setSalary] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  
  // Skills State
  const [currentSkill, setCurrentSkill] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  
  // Apply System
  const [useInternalSystem, setUseInternalSystem] = useState(true);
  const [externalLink, setExternalLink] = useState('');

  const [isPublishing, setIsPublishing] = useState(false);
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success'|'error'}>({show: false, message: '', type: 'success'});

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [description]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = currentSkill.trim();
      if (val && !skills.includes(val)) {
        setSkills([...skills, val]);
      }
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const publierOffre = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (skills.length === 0) {
      showToast('Veuillez ajouter au moins une compétence requise.', 'error');
      return;
    }
    if (!useInternalSystem && !externalLink.includes('http')) {
      showToast('Lien de candidature externe invalide.', 'error');
      return;
    }

    setIsPublishing(true);
    
    // Simulating API call
    setTimeout(() => {
      setIsPublishing(false);
      showToast('L\'offre a été publiée avec succès !', 'success');
      
      // Reset form
      setTitle('');
      setLocation('');
      setSalary('');
      setDeadline('');
      setDescription('');
      setSkills([]);
      setExternalLink('');
      // In a real app, we might redirect to /entreprise/offers here
    }, 1500);
  };

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-background text-on-background pb-24 md:pb-10">
      {/* Background Pattern */}
      <motion.div
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
      
      {/* Dynamic Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-500 mix-blend-multiply"
        style={{
          opacity: cursorGlowOpacity,
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,126,95, 0.08) 0%, transparent 60%)`
        }}
      />

      

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center p-4 bg-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/20 gap-4">
        <Link href="/entreprise/offers" className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <h2 className="font-heading text-primary font-bold text-xl">Créer une offre</h2>
      </div>

      <main className="w-full p-4 md:p-10 relative z-10 flex flex-col max-w-[1000px] mx-auto">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 hidden md:block"
        >
          <Link href="/entreprise/offers" className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors mb-4">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Retour aux offres
          </Link>
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-on-background tracking-tighter">Créer une offre</h1>
          <p className="font-body-base text-on-surface-variant mt-2 max-w-xl">
            Rédigez une annonce claire et attractive pour trouver le talent idéal pour votre équipe.
          </p>
        </motion.header>

        {/* Form Container */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={publierOffre}
          className="flex flex-col gap-8"
        >
          
          {/* Section 1: Informations Principales */}
          <section className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] rounded-3xl p-6 md:p-8">
            <h3 className="font-heading text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">feed</span>
              Informations Principales
            </h3>
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Titre de l&apos;offre *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    autoFocus
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Développeur Fullstack React / Node.js"
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm focus:shadow-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Type de contrat *</label>
                  <div className="relative">
                    <select 
                      value={contractType}
                      onChange={(e) => setContractType(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm focus:shadow-md appearance-none cursor-pointer font-semibold text-on-surface"
                    >
                      <option value="Stage PFE">Stage PFE</option>
                      <option value="Stage d'Observation">Stage d&apos;Observation</option>
                      <option value="Alternance">Alternance</option>
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Modèle de travail *</label>
                  <div className="relative">
                    <select 
                      value={workModel}
                      onChange={(e) => setWorkModel(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm focus:shadow-md appearance-none cursor-pointer font-semibold text-on-surface"
                    >
                      <option value="Présentiel">Présentiel</option>
                      <option value="Hybride">Hybride</option>
                      <option value="Télétravail total">Télétravail total</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Localisation *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">location_on</span>
                    <input 
                      type="text" 
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: Paris, France"
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm focus:shadow-md"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Rémunération (Optionnel)</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">payments</span>
                    <input 
                      type="text" 
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="Ex: 1000â‚¬ - 1200â‚¬ / mois"
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm focus:shadow-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Compétences & Détails */}
          <section className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] rounded-3xl p-6 md:p-8">
            <h3 className="font-heading text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">psychology</span>
              Détails & Compétences
            </h3>

            <div className="space-y-6">
              <div className="group">
                <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Compétences requises *</label>
                <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all shadow-sm flex flex-wrap gap-2 items-center min-h-[52px]">
                  <AnimatePresence>
                    {skills.map(skill => (
                      <motion.span 
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, width: 0 }}
                        className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 border border-primary/20"
                      >
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors flex items-center">
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  <input 
                    type="text" 
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder={skills.length === 0 ? "Tapez une compétence puis appuyez sur Entrée..." : "Ajouter..."}
                    className="flex-1 bg-transparent min-w-[150px] outline-none text-sm placeholder:text-on-surface-variant/50"
                  />
                </div>
                <p className="text-xs text-on-surface-variant mt-2">Appuyez sur Entrée ou sur virgule pour ajouter une compétence.</p>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Description du poste *</label>
                <textarea 
                  ref={textareaRef}
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez les missions, le profil recherché et les avantages..."
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm focus:shadow-md resize-none overflow-hidden min-h-[150px]"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Modalités de Candidature */}
          <section className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] rounded-3xl p-6 md:p-8">
            <h3 className="font-heading text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">settings</span>
              Modalités de Candidature
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Date limite de candidature *</label>
                <div className="relative">
                  <input 
                    type="date" 
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm focus:shadow-md"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center mt-2 md:mt-0">
                <label className="block text-sm font-bold text-on-surface mb-3 font-label-caps">Mode de réception</label>
                
                <label className="relative flex items-center gap-3 cursor-pointer mb-3 group/radio">
                  <input type="radio" className="sr-only" checked={useInternalSystem} onChange={() => setUseInternalSystem(true)} />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${useInternalSystem ? 'border-primary' : 'border-outline-variant/50 group-hover/radio:border-primary/50'}`}>
                    {useInternalSystem && <motion.div layoutId="radioActive" className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className={`text-sm font-bold ${useInternalSystem ? 'text-on-surface' : 'text-on-surface-variant'}`}>Système interne (NexusIntern)</span>
                </label>
                
                <label className="relative flex items-center gap-3 cursor-pointer group/radio">
                  <input type="radio" className="sr-only" checked={!useInternalSystem} onChange={() => setUseInternalSystem(false)} />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!useInternalSystem ? 'border-primary' : 'border-outline-variant/50 group-hover/radio:border-primary/50'}`}>
                    {!useInternalSystem && <motion.div layoutId="radioActive" className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className={`text-sm font-bold ${!useInternalSystem ? 'text-on-surface' : 'text-on-surface-variant'}`}>Lien externe (ATS)</span>
                </label>
              </div>

              <AnimatePresence>
                {!useInternalSystem && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:col-span-2 group overflow-hidden"
                  >
                    <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps mt-2">Lien externe de candidature *</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">link</span>
                      <input 
                        type="url" 
                        required={!useInternalSystem}
                        value={externalLink}
                        onChange={(e) => setExternalLink(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm focus:shadow-md"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Form Actions (Sticky Bottom) */}
          <div className="mt-4 p-6 md:p-8 bg-surface-container-lowest/80 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-[0_-8px_32px_rgba(165,59,34,0.05)] flex flex-col sm:flex-row justify-end gap-4 sticky bottom-4 z-40">
            <Link 
              href="/entreprise/offers"
              className="py-3.5 px-6 rounded-xl font-bold text-on-surface bg-surface border border-outline-variant/30 hover:bg-surface-container-low transition-colors text-center"
            >
              Annuler
            </Link>
            <motion.button 
              type="submit"
              disabled={isPublishing || !title || !location || !deadline || !description || skills.length === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3.5 px-8 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-tertiary hover:shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPublishing ? (
                <>
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined">
                    sync
                  </motion.span>
                  Publication en cours...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Publier l&apos;offre
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </main>

      {/* Global Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-xl ${
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

