'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { apiFetch } from '@/lib/api';


type CompanyStatus = 'Approuvée' | 'Rejetée' | 'En attente';

interface Company {
  id: string;
  name: string;
  industry: string;
  email: string;
  website: string;
  status: CompanyStatus;
  appliedAt: string;
  description: string;
  logoUrl?: string;
  document_juridique?: string | null;
}

// Helper for consistent avatar colors
const getAvatarColor = (name: string) => {
  const colors = ['bg-primary/20 text-primary', 'bg-tertiary/20 text-tertiary', 'bg-secondary/20 text-secondary', 'bg-green-100 text-green-700', 'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
  return colors[Math.abs(hash) % colors.length];
};

// Build the correct photo URL
const getPhotoUrl = (photo: string | null | undefined): string | null => {
  if (!photo) return null;
  if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
  if (photo.startsWith('/storage/')) return `http://localhost:8000${photo}`;
  return `http://localhost:8000/storage/${photo}`;
};

export default function AdminEntreprisesContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Data State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'Toutes'>('En attente'); // Default to pending
  
  // Action States
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Reject Modal States
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [companyToReject, setCompanyToReject] = useState<Company | null>(null);

  // Toasts
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success'|'error'}>({show: false, message: '', type: 'success'});

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/admin/users?role=entreprise');
      if (response.ok) {
        const data = await response.json();
        const mapped = data.data.data.map((u: any) => ({
          id: u.id.toString(),
          name: u.nom,
          industry: u.description?.replace('Secteur: ', '') || 'Non spécifié',
          email: u.email,
          website: u.site_web || 'Non spécifié',
          status: u.est_valide ? 'Approuvée' : 'En attente', // simplifcation pour correspondre au type (Rejetée est géré différemment)
          appliedAt: u.created_at,
          description: u.description || '',
          logoUrl: u.photo, // Pass raw photo, we will process it in render
          document_juridique: u.document_juridique
        }));
        setCompanies(mapped);
      }
    } catch (e) {
      console.error(e);
      showToast('Erreur lors du chargement des entreprises.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Derived State
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'Toutes' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [companies, searchQuery, statusFilter]);

  // Handlers
  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await apiFetch(`/admin/entreprises/${id}/validate`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'approuver' })
      });
      if (res.ok) {
        setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: 'Approuvée' } : c));
        showToast(`Entreprise approuvée avec succès.`, 'success');
      } else {
        showToast(`Erreur lors de l'approbation.`, 'error');
      }
    } catch (e) {
      showToast(`Erreur de connexion.`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (company: Company) => {
    setCompanyToReject(company);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!companyToReject || rejectReason.trim() === '') {
      showToast('Le motif de rejet est requis.', 'error');
      return;
    }
    setProcessingId(companyToReject.id);
    
    try {
      const res = await apiFetch(`/admin/entreprises/${companyToReject.id}/validate`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'rejeter', raison: rejectReason })
      });
      if (res.ok) {
        setCompanies(prev => prev.filter(c => c.id !== companyToReject.id)); // since it deletes the user
        setShowRejectModal(false);
        setCompanyToReject(null);
        showToast(`Entreprise rejetée.`, 'success');
      } else {
        showToast(`Erreur lors du rejet.`, 'error');
      }
    } catch (e) {
      showToast(`Erreur de connexion.`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // UI Helpers
  const getStatusBadgeColor = (status: CompanyStatus) => {
    switch (status) {
      case 'Approuvée': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Rejetée': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'En attente': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]';
    }
  };

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-surface text-on-surface">
      {/* Background Pattern */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23a53b22' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          transform: `translateY(${scrollY * 0.05}px)`,
        }}
      />

      {/* Dynamic Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-500 mix-blend-multiply"
        style={{
          opacity: cursorGlowOpacity,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(165,59,34, 0.08), transparent 70%)`
        }}
      />

      {/* Floating 3D Orbs */}
      <motion.div
        animate={{ y: [0, -40, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="fixed top-1/4 -left-32 w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"
      />
      <motion.div
        animate={{ y: [0, 50, 0], x: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed bottom-10 right-10 w-[40vw] h-[40vw] bg-tertiary/10 rounded-full blur-[120px] pointer-events-none -z-10"
      />

      

      {/* Mobile Top Header */}
      <div className="md:hidden flex justify-between items-center p-4 bg-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/20">
        <h2 className="font-heading text-primary font-bold text-xl">NexusIntern Admin</h2>
        <button className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      <main className="w-full p-4 md:p-10 min-h-screen relative z-10 flex flex-col max-w-[1600px] mx-auto">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-6"
        >
          <div>
            <h1 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tighter text-primary">
              File KYC Entreprises
            </h1>
            <p className="font-body-base text-on-surface-variant mt-2 max-w-xl">
              Gérez les demandes de création de comptes entreprise. Approuvez ou rejetez les dossiers en attente pour garantir la qualité de la plateforme.
            </p>
          </div>
        </motion.header>

        {/* Filters (Sticky) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] rounded-2xl p-4 md:p-6 mb-8 flex flex-col xl:flex-row gap-4 justify-between items-center z-20 sticky top-4 md:top-6"
        >
          <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
            {/* Status Tabs */}
            <div className="flex p-1 bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-x-auto custom-scrollbar flex-shrink-0">
              {['En attente', 'Toutes', 'Approuvée', 'Rejetée'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`relative px-5 py-2.5 rounded-lg text-sm font-bold font-label-caps tracking-wider transition-colors whitespace-nowrap ${
                    statusFilter === status ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {statusFilter === status && (
                    <motion.div
                      layoutId="activeEntStatus"
                      className="absolute inset-0 bg-white shadow-sm rounded-lg"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{status}</span>
                  {status === 'En attente' && companies.filter(c => c.status === 'En attente').length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse z-10"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80 group flex-shrink-0">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                search
              </span>
              <input 
                type="text" 
                placeholder="Rechercher par nom / secteur" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Card Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCompanies.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="col-span-full bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-[0_8px_32px_0_rgba(165,59,34,0.05)]"
              >
                <div className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/50">verified_user</span>
                </div>
                <h3 className="text-2xl font-bold font-heading text-on-surface mb-2">Aucune entreprise trouvée</h3>
                <p className="text-on-surface-variant max-w-md">
                  {searchQuery ? "Aucun résultat pour cette recherche." : "La file d'attente KYC est totalement vide. Beau travail !"}
                </p>
              </motion.div>
            ) : (
              filteredCompanies.map((company, i) => (
                <motion.div
                  key={company.id}
                  layout
                  initial={{ opacity: 0, y: 30, rotateX: 10 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateX: -10, transition: { duration: 0.2 } }}
                  transition={{ delay: i * 0.05, type: 'spring', damping: 20, stiffness: 100 }}
                  className="group relative h-full perspective-1000"
                >
                  <motion.div 
                    whileHover={{ scale: 1.02, rotateY: 2, rotateX: -2, z: 20 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    className="bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] hover:shadow-[0_20px_50px_rgba(165,59,34,0.15)] hover:border-white/80 rounded-[2rem] p-6 flex flex-col h-full transform-style-preserve-3d"
                  >
                    {/* Subtle Background Glow for pending items */}
                    {company.status === 'En attente' && (
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                    )}

                    <div className="flex justify-between items-start mb-5 relative z-10 transform translate-z-10">
                      <div className="flex gap-4 items-center">
                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className={`w-16 h-16 rounded-[1.25rem] overflow-hidden border-2 border-white shadow-md flex items-center justify-center font-bold text-2xl ${!getPhotoUrl(company.logoUrl) ? getAvatarColor(company.name) : 'bg-white'}`}>
                          {getPhotoUrl(company.logoUrl) ? (
                            <img src={getPhotoUrl(company.logoUrl)!} alt={company.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.textContent = company.name.charAt(0).toUpperCase(); }} />
                          ) : (
                            company.name.charAt(0).toUpperCase()
                          )}
                        </motion.div>
                        <div>
                          <h3 className="font-bold font-heading text-xl text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{company.name}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="mb-5 flex items-center gap-2 relative z-10 transform translate-z-10">
                      <span className={`px-4 py-1.5 rounded-xl text-[11px] font-extrabold border flex items-center gap-1.5 uppercase tracking-widest ${getStatusBadgeColor(company.status)}`}>
                        {company.status === 'Approuvée' && <span className="material-symbols-outlined text-[14px]">check_circle</span>}
                        {company.status === 'Rejetée' && <span className="material-symbols-outlined text-[14px]">cancel</span>}
                        {company.status === 'En attente' && <span className="material-symbols-outlined text-[14px] animate-pulse">schedule</span>}
                        {company.status}
                      </span>
                    </div>

                    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-6 flex-1 relative z-10 font-medium">
                      {company.description || "Aucune description fournie par l'entreprise."}
                    </p>

                    <div className="flex flex-col gap-2 mb-6 relative z-10 transform translate-z-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant bg-white/50 backdrop-blur-sm py-2 px-3 rounded-xl border border-white/50 shadow-inner">
                        <span className="material-symbols-outlined text-[16px] text-primary">event</span>
                        Inscrite le {new Date(company.appliedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant bg-white/50 backdrop-blur-sm py-2 px-3 rounded-xl border border-white/50 shadow-inner">
                        <span className="material-symbols-outlined text-[16px] text-primary">link</span>
                        <span className="truncate">{company.website.replace('https://', '').replace('http://', '')}</span>
                      </div>
                    </div>
                    
                    {company.document_juridique && (
                      <div className="mb-6 relative z-10">
                        <motion.a 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          href={`http://localhost:8000/storage/${company.document_juridique}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 px-4 py-3 rounded-xl transition-colors border border-primary/20 w-full shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[20px]">description</span>
                          Consulter le document juridique
                        </motion.a>
                      </div>
                    )}

                    <div className="mt-auto pt-5 border-t border-outline-variant/10 relative z-10">
                      {company.status === 'En attente' ? (
                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRejectClick(company)}
                            disabled={processingId === company.id}
                            className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all border border-red-200 shadow-sm flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                            Rejeter
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApprove(company.id)}
                            disabled={processingId === company.id}
                            className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                          >
                            {processingId === company.id ? (
                              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined">
                                sync
                              </motion.span>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-[18px]">done_all</span>
                                Approuver
                              </>
                            )}
                          </motion.button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 py-3 bg-surface-container/50 rounded-xl text-on-surface-variant text-xs font-extrabold uppercase tracking-wider border border-white/40 shadow-inner">
                          <span className="material-symbols-outlined text-[18px]">
                            {company.status === 'Approuvée' ? 'verified' : 'block'}
                          </span>
                          Dossier {company.status.toLowerCase()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && companyToReject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !processingId && setShowRejectModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full relative z-10 shadow-2xl border border-white/80"
            >
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant/30">
                <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">block</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-heading text-on-surface">Rejeter {companyToReject.name}</h3>
                  <p className="text-sm text-on-surface-variant">Cette action notifiera l&apos;entreprise.</p>
                </div>
              </div>
              
              <div className="mb-8">
                <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Motif du rejet (obligatoire)</label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Veuillez expliquer pourquoi le dossier K-Bis ou l'entreprise est rejeté..."
                  className="w-full h-32 bg-surface-container-low border border-outline-variant/50 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-error/30 focus:border-error resize-none transition-all"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  disabled={processingId === companyToReject.id}
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-on-surface bg-white/80 hover:bg-surface-dim transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button 
                  disabled={processingId === companyToReject.id || rejectReason.trim() === ''}
                  onClick={confirmReject}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-error hover:bg-error/90 transition-all shadow-md shadow-error/20 flex items-center justify-center disabled:opacity-50"
                >
                  {processingId === companyToReject.id ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined">
                      sync
                    </motion.span>
                  ) : (
                    "Confirmer le rejet"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

