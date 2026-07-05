'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useEntrepriseOffers, Offer } from '@/hooks/useEntrepriseOffers';
import { OffersFilters } from './OffersFilters';
import { OffersList } from './OffersList';
import { OfferModal } from './OfferModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export default function EntrepriseOffersContent() {
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 300, damping: 50 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 300, damping: 50 });
  const bgPosX = useTransform(smoothMouseX, (x) => `${x / 10}px`);
  const bgPosY = useTransform(smoothMouseY, (y) => `${y / 10}px`);
  const backgroundPosition = useMotionTemplate`${bgPosX} ${bgPosY}`;
  const cursorGlow = useMotionTemplate`radial-gradient(800px circle at ${smoothMouseX}px ${smoothMouseY}px, rgba(255,126,95, 0.08) 0%, transparent 60%)`;

  const {
    offers,
    isLoading,
    isValid,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    toast: uiToast,
    deleteOffer,
    saveOffer
  } = useEntrepriseOffers();

  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    localisation: '',
    duree: '',
    date_debut: '',
    date_expiration: '',
    statut: 'published'
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
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

  const handleCreateOffer = () => {
    if (!isValid) {
      toast.error("Votre compte est en cours d'examen. Vous ne pouvez pas publier d'offres pour le moment.");
      return;
    }
    setEditingOffer(null);
    setFormData({
      titre: '',
      description: '',
      localisation: '',
      duree: '',
      date_debut: '',
      date_expiration: '',
      statut: 'published'
    });
    setIsOfferModalOpen(true);
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      titre: offer.titre,
      description: offer.description,
      localisation: offer.localisation || '',
      duree: offer.duree || '',
      date_debut: offer.date_debut ? offer.date_debut.substring(0, 10) : '',
      date_expiration: offer.date_expiration ? offer.date_expiration.substring(0, 10) : '',
      statut: offer.statut
    });
    setIsOfferModalOpen(true);
  };

  const handleManageOffer = (id: string) => {
    window.location.href = `/entreprise/offers/${id}/candidatures`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const success = await saveOffer(formData, editingOffer?.id);
    if (success) {
      setIsOfferModalOpen(false);
    }
    setIsProcessing(false);
  };

  const handleConfirmDelete = async () => {
    if (!offerToDelete) return;
    setIsProcessing(true);
    await deleteOffer(offerToDelete.id);
    setIsProcessing(false);
    setOfferToDelete(null);
  };

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-background text-on-background pb-24 md:pb-10">
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(165,59,34, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(165,59,34, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: backgroundPosition as unknown as string,
          transition: 'background-position 0.2s ease-out'
        }}
      />
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

      <motion.div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-500 mix-blend-multiply"
        style={{
          opacity: cursorGlowOpacity,
          background: cursorGlow as unknown as string
        }}
      />

      <div className="md:hidden flex justify-between items-center p-4 bg-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/20">
        <h2 className="font-heading text-primary font-bold text-xl">Mes Offres</h2>
        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden">
          <span className="material-symbols-outlined text-sm text-on-secondary-container">domain</span>
        </div>
      </div>

      <main className="w-full p-4 md:p-10 relative z-10 flex flex-col gap-6 max-w-[1400px] mx-auto">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4"
        >
          <div>
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-on-background tracking-tighter">Mes Offres</h2>
            <p className="font-body-base text-on-surface-variant mt-2 max-w-xl">
              Gérez vos offres de stage et d&apos;emploi. Attirez les meilleurs talents en gardant vos annonces à jour.
            </p>
          </div>
          
          <div className="relative group/btn">
            <motion.button 
              whileHover={isValid ? { scale: 1.05 } : {}}
              whileTap={isValid ? { scale: 0.95 } : {}}
              onClick={handleCreateOffer}
              disabled={!isValid}
              className={`w-full md:w-auto py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 overflow-hidden relative group transition-all duration-300 ${isValid ? 'text-white bg-gradient-to-r from-primary to-tertiary hover:shadow-[0_0_20px_rgba(165,59,34,0.4)] cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              {isValid && <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>}
              <span className="material-symbols-outlined text-[18px] relative z-10">{isValid ? 'add_circle' : 'lock'}</span>
              <span className="relative z-10">Créer une offre</span>
            </motion.button>
            {!isValid && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1.5 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity z-50">
                Action bloquée (compte en cours d&apos;examen)
              </div>
            )}
          </div>
        </motion.header>

        <OffersFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <OffersList 
          isLoading={isLoading}
          offers={offers}
          isValid={isValid}
          searchQuery={searchQuery}
          onCreateOffer={handleCreateOffer}
          onEditOffer={handleEditOffer}
          onManageOffer={handleManageOffer}
          onDeleteOffer={setOfferToDelete}
        />
      </main>

      <OfferModal 
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        isProcessing={isProcessing}
        editingOffer={editingOffer}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmModal 
        offerToDelete={offerToDelete}
        onClose={() => setOfferToDelete(null)}
        onConfirm={handleConfirmDelete}
        isProcessing={isProcessing}
      />

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
