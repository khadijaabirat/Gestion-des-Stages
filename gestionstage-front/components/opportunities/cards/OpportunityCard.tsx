'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, Bookmark } from 'lucide-react';

interface Opportunity {
  id: number;
  title: string;
  company: string;
  location: string;
  duration: string;
  salary: string | null;
  isNew: boolean;
  logo: string;
  featured: boolean;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  isSaved: boolean;
  onToggleSave: () => void;
}

export default function OpportunityCard({ opportunity, index, isSaved, onToggleSave }: OpportunityCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -4,
        scale: 1.005,
        transition: { duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }
      }}
      className={`glass-panel rounded-2xl p-5 flex flex-col md:flex-row gap-6 cursor-pointer relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500 ${
        opportunity.featured ? 'border-l-4 border-l-primary' : ''
      }`}
    >
      {/* Shimmer Effect */}
      <motion.div
        initial={{ x: '-100%' }}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none transform -skew-x-12"
      />

      {/* Company Logo */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="w-16 h-16 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-md"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: `url(${opportunity.logo})` }}
        />
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-xl font-bold text-on-surface hover:text-primary transition-colors">
            {opportunity.title}
          </h4>
          {opportunity.isNew && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, delay: 0.5 + index * 0.1 }}
              className="bg-white/80 text-on-surface text-xs font-bold px-2 py-1 rounded uppercase tracking-wider"
            >
              Nouveau
            </motion.span>
          )}
        </div>
        <p className="text-primary font-semibold mb-3">{opportunity.company}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-auto">
          <span className="flex items-center gap-1 bg-surface-container-low text-on-surface-variant text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/80 transition-colors">
            <MapPin className="w-4 h-4" />
            {opportunity.location}
          </span>
          <span className="flex items-center gap-1 bg-surface-container-low text-on-surface-variant text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/80 transition-colors">
            <Clock className="w-4 h-4" />
            {opportunity.duration}
          </span>
          {opportunity.salary && (
            <span className="flex items-center gap-1 bg-surface-container-low text-on-surface-variant text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/80 transition-colors">
              <DollarSign className="w-4 h-4" />
              {opportunity.salary}
            </span>
          )}
        </div>
      </div>

      {/* Bookmark Action */}
      <div className="flex items-center justify-end md:justify-center md:pl-4 md:border-l border-outline-variant/30">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          whileHover={{ scale: 1.1, rotate: isSaved ? 0 : 15 }}
          whileTap={{ scale: 0.9 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isSaved
              ? 'bg-secondary text-white'
              : 'bg-surface-container-low hover:bg-secondary-container hover:text-on-secondary-container text-on-surface-variant'
          }`}
        >
          <motion.div
            animate={isSaved ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
          </motion.div>
        </motion.button>
      </div>

      {/* Featured Indicator */}
      {opportunity.featured && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
          className="absolute top-3 right-3 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded uppercase backdrop-blur-sm"
        >
          ★ Recommandé
        </motion.div>
      )}
    </motion.article>
  );
}
