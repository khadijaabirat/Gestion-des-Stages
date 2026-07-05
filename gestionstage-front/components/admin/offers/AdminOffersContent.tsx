'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';

import { apiFetch } from '@/lib/api';

type OfferStatus = 'Approuvée' | 'Rejetée' | 'En attente' | 'Expirée' | 'Supprimée';

interface Offer {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: OfferStatus;
  postedAt: string;
  applicantsCount: number;
  tags: string[];
}

// Generate Mock Data
// Removed mock data for real data integration

export default function AdminOffersContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // State
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OfferStatus | 'Toutes'>('Toutes');
  
  // Action State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [offerToReject, setOfferToReject] = useState<Offer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Toast
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success'|'error'}>({show: false, message: '', type: 'success'});

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/admin/offres');
      if (response.ok) {
        const data = await response.json();
        const mapped = data.data.data.map((o: any) => {
          let currentStatus: OfferStatus = o.statut === 'draft' ? 'En attente' : (o.statut === 'published' ? 'Approuvée' : 'Rejetée');
          
          if (o.deleted_at) {
            currentStatus = 'Supprimée';
          } else if (o.date_expiration && new Date(o.date_expiration) < new Date()) {
            currentStatus = 'Expirée';
          }

          return {
            id: o.id.toString(),
            title: o.titre,
            company: o.entreprise?.nom || 'Inconnue',
            location: o.localisation || 'À distance',
            type: o.duree ? `${o.duree} mois` : 'Non spécifié',
            status: currentStatus,
            postedAt: o.created_at,
            applicantsCount: 0,
            tags: []
          };
        });
        setOffers(mapped);
      }
    } catch (e) {
      console.error(e);
      showToast('Erreur lors du chargement des offres.', 'error');
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
  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            offer.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'Toutes' || offer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [offers, searchQuery, statusFilter]);

  // Actions
  const handleRejectClick = (offer: Offer) => {
    setOfferToReject(offer);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!offerToReject) return;
    setIsProcessing(true);
    
    try {
      const res = await apiFetch(`/admin/offres/${offerToReject.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setOffers(prev => prev.map(o => o.id === offerToReject.id ? { ...o, status: 'Supprimée' } : o));
        showToast(`L'offre a été supprimée.`, 'success');
      } else {
        showToast(`Erreur lors de la suppression de l'offre.`, 'error');
      }
    } catch (e) {
      showToast(`Erreur de connexion.`, 'error');
    } finally {
      setIsProcessing(false);
      setShowRejectModal(false);
      setOfferToReject(null);
    }
  };

  const approveOffer = async (offerId: string) => {
    setProcessingId(offerId);
    try {
      const res = await apiFetch(`/admin/offres/${offerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'published' })
      });
      if (res.ok) {
        setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'Approuvée' } : o));
        showToast(`Offre approuvée avec succès et publiée !`, 'success');
      } else {
        showToast(`Erreur lors de l'approbation.`, 'error');
      }
    } catch (e) {
      showToast(`Erreur de connexion.`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // UI Helpers
  const getStatusBadgeColor = (status: OfferStatus) => {
    switch (status) {
      case 'Approuvée': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejetée': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'En attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Expirée': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Supprimée': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-surface text-on-surface">
      {/* Background Zellige */}
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
        animate={{ y: [0, -30, 0], rotate: [0, 90, 180, 270, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="fixed top-1/3 -right-32 w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"
      />
      <motion.div
        animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed bottom-0 -left-20 w-[45vw] h-[45vw] bg-secondary/5 rounded-full blur-[120px] pointer-events-none -z-10"
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
              Offres &amp; Stages
            </h1>
            <p className="font-body-base text-on-surface-variant mt-2">
              Modérez, validez ou rejetez les opportunités publiées par les entreprises.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-outline-variant/30 text-on-surface font-label-caps font-bold py-3 px-6 rounded-xl shadow-sm hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filtrage Avancé
            </motion.button>
          </div>
        </motion.header>

        {/* Filters & Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center z-20 relative"
        >
          {/* Status Tabs */}
          <div className="flex p-1 bg-surface-container-low rounded-xl border border-outline-variant/30 w-full md:w-auto overflow-x-auto custom-scrollbar">
            {['Toutes', 'En attente', 'Approuvée', 'Expirée', 'Supprimée'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`relative px-6 py-2.5 rounded-lg text-sm font-bold font-label-caps tracking-wider transition-colors whitespace-nowrap ${
                  statusFilter === status ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {statusFilter === status && (
                  <motion.div
                    layoutId="activeStatus"
                    className="absolute inset-0 bg-white shadow-sm rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{status}</span>
                {/* Notification dot for 'En attente' */}
                {status === 'En attente' && offers.filter(o => o.status === 'En attente').length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse z-10"></span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
              search
            </span>
            <input 
              type="text" 
              placeholder="Rechercher une offre..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </motion.div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 font-bold text-on-surface-variant">Chargement des offres...</p>
              </motion.div>
            ) : filteredOffers.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="col-span-full bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-[0_8px_32px_0_rgba(165,59,34,0.05)]"
              >
                <div className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/50">inbox</span>
                </div>
                <h3 className="text-2xl font-bold font-heading text-on-surface mb-2">Aucune offre trouvée</h3>
                <p className="text-on-surface-variant max-w-md">
                  {searchQuery ? "Aucune offre ne correspond à votre recherche." : "La file d'attente est vide ! Excellent travail."}
                </p>
              </motion.div>
            ) : (
              filteredOffers.map((offer, i) => (
                <motion.div
                  key={offer.id}
                  layout
                  initial={{ opacity: 0, y: 30, rotateX: 10 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateX: -10 }}
                  transition={{ delay: i * 0.05, type: 'spring', damping: 20, stiffness: 100 }}
                  className="group relative h-full perspective-1000"
                >
                  <motion.div
                    whileHover={{ scale: 1.02, rotateY: 2, rotateX: -2, z: 20 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    className="bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] hover:shadow-[0_20px_50px_rgba(165,59,34,0.15)] hover:border-white/80 rounded-[2rem] p-6 md:p-8 flex flex-col h-full transform-style-preserve-3d"
                  >
                    {/* Status Indicator Glow */}
                    <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
                      offer.status === 'Approuvée' ? 'bg-green-400/10 group-hover:bg-green-400/20' :
                      offer.status === 'Supprimée' ? 'bg-red-400/10 group-hover:bg-red-400/20' : 
                      offer.status === 'Expirée' ? 'bg-gray-400/10 group-hover:bg-gray-400/20' : 'bg-yellow-400/20 group-hover:scale-150'
                    }`} />

                    <div className="flex justify-between items-start mb-6 relative z-10 transform translate-z-10">
                      <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-outline-variant/30 shadow-md">
                        <span className="material-symbols-outlined text-3xl text-secondary">domain</span>
                      </motion.div>
                      <span className={`px-4 py-1.5 rounded-xl text-[11px] font-extrabold border flex items-center gap-1.5 uppercase tracking-widest ${getStatusBadgeColor(offer.status)}`}>
                        {offer.status === 'Approuvée' && <span className="material-symbols-outlined text-[14px]">check_circle</span>}
                        {offer.status === 'Rejetée' && <span className="material-symbols-outlined text-[14px]">cancel</span>}
                        {offer.status === 'Supprimée' && <span className="material-symbols-outlined text-[14px]">delete_forever</span>}
                        {offer.status === 'Expirée' && <span className="material-symbols-outlined text-[14px]">history</span>}
                        {offer.status === 'En attente' && <span className="material-symbols-outlined text-[14px] animate-pulse">pending</span>}
                        {offer.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold font-heading text-on-surface mb-1 line-clamp-2 relative z-10 group-hover:text-primary transition-colors">{offer.title}</h3>
                    <p className="text-sm text-on-surface-variant font-bold uppercase tracking-wider mt-1 mb-6 relative z-10">{offer.company}</p>

                    <div className="flex flex-col gap-2 mb-8 relative z-10 transform translate-z-5">
                      <span className="flex items-center gap-2 text-xs font-bold text-on-surface-variant bg-white/50 backdrop-blur-sm py-2 px-3 rounded-xl border border-white/50 shadow-inner">
                        <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                        {offer.location}
                      </span>
                      <span className="flex items-center gap-2 text-xs font-bold text-on-surface-variant bg-white/50 backdrop-blur-sm py-2 px-3 rounded-xl border border-white/50 shadow-inner">
                        <span className="material-symbols-outlined text-[16px] text-primary">work</span>
                        {offer.type}
                      </span>
                      <span className="flex items-center gap-2 text-xs font-bold text-on-surface-variant bg-white/50 backdrop-blur-sm py-2 px-3 rounded-xl border border-white/50 shadow-inner">
                        <span className="material-symbols-outlined text-[16px] text-primary">event</span>
                        Publiée le {new Date(offer.postedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="mt-auto pt-5 border-t border-outline-variant/10 flex gap-3 relative z-10">
                      {offer.status !== 'Approuvée' && (
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => approveOffer(offer.id)}
                          disabled={processingId === offer.id}
                          className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                        >
                          {processingId === offer.id ? (
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
                      )}
                      
                      {offer.status !== 'Supprimée' && (
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRejectClick(offer)}
                          className={`flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all border border-red-200 shadow-sm flex items-center justify-center gap-2 ${offer.status === 'Approuvée' || offer.status === 'Expirée' ? 'w-full' : ''}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          Supprimer
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Reject Confirmation Modal */}
      <AnimatePresence>
        {showRejectModal && offerToReject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setShowRejectModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl border border-white/80"
            >
              <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mb-6 mx-auto">
                <span className="material-symbols-outlined text-3xl">delete_forever</span>
              </div>
              <h3 className="text-2xl font-bold text-center font-heading text-on-surface mb-2">Supprimer l&apos;offre ?</h3>
              <p className="text-center text-on-surface-variant mb-6">
                L&apos;offre <strong>{offerToReject.title}</strong> de {offerToReject.company} sera supprimée de la plateforme.
              </p>
              
              <div className="flex gap-4">
                <button 
                  disabled={isProcessing}
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-on-surface bg-white/80 hover:bg-surface-dim transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={confirmReject}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-error hover:bg-error/90 transition-all shadow-md shadow-error/20 flex items-center justify-center disabled:opacity-80"
                >
                  {isProcessing ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined">
                      sync
                    </motion.span>
                  ) : (
                    "Oui, supprimer"
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

