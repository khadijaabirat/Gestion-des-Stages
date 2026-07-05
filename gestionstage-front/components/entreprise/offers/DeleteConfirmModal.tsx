import { motion, AnimatePresence } from 'framer-motion';
import { Offer } from '@/hooks/useEntrepriseOffers';

interface DeleteConfirmModalProps {
  offerToDelete: Offer | null;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export const DeleteConfirmModal = ({
  offerToDelete,
  onClose,
  onConfirm,
  isProcessing
}: DeleteConfirmModalProps) => {
  return (
    <AnimatePresence>
      {offerToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isProcessing && onClose()}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl border border-white/80 text-center perspective-1000 ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
          >
            <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
            </div>
            <h3 className="text-2xl font-bold font-heading text-on-surface mb-2">Supprimer l'offre ?</h3>
            <p className="text-sm text-on-surface-variant mb-8">
              Êtes-vous sûr de vouloir supprimer <strong>{offerToDelete.titre}</strong> ? Cette action supprimera également toutes les candidatures associées. Cette action est irréversible.
            </p>
            
            <div className="flex gap-4">
              <button 
                disabled={isProcessing}
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-on-surface bg-white/80 hover:bg-surface-dim transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button 
                disabled={isProcessing}
                onClick={onConfirm}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-error hover:bg-error/90 transition-all shadow-md shadow-error/20 flex items-center justify-center disabled:opacity-50"
              >
                {isProcessing ? (
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined">
                    sync
                  </motion.span>
                ) : (
                  "Supprimer"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
