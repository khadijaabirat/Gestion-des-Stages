'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock, Bookmark, ChevronDown, SlidersHorizontal, Loader2, AlertCircle, ArrowRight, Building2, X } from 'lucide-react';
import { apiFetch, extractArray, getAvatarUrl } from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// 1. Lazy Loading du composant 3D pour ne pas bloquer le rendu initial
// Si tu utilises OfferCard3D quelque part, voici comment l'importer :
const OfferCard3D = dynamic(() => import('@/components/entreprise/offers/OfferCard3D'), {
  ssr: false, // Important : Les composants 3D (Three.js) ne peuvent pas être rendus sur le serveur
  loading: () => <div className="w-full h-64 bg-surface-container rounded-3xl animate-pulse" />
});

interface Offer {
  id: number;
  titre: string;
  description: string;
  localisation: string;
  duree: string;
  remuneration: string | null;
  statut: string;
  date_debut: string | null;
  date_expiration: string | null;
  created_at: string;
  entreprise?: {
    id: number;
    nom: string;
    description?: string;
    site_web?: string;
    photo?: string;
  };
}

interface Filters {
  search: string;
  localisation: string;
  duree: string;
}

const DUREES = ['', '1 mois', '2 mois', '3 mois', '4 mois', '5 mois', '6 mois', '+6 mois'];

interface OffersContentProps {
  initialOffers?: Offer[];
  initialPagination?: {
    total: number;
    next_page_url: string | null;
    current_page: number;
  };
}

export default function OffersContent({ initialOffers = [], initialPagination }: OffersContentProps) {
  // 2. Utilisation des données pré-fetchées (SSR) comme état initial
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [loading, setLoading] = useState(!initialOffers.length);
  const [error, setError] = useState<string | null>(null);
  const [savedOffers, setSavedOffers] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(initialPagination?.current_page || 1);
  const [totalOffers, setTotalOffers] = useState(initialPagination?.total || 0);
  const [hasMore, setHasMore] = useState(!!initialPagination?.next_page_url);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({ search: '', localisation: '', duree: '' });
  const [activeFilters, setActiveFilters] = useState<Filters>({ search: '', localisation: '', duree: '' });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);
  const searchParams = useSearchParams();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setMousePosition({ x: e.clientX, y: e.clientY });
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

  // Read URL search params on mount or when changed
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== filters.search) {
      setFilters(prev => ({ ...prev, search: q }));
      setActiveFilters(prev => ({ ...prev, search: q }));
    }
  }, [searchParams]);

  const fetchOffers = useCallback(async (pageNum: number, currentFilters: Filters, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      const params = new URLSearchParams({ page: String(pageNum) });
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.localisation) params.append('localisation', currentFilters.localisation);
      if (currentFilters.duree) params.append('duree', currentFilters.duree);

      const res = await apiFetch(`/offres-stage?${params}`);
      if (!res.ok) throw new Error('Erreur de chargement des offres');

      const data = await res.json();
      const newOffers = extractArray(data);
      const pagination = data?.data || data;

      setTotalOffers(pagination?.total || newOffers.length);
      setHasMore(!!pagination?.next_page_url);

      if (append) {
        setOffers(prev => [...prev, ...newOffers]);
      } else {
        setOffers(newOffers);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // 3. Ne fetcher côté client que si on change les filtres
  useEffect(() => {
    // Éviter de re-fetcher au montage si on a déjà les initialOffers
    if (initialOffers.length > 0 && !activeFilters.search && !activeFilters.localisation && !activeFilters.duree && page === 1) {
      setLoading(false);
      return;
    }
    fetchOffers(1, activeFilters);
    setPage(1);
  }, [activeFilters, fetchOffers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilters({ ...filters });
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOffers(nextPage, activeFilters, true);
  };

  const toggleSave = (id: number) => {
    setSavedOffers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilter = (key: keyof Filters) => {
    const updated = { ...activeFilters, [key]: '' };
    setActiveFilters(updated);
    setFilters(updated);
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v).length;

  const sortedOffers = [...offers].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'date_debut') {
      if (!a.date_debut) return 1;
      if (!b.date_debut) return -1;
      return new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime();
    }
    if (sortBy === 'date_expiration') {
      if (!a.date_expiration) return 1;
      if (!b.date_expiration) return -1;
      return new Date(a.date_expiration).getTime() - new Date(b.date_expiration).getTime();
    }
    if (sortBy === 'remuneration') return (b.remuneration ? 1 : 0) - (a.remuneration ? 1 : 0);
    return 0;
  });

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-background">
      {/* Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-500 mix-blend-multiply"
        style={{
          opacity: cursorGlowOpacity,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,126,95, 0.1), transparent 70%)`
        }}
      />

      {/* Floating Ambient Gradients */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15], x: [0, 30, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(165,59,34, 0.12) 0%, rgba(250, 248, 255, 0) 70%)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1], x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ duration: 15, repeat: Infinity, delay: 2, ease: 'easeInOut' }}
        className="fixed bottom-0 right-0 w-[700px] h-[700px] rounded-full blur-3xl pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(86, 68, 208, 0.1) 0%, rgba(250, 248, 255, 0) 70%)' }}
      />

      <motion.main 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
        className="w-full pt-4 md:pt-6 p-4 md:p-8 pb-24 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-5xl font-extrabold text-on-background mb-2 font-heading tracking-tight">
              Explorez l&apos;avenir.{' '}
              <span className="text-primary">Trouvez votre stage.</span>
            </h1>
            <p className="text-on-surface-variant text-lg">
              {totalOffers > 0 ? `${totalOffers} offres disponibles` : 'Découvrez les meilleures opportunités de stage'}
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSearch}
            className="glass-panel rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3 shadow-xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Titre, mots-clés, entreprise..."
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 bg-white/60 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="relative flex-1 md:max-w-xs">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Ville, région..."
                value={filters.localisation}
                onChange={e => setFilters(prev => ({ ...prev, localisation: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 bg-white/60 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="relative md:max-w-[180px]">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <select
                value={filters.duree}
                onChange={e => setFilters(prev => ({ ...prev, duree: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 bg-white/60 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="">Durée</option>
                {DUREES.filter(d => d).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-primary/30 hover:shadow-xl transition-all"
            >
              <Search className="w-4 h-4" />
              Rechercher
            </motion.button>
          </motion.form>

          {/* Active Filters */}
          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mb-5"
              >
                {activeFilters.search && (
                  <span className="flex items-center gap-1 bg-primary/10 text-primary text-sm font-medium px-3 py-1.5 rounded-full">
                    🔍 {activeFilters.search}
                    <button onClick={() => clearFilter('search')}>
                      <X className="w-3 h-3 ml-1 hover:text-primary/70" />
                    </button>
                  </span>
                )}
                {activeFilters.localisation && (
                  <span className="flex items-center gap-1 bg-secondary/10 text-secondary text-sm font-medium px-3 py-1.5 rounded-full">
                    <MapPin className="w-3 h-3" /> {activeFilters.localisation}
                    <button onClick={() => clearFilter('localisation')}>
                      <X className="w-3 h-3 ml-1" />
                    </button>
                  </span>
                )}
                {activeFilters.duree && (
                  <span className="flex items-center gap-1 bg-tertiary/10 text-tertiary text-sm font-medium px-3 py-1.5 rounded-full">
                    <Clock className="w-3 h-3" /> {activeFilters.duree}
                    <button onClick={() => clearFilter('duree')}>
                      <X className="w-3 h-3 ml-1" />
                    </button>
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Header */}
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold text-on-surface">
              {loading ? 'Chargement...' : (
                <>Résultats <span className="text-primary">({totalOffers})</span></>
              )}
            </h3>
            <div className="flex items-center gap-2 text-on-surface-variant text-sm">
              <span>Trier par:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent border-none focus:ring-0 cursor-pointer font-semibold text-primary outline-none"
              >
                <option value="recent">Plus récent</option>
                <option value="date_debut">Date de début</option>
                <option value="date_expiration">Date d'expiration</option>
                <option value="remuneration">Rémunéré</option>
              </select>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col gap-5 mt-6">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="glass-panel rounded-[1.5rem] p-5 flex flex-col md:flex-row gap-6 relative overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                  <div className="w-16 h-16 rounded-xl bg-surface-variant/30 animate-pulse" />
                  <div className="flex-1 space-y-4 py-1">
                    <div className="flex justify-between">
                      <div className="h-5 bg-surface-variant/30 rounded-full w-1/2 animate-pulse" />
                      <div className="h-8 bg-surface-variant/30 rounded-xl w-24 animate-pulse hidden md:block" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-surface-variant/30 rounded-full w-3/4 animate-pulse" />
                      <div className="h-3 bg-surface-variant/30 rounded-full w-5/6 animate-pulse" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <div className="h-6 bg-surface-variant/30 rounded-lg w-20 animate-pulse" />
                      <div className="h-6 bg-surface-variant/30 rounded-lg w-24 animate-pulse" />
                      <div className="h-6 bg-surface-variant/30 rounded-lg w-16 animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-xl font-bold text-on-surface">Erreur de chargement</h3>
              <p className="text-on-surface-variant">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchOffers(1, activeFilters)}
                className="bg-primary text-white px-6 py-3 rounded-xl font-semibold"
              >
                Réessayer
              </motion.button>
            </motion.div>
          ) : sortedOffers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel rounded-2xl p-16 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-on-surface-variant" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Aucune offre trouvée</h3>
              <p className="text-on-surface-variant">Essayez d&apos;autres critères de recherche.</p>
            </motion.div>
          ) : (
            <>
              <motion.div layout className="flex flex-col gap-4">
                <AnimatePresence mode="popLayout">
                  {sortedOffers.map((offer, index) => (
                    <OfferCardReal
                      key={offer.id}
                      offer={offer}
                      index={index}
                      isSaved={savedOffers.has(offer.id)}
                      onToggleSave={() => toggleSave(offer.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Load More */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center mt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="bg-surface-container-high text-on-surface font-semibold px-8 py-3 rounded-full hover:bg-white/80 transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60"
                  >
                    {loadingMore ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <Loader2 className="w-5 h-5" />
                        </motion.div>
                        Chargement...
                      </>
                    ) : (
                      <>
                        Charger plus d&apos;offres
                        <ChevronDown className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.main>
    </div>
  );
}

// Inline offer card with real data structure
function OfferCardReal({
  offer,
  index,
  isSaved,
  onToggleSave,
}: {
  offer: Offer;
  index: number;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const isNew = new Date().getTime() - new Date(offer.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;
  const logoUrl = offer.entreprise?.photo ? `http://localhost:8000${offer.entreprise.photo}` : getAvatarUrl(offer.entreprise?.nom || 'Stage');

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), type: "spring", stiffness: 100 }}
      whileHover={{ y: -6, scale: 1.01, transition: { type: "spring", stiffness: 300 } }}
      className="group glass-panel rounded-[1.5rem] p-5 flex flex-col md:flex-row gap-6 relative overflow-hidden shadow-lg hover:shadow-[0_20px_40px_rgba(var(--primary-rgb),0.15)] hover:border-primary/30 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {/* Shimmer */}
      <motion.div
        initial={{ x: '-100%' }}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none transform -skew-x-12"
      />

      {/* Company Logo */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0 shadow-md">
        <img
          src={logoUrl}
          alt={offer.entreprise?.nom || 'Entreprise'}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h4 className="text-xl font-bold text-on-surface hover:text-primary transition-colors line-clamp-1">
              {offer.titre}
            </h4>
            {isNew && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full ml-2 shrink-0"
              >
                Nouveau
              </motion.span>
            )}
          </div>
          <p className="text-primary font-semibold mb-2 flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            {offer.entreprise?.nom || 'Entreprise'}
            <span className={`ml-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${offer.statut === 'ouverte' || offer.statut === 'published' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {offer.statut === 'published' ? 'ouverte' : offer.statut}
            </span>
          </p>
          <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">
            {offer.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {offer.localisation && (
            <span className="flex items-center gap-1 bg-surface-container-low text-on-surface-variant text-xs font-semibold px-3 py-1.5 rounded-lg">
              <MapPin className="w-3 h-3" /> {offer.localisation}
            </span>
          )}
          {offer.duree && (
            <span className="flex items-center gap-1 bg-surface-container-low text-on-surface-variant text-xs font-semibold px-3 py-1.5 rounded-lg">
              <Clock className="w-3 h-3" /> {offer.duree}
            </span>
          )}
          {offer.remuneration && (
            <span className="flex items-center gap-1 bg-secondary/10 text-secondary text-xs font-semibold px-3 py-1.5 rounded-lg">
              💰 {offer.remuneration}
            </span>
          )}
          {offer.date_debut && (
            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
              📅 Début: {new Date(offer.date_debut).toLocaleDateString('fr-FR')}
            </span>
          )}
          {offer.date_expiration && (
            <span className="flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
              ⏳ Expire: {new Date(offer.date_expiration).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-row md:flex-col items-center justify-end md:justify-center gap-3 md:border-l border-outline-variant/30 md:pl-4">
        <Link href={`/offres/${offer.id}`}>
          <motion.button
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-[0_10px_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_15px_30px_rgba(var(--primary-rgb),0.4)] transition-all"
          >
            Voir <ArrowRight className="w-3 h-3" />
          </motion.button>
        </Link>
        <motion.button
          onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
          whileHover={{ scale: 1.1, rotate: isSaved ? 0 : 15 }}
          whileTap={{ scale: 0.9 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isSaved ? 'bg-secondary text-white' : 'bg-surface-container-low hover:bg-secondary-container text-on-surface-variant'
          }`}
        >
          <motion.div animate={isSaved ? { scale: [1, 1.3, 1] } : {}}>
            <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
          </motion.div>
        </motion.button>
      </div>
    </motion.article>
  );
}
