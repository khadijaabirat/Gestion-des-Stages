import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Offer } from '@/hooks/useEntrepriseOffers';
import { Skeleton } from '@/components/ui/skeleton';

const OfferCard3D = dynamic(() => import('./OfferCard3D'), { ssr: false });

interface OffersListProps {
  isLoading: boolean;
  offers: Offer[];
  isValid: boolean;
  searchQuery: string;
  onCreateOffer: () => void;
  onEditOffer: (offer: Offer) => void;
  onManageOffer: (id: string) => void;
  onDeleteOffer: (offer: Offer) => void;
}

export const OffersList = ({
  isLoading,
  offers,
  isValid,
  searchQuery,
  onCreateOffer,
  onEditOffer,
  onManageOffer,
  onDeleteOffer
}: OffersListProps) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/10 text-green-600 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]';
      case 'closed': return 'bg-white/80 text-on-surface-variant border-outline-variant/30';
      case 'draft': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4">
      <AnimatePresence mode="popLayout">
        {offers.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="col-span-full bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] perspective-1000"
          >
            <motion.div 
              animate={{ rotateY: [0, 180, 360], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(165,59,34,0.2)]"
            >
              <span className="material-symbols-outlined text-5xl text-primary">inbox</span>
            </motion.div>
            <h3 className="text-2xl font-bold font-heading text-on-surface mb-2">Aucune offre trouvée</h3>
            <p className="text-on-surface-variant max-w-md mb-8">
              {searchQuery ? "Aucun résultat pour cette recherche ou ces filtres." : "Vous n'avez pas encore publié d'offres. C'est le moment de trouver votre prochain talent !"}
            </p>
            <div className="relative group/btn-empty">
              <motion.button 
                whileHover={isValid ? { scale: 1.05 } : {}}
                whileTap={isValid ? { scale: 0.95 } : {}}
                onClick={onCreateOffer}
                disabled={!isValid}
                className={`py-3 px-6 rounded-xl font-bold flex items-center gap-2 transition-colors ${isValid ? 'text-primary bg-primary/10 hover:bg-primary/20 cursor-pointer' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              >
                <span className="material-symbols-outlined">{isValid ? 'add' : 'lock'}</span>
                Créer une offre maintenant
              </motion.button>
              {!isValid && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1.5 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/btn-empty:opacity-100 pointer-events-none transition-opacity z-50">
                  Compte en cours d'examen
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          offers.map((offer) => (
            <OfferCard3D 
              key={offer.id} 
              offer={offer} 
              getStatusBadgeColor={getStatusBadgeColor} 
              setOfferToDelete={onDeleteOffer} 
              modifierOffre={onEditOffer} 
              gererOffre={onManageOffer} 
            />
          ))
        )}
      </AnimatePresence>
    </div>
  );
};
