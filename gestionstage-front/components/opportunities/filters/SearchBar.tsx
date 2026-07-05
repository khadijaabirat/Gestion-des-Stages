'use client';

import { motion } from 'framer-motion';
import { Search, MapPin, Clock, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel rounded-2xl p-6 relative overflow-hidden shadow-xl"
    >
      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-2xl -z-10 -translate-x-1/2 translate-y-1/2" />

      <form className="flex flex-col md:flex-row gap-4 items-end relative z-10">
        {/* Keyword Input */}
        <div className="w-full md:w-1/3 flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Recherche
          </label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline transition-colors group-focus-within:text-secondary" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-surface-container-low border-2 border-transparent rounded-xl py-3 pl-11 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all placeholder:text-outline-variant"
              placeholder="Ex: UX Designer, Data Analyst..."
            />
          </div>
        </div>

        {/* Location Input */}
        <div className="w-full md:w-1/4 flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Localisation
          </label>
          <div className="relative group">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline transition-colors group-focus-within:text-secondary" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-surface-container-low border-2 border-transparent rounded-xl py-3 pl-11 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all placeholder:text-outline-variant"
              placeholder="Paris, Remote..."
            />
          </div>
        </div>

        {/* Duration Select */}
        <div className="w-full md:w-1/4 flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Durée
          </label>
          <div className="relative">
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-surface-container-low border-2 border-transparent rounded-xl py-3 px-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all appearance-none cursor-pointer"
            >
              <option value="">Toutes durées</option>
              <option value="2">2 mois</option>
              <option value="4">4 mois</option>
              <option value="6">6 mois</option>
            </select>
            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline pointer-events-none" />
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full md:w-auto bg-gradient-to-r from-primary to-surface-tint text-on-primary font-semibold py-3 px-8 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all h-[48px] flex items-center justify-center gap-2 relative overflow-hidden group"
        >
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
          <SlidersHorizontal className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Filtrer</span>
        </motion.button>
      </form>
    </motion.div>
  );
}
