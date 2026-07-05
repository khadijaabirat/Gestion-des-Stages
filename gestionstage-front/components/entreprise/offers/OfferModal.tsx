import { motion, AnimatePresence } from 'framer-motion';
import { Offer } from '@/hooks/useEntrepriseOffers';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  isProcessing: boolean;
  editingOffer: Offer | null;
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const OfferModal = ({
  isOpen,
  onClose,
  isProcessing,
  editingOffer,
  formData,
  setFormData,
  onSubmit
}: OfferModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isProcessing && onClose()}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20, rotateX: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-surface rounded-3xl w-full max-w-2xl relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden flex flex-col max-h-[90vh] perspective-1000 ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
          >
            <div className="p-6 border-b border-outline-variant/20 bg-surface-container-lowest flex justify-between items-center">
              <h3 className="text-2xl font-bold font-heading text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">{editingOffer ? 'edit_document' : 'add_circle'}</span>
                {editingOffer ? 'Modifier l\'offre' : 'Nouvelle offre de stage'}
              </h3>
              <button aria-label="Fermer la fenêtre" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="offerForm" onSubmit={onSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1.5">Titre de l'offre *</label>
                  <input required value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})} type="text" className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Ex: Développeur Fullstack Laravel/React" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1.5">Description *</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" placeholder="Détaillez les missions, le profil recherché..."></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-1.5">Localisation</label>
                    <input value={formData.localisation} onChange={e => setFormData({...formData, localisation: e.target.value})} type="text" className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Ex: Casablanca / Télétravail" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-1.5">Durée</label>
                    <input value={formData.duree} onChange={e => setFormData({...formData, duree: e.target.value})} type="text" className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Ex: 6 mois" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-1.5">Date de début</label>
                    <input value={formData.date_debut} onChange={e => setFormData({...formData, date_debut: e.target.value})} type="date" className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-1.5">Date d'expiration</label>
                    <input value={formData.date_expiration} onChange={e => setFormData({...formData, date_expiration: e.target.value})} type="date" className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1.5">Statut de l'offre</label>
                  <select value={formData.statut} onChange={e => setFormData({...formData, statut: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none">
                    <option value="published">Active (Publiée)</option>
                    <option value="draft">Brouillon</option>
                    <option value="closed">Clôturée</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-outline-variant/20 bg-surface-container-lowest flex justify-end gap-4">
              <button 
                disabled={isProcessing}
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl font-bold text-on-surface bg-surface-container hover:bg-surface-dim transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button 
                form="offerForm"
                disabled={isProcessing}
                type="submit"
                className="py-2.5 px-6 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 min-w-[150px]"
              >
                {isProcessing ? (
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined text-[20px]">
                    sync
                  </motion.span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">save</span>
                    {editingOffer ? 'Mettre à jour' : 'Publier'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
