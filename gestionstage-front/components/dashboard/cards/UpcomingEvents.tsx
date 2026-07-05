'use client';

import { motion } from 'framer-motion';

const events = [
  {
    month: 'Oct',
    day: '24',
    title: 'Webinaire: Portfolio Review',
    time: '18:00 - Zoom',
    icon: 'schedule',
    color: 'primary',
  },
  {
    month: 'Nov',
    day: '02',
    title: 'Career Fair 2026',
    location: 'Campus Central',
    icon: 'location_on',
    color: 'secondary',
  },
];

export default function UpcomingEvents({ candidatures = [] }: { candidatures?: any[] }) {
  // Mapper les candidatures en événements
  const safeCandidatures = Array.isArray(candidatures) ? candidatures : [];
  const dynamicEvents = safeCandidatures
    .filter(c => c.statut === 'accepte' || c.statut === 'en_attente')
    .slice(0, 3)
    .map(c => {
      const date = new Date(c.updated_at || c.created_at);
      return {
        month: date.toLocaleString('fr-FR', { month: 'short' }),
        day: date.getDate().toString(),
        title: c.offreStage?.titre || c.offre_stage?.titre || 'Candidature',
        time: c.statut === 'accepte' ? 'Acceptée ✅' : 'En attente de réponse',
        icon: c.statut === 'accepte' ? 'check_circle' : 'schedule',
        color: c.statut === 'accepte' ? 'primary' : 'secondary',
      };
    });

  // Si pas d'événements, on affiche l'état vide
  const displayEvents = dynamicEvents;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -4,
        scale: 1.005,
        transition: { duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }
      }}
      className="col-span-1 md:col-span-4 glass-panel rounded-2xl p-6 relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500"
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
        transition={{ delay: 0.5 }}
        className="text-xs font-bold text-on-surface-variant mb-6 uppercase tracking-wider"
      >
        Prochains Événements / Suivis
      </motion.h3>

      <div className="space-y-4">
        {displayEvents.length > 0 ? (
          displayEvents.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03, x: 4 }}
              className="flex items-start gap-4 p-3 rounded-lg bg-surface-container/30 hover:bg-surface-container transition-all cursor-pointer group"
            >
              <motion.div
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
                className={`bg-${event.color}/10 text-${event.color} p-2 rounded-md font-bold text-center leading-none min-w-[48px]`}
              >
                <div className="text-[10px] uppercase">{event.month}</div>
                <div className="text-lg">{event.day}</div>
              </motion.div>

              <div className="flex-1">
                <p className={`text-sm font-semibold text-on-surface group-hover:text-${event.color} transition-colors line-clamp-1`}>
                  {event.title}
                </p>
                <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-sm">{event.icon}</span>
                  {event.time}
                </p>
              </div>

              {/* Arrow Indicator */}
              <motion.span
                initial={{ x: -5, opacity: 0 }}
                whileHover={{ x: 0, opacity: 1 }}
                className="material-symbols-outlined text-on-surface-variant text-xl self-center"
              >
                arrow_forward
              </motion.span>
            </motion.div>
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <span className="material-symbols-outlined text-4xl text-outline/30 mb-2">event_busy</span>
            <p className="text-sm font-medium text-on-surface-variant">Aucun événement à venir.</p>
            <p className="text-xs text-outline mt-1">Vos suivis de candidatures apparaîtront ici.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
