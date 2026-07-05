import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

import { Offer } from '@/hooks/useEntrepriseOffers';

interface OfferCard3DProps {
  offer: Offer;
  getStatusBadgeColor: (status: string) => string;
  setOfferToDelete: (offer: Offer) => void;
  modifierOffre: (offer: Offer) => void;
  gererOffre: (id: string) => void;
}

const OfferCard3D = ({ offer, getStatusBadgeColor, setOfferToDelete, modifierOffre, gererOffre }: OfferCard3DProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    x.set(0);
    y.set(0);
  };

  const isExpired = (dateString: string) => {
    if (!dateString) return false;
    return new Date(dateString).getTime() < new Date().getTime();
  };

  const expired = isExpired(offer.date_expiration);
  const displayStatus = expired && offer.statut !== 'closed' ? 'Expirée' : 
                        offer.statut === 'published' ? 'Active' : 
                        offer.statut === 'draft' ? 'Brouillon' : 'Clôturée';

  const getBadgeStyle = () => {
    if (expired && offer.statut !== 'closed') return 'bg-red-500/10 text-red-600 border-red-500/20';
    return getStatusBadgeColor(offer.statut);
  };

  const getBadgeIcon = () => {
    if (expired && offer.statut !== 'closed') return 'timer_off';
    if (offer.statut === 'published') return 'check_circle';
    if (offer.statut === 'closed') return 'do_not_disturb_on';
    return 'edit_document';
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={isTouchDevice ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={isTouchDevice ? "" : "perspective-1000"}
    >
      <div 
        className={`bg-white/80 backdrop-blur-xl border ${expired && offer.statut !== 'closed' ? 'border-red-200 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-outline-variant/30 shadow-sm hover:shadow-[0_20px_50px_rgba(165,59,34,0.15)]'} rounded-3xl p-6 md:p-8 flex flex-col transition-shadow duration-300 relative overflow-hidden group h-full`}
        style={isTouchDevice ? {} : { transform: "translateZ(30px)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-3xl" />
        
        {/* Header: Title & Badge */}
        <div className="flex justify-between items-start gap-4 mb-4 relative z-10" style={isTouchDevice ? {} : { transform: "translateZ(40px)" }}>
          <div>
            <h3 className="font-heading text-xl md:text-2xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
              {offer.titre}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant font-medium">
              <span className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-md border border-outline-variant/20">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                {offer.duree || 'Durée non spécifiée'}
              </span>
              <span className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-md border border-outline-variant/20">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {offer.localisation || 'Non spécifié'}
              </span>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 uppercase tracking-wider shrink-0 ${getBadgeStyle()}`}>
            <span className="material-symbols-outlined text-[14px]">
              {getBadgeIcon()}
            </span>
            {displayStatus}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-6 relative z-10" style={isTouchDevice ? {} : { transform: "translateZ(20px)" }}>
          {offer.description}
        </p>

        {/* Stats & Actions */}
        <div className="mt-auto pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10" style={isTouchDevice ? {} : { transform: "translateZ(30px)" }}>
          
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Candidats</p>
              <div className="flex items-center gap-2">
                <span className="font-heading text-2xl font-bold text-on-surface">{offer.candidatures_count || 0}</span>
              </div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-outline-variant/30"></div>
            <div>
              <p className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Publiée le</p>
              <span className="font-bold text-sm text-on-surface">{new Date(offer.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <motion.button 
              aria-label="Supprimer l'offre"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOfferToDelete(offer)}
              className="w-10 h-10 rounded-xl bg-surface-container hover:bg-red-50 text-on-surface-variant hover:text-red-500 border border-outline-variant/20 hover:border-red-200 transition-colors flex items-center justify-center shrink-0"
              title="Supprimer"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </motion.button>
            
            <motion.button 
              aria-label="Modifier l'offre"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => modifierOffre(offer)}
              className="w-10 h-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/20 transition-colors flex items-center justify-center shrink-0"
              title="Modifier"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => gererOffre(offer.id)}
              className="flex-1 sm:flex-none py-2 px-6 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-colors flex items-center justify-center gap-2"
            >
              Gérer
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OfferCard3D;
