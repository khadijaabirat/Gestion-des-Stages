import { motion } from 'framer-motion';

interface OffersFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  sortBy: 'Recent' | 'Candidates';
  setSortBy: (val: 'Recent' | 'Candidates') => void;
}

export const OffersFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy
}: OffersFiltersProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] rounded-2xl p-4 md:p-6 flex flex-col lg:flex-row gap-4 justify-between items-center z-20 sticky top-4 md:top-6"
    >
      <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
        {/* Search */}
        <div className="relative w-full md:w-80 group flex-shrink-0">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
            search
          </span>
          <input 
            type="text" 
            placeholder="Rechercher une offre, une ville..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex p-1 bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-x-auto custom-scrollbar flex-shrink-0">
          {['Toutes', 'Active', 'Brouillon', 'Clôturée'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`relative px-4 py-2.5 rounded-lg text-sm font-bold font-label-caps tracking-wider transition-colors whitespace-nowrap ${
                statusFilter === status ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {statusFilter === status && (
                <motion.div
                  layoutId="offerStatusFilter"
                  className="absolute inset-0 bg-white shadow-sm rounded-lg border border-outline-variant/20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">{status}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 w-full lg:w-auto">
        {/* Sort Dropdown */}
        <div className="relative w-full lg:w-48">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'Recent' | 'Candidates')}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
          >
            <option value="Recent">Plus récentes</option>
            <option value="Candidates">Plus de candidats</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">sort</span>
        </div>
      </div>
    </motion.div>
  );
};
