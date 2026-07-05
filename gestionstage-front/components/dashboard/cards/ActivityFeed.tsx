'use client';

import { motion } from 'framer-motion';

const activities = [
  {
    icon: 'visibility',
    title: 'Votre candidature vue par',
    company: 'Google',
    time: 'Il y a 2 heures',
    color: 'primary',
  },
  {
    icon: 'check_circle',
    title: 'Profil approuvé par l\'administration.',
    time: 'Hier',
    color: 'secondary',
  },
  {
    icon: 'event',
    title: 'Entretien planifié avec',
    company: 'Stripe',
    time: 'Il y a 3 jours',
    color: 'tertiary',
  },
];

export default function ActivityFeed({ candidatures = [] }: { candidatures?: any[] }) {
  // Transformer les candidatures en activités récentes
  const safeCandidatures = Array.isArray(candidatures) ? candidatures : [];
  const dynamicActivities = safeCandidatures
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .slice(0, 3)
    .map(c => {
      const getStatusInfo = (statut: string) => {
        switch (statut) {
          case 'accepte': return { icon: 'check_circle', title: 'Candidature acceptée pour', color: 'primary' };
          case 'refuse': return { icon: 'cancel', title: 'Candidature refusée pour', color: 'error' };
          case 'annule': return { icon: 'remove_circle', title: 'Candidature annulée pour', color: 'tertiary' };
          case 'en_attente': default: return { icon: 'schedule', title: 'Candidature envoyée pour', color: 'secondary' };
        }
      };
      
      const info = getStatusInfo(c.statut);
      const date = new Date(c.updated_at || c.created_at);
      const isRecent = (new Date().getTime() - date.getTime()) < 86400000;

      return {
        icon: info.icon,
        title: info.title,
        company: c.offreStage?.titre || c.offre_stage?.titre || 'Stage',
        time: isRecent ? 'Aujourd\'hui' : date.toLocaleDateString('fr-FR'),
        color: info.color,
      };
    });

  const displayActivities = dynamicActivities;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -4,
        scale: 1.005,
        transition: { duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }
      }}
      className="col-span-1 md:col-span-4 glass-panel rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500"
    >
      {/* Shimmer Effect */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'linear' }}
        className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none transform -skew-x-12"
      />

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-xs font-bold text-on-surface-variant mb-6 uppercase tracking-wider"
      >
        Activité récente
      </motion.h3>

      <div className="space-y-6 relative">
        {/* Timeline Line */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
          className="absolute left-5 top-0 w-0.5 bg-gradient-to-b from-primary/40 via-secondary/40 to-tertiary/40"
        />

        {displayActivities.length > 0 ? (
          displayActivities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.15, duration: 0.5 }}
              className="flex gap-4 group relative"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className={`w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-${activity.color} shrink-0 relative z-10 shadow-md group-hover:shadow-lg`}
              >
                <span className="material-symbols-outlined text-sm">{activity.icon}</span>
              </motion.div>

              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
              >
                <p className="text-sm text-on-surface">
                  {activity.title}{' '}
                  {activity.company && (
                    <span className="font-semibold line-clamp-1 inline-block align-bottom max-w-[150px]">{activity.company}</span>
                  )}
                </p>
                <span className="text-xs text-on-surface-variant">{activity.time}</span>
              </motion.div>

              {/* Hover Glow Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className={`absolute inset-0 bg-${activity.color}/5 rounded-lg -z-10`}
              />
            </motion.div>
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <span className="material-symbols-outlined text-4xl text-outline/30 mb-2">history_toggle_off</span>
            <p className="text-sm font-medium text-on-surface-variant">Aucune activité récente.</p>
            <p className="text-xs text-outline mt-1">Explorez les offres de stage pour commencer !</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
