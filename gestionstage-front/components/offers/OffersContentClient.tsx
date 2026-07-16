'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock, Bookmark, ChevronDown, Loader2, AlertCircle, ArrowRight, Building2, X, Map, List } from 'lucide-react';
import { apiFetch, extractArray, getAvatarUrl } from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const OffersMap = dynamic(() => import('./OffersMap'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-surface-variant/30 rounded-2xl animate-pulse flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
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

const DUREES = ['1 mois', '2 mois', '3 mois', '4 mois', '5 mois', '6 mois', '+6 mois'];

interface OffersContentProps {
  initialOffers?: Offer[];
  initialPagination?: {
    total: number;
    next_page_url: string | null;
    current_page: number;
    last_page?: number;
  };
}

export default function OffersContentClient({ initialOffers = [], initialPagination }: OffersContentProps) {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [loading, setLoading] = useState(!initialOffers.length);
  const [error, setError] = useState<string | null>(null);
  const [savedOffers, setSavedOffers] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const meta = (initialPagination as any)?.meta || initialPagination;
  const [page, setPage] = useState(meta?.current_page || 1);
  const [totalOffers, setTotalOffers] = useState(meta?.total || 0);
  const [lastPage, setLastPage] = useState(meta?.last_page || Math.ceil((meta?.total || 0) / 10) || 1);
  const [allOffers, setAllOffers] = useState<Offer[]>(initialOffers);
  const [filters, setFilters] = useState<Filters>({ search: '', localisation: '', duree: '' });
  const [activeFilters, setActiveFilters] = useState<Filters>({ search: '', localisation: '', duree: '' });
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== filters.search) {
      setFilters(prev => ({ ...prev, search: q }));
      setActiveFilters(prev => ({ ...prev, search: q }));
    }
  }, [searchParams]);

  const fetchAllOffers = useCallback(async (currentFilters: Filters) => {
    try {
      const params = new URLSearchParams({ per_page: 'all' });
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.localisation) params.append('localisation', currentFilters.localisation);
      if (currentFilters.duree) params.append('duree', currentFilters.duree);

      const res = await apiFetch(`/offres-stage?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAllOffers(extractArray(data));
      }
    } catch (err) {
      console.error('Erreur lors du chargement de toutes les offres pour la carte', err);
    }
  }, []);

  const fetchOffers = useCallback(async (pageNum: number, currentFilters: Filters) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ page: String(pageNum) });
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.localisation) params.append('localisation', currentFilters.localisation);
      if (currentFilters.duree) params.append('duree', currentFilters.duree);

      const res = await apiFetch(`/offres-stage?${params}`);
      if (!res.ok) throw new Error('Erreur de chargement des offres');

      const data = await res.json();
      const newOffers = extractArray(data);
      const pagination = data?.meta || data?.data || data;

      const total = pagination?.total || newOffers.length;
      setTotalOffers(total);
      
      let computedLastPage = pagination?.last_page;
      if (!computedLastPage && total > 0) computedLastPage = Math.ceil(total / 10);
      setLastPage(computedLastPage || 1);
      
      setOffers(newOffers);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialOffers.length > 0 && !activeFilters.search && !activeFilters.localisation && !activeFilters.duree && page === 1) {
      setLoading(false);
      fetchAllOffers(activeFilters);
      return;
    }
    fetchOffers(1, activeFilters);
    fetchAllOffers(activeFilters);
    setPage(1);
  }, [activeFilters, fetchOffers, fetchAllOffers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilters({ ...filters });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > lastPage) return;
    setPage(newPage);
    fetchOffers(newPage, activeFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSave = (id: number) => {
    setSavedOffers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearFilter = (key: keyof Filters) => {
    const updated = { ...activeFilters, [key]: '' };
    setActiveFilters(updated);
    setFilters(updated);
  };

  const sortedOffers = [...offers].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'date_debut') {
      if (!a.date_debut) return 1;
      if (!b.date_debut) return -1;
      return new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime();
    }
    if (sortBy === 'remuneration') return (b.remuneration ? 1 : 0) - (a.remuneration ? 1 : 0);
    return 0;
  });

  const renderPagination = () => {
    if (lastPage <= 1) return null;
    const pages = [];
    
    // Simple pagination logic (shows up to 5 buttons)
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(lastPage, page + 2);
    if (endPage - startPage < 4) {
      if (startPage === 1) endPage = Math.min(lastPage, 5);
      else startPage = Math.max(1, lastPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 rounded-xl font-bold transition-all shadow-sm ${page === i ? 'bg-primary text-white shadow-primary/20 shadow-md scale-105' : 'bg-surface-container text-on-surface hover:bg-surface-variant'}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-10 gap-2">
        <button 
          onClick={() => handlePageChange(page - 1)} 
          disabled={page === 1}
          className="px-4 py-2.5 bg-surface-container text-on-surface font-semibold rounded-xl disabled:opacity-40 hover:bg-surface-variant transition-colors shadow-sm flex items-center"
        >
          Précédent
        </button>
        <div className="flex items-center gap-1.5 mx-2 hidden sm:flex">
          {startPage > 1 && <span className="text-on-surface-variant font-bold">...</span>}
          {pages}
          {endPage < lastPage && <span className="text-on-surface-variant font-bold">...</span>}
        </div>
        <button 
          onClick={() => handlePageChange(page + 1)} 
          disabled={page === lastPage}
          className="px-4 py-2.5 bg-surface-container text-on-surface font-semibold rounded-xl disabled:opacity-40 hover:bg-surface-variant transition-colors shadow-sm flex items-center"
        >
          Suivant
        </button>
      </div>
    );
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v).length;

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-background">
      {/* Static ambient gradients — no animation */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none z-0 opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(165,59,34,0.15) 0%, transparent 70%)' }}
      />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none z-0 opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(86,68,208,0.12) 0%, transparent 70%)' }}
      />

      <main className="w-full pt-4 md:pt-6 p-4 md:p-8 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold text-on-background mb-2 font-heading tracking-tight">
              Explorez l&apos;avenir.{' '}
              <span className="text-primary">Trouvez votre stage.</span>
            </h1>
            <p className="text-on-surface-variant text-lg">
              {totalOffers > 0 ? `${totalOffers} offres disponibles` : 'Découvrez les meilleures opportunités de stage'}
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="glass-panel rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3 shadow-xl">
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
                {DUREES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
            >
              <Search className="w-4 h-4" />
              Rechercher
            </button>
          </form>

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
                    <button onClick={() => clearFilter('search')}><X className="w-3 h-3 ml-1" /></button>
                  </span>
                )}
                {activeFilters.localisation && (
                  <span className="flex items-center gap-1 bg-secondary/10 text-secondary text-sm font-medium px-3 py-1.5 rounded-full">
                    <MapPin className="w-3 h-3" /> {activeFilters.localisation}
                    <button onClick={() => clearFilter('localisation')}><X className="w-3 h-3 ml-1" /></button>
                  </span>
                )}
                {activeFilters.duree && (
                  <span className="flex items-center gap-1 bg-tertiary/10 text-tertiary text-sm font-medium px-3 py-1.5 rounded-full">
                    <Clock className="w-3 h-3" /> {activeFilters.duree}
                    <button onClick={() => clearFilter('duree')}><X className="w-3 h-3 ml-1" /></button>
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
            <h3 className="text-xl font-bold text-on-surface">
              {loading ? 'Chargement...' : <>Résultats <span className="text-primary">({totalOffers})</span></>}
            </h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-surface-variant/30 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                  title="Vue liste"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                  title="Vue carte"
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                <span>Trier par:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 cursor-pointer font-semibold text-primary outline-none"
                >
                  <option value="recent">Plus récent</option>
                  <option value="date_debut">Date de début</option>
                  <option value="remuneration">Rémunéré</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col gap-4 mt-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-panel rounded-2xl p-5 flex gap-4 animate-pulse">
                  <div className="w-16 h-16 rounded-xl bg-surface-variant/30 shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-5 bg-surface-variant/30 rounded-full w-1/2" />
                    <div className="h-3 bg-surface-variant/30 rounded-full w-3/4" />
                    <div className="h-3 bg-surface-variant/30 rounded-full w-5/6" />
                    <div className="flex gap-2 pt-1">
                      <div className="h-6 bg-surface-variant/30 rounded-lg w-20" />
                      <div className="h-6 bg-surface-variant/30 rounded-lg w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <AlertCircle className="w-12 h-12 text-error" />
              <p className="text-on-surface-variant">{error}</p>
              <button
                onClick={() => fetchOffers(1, activeFilters)}
                className="bg-primary text-white px-6 py-3 rounded-xl font-semibold"
              >
                Réessayer
              </button>
            </div>
          ) : sortedOffers.length === 0 ? (
            <div className="glass-panel rounded-2xl p-16 text-center">
              <Search className="w-10 h-10 text-on-surface-variant mx-auto mb-4" />
              <h3 className="text-xl font-bold text-on-surface mb-2">Aucune offre trouvée</h3>
              <p className="text-on-surface-variant">Essayez d&apos;autres critères de recherche.</p>
            </div>
          ) : (
            <>
              {viewMode === 'map' ? (
                <div className="mt-4 fade-in">
                  <OffersMap offers={allOffers.length > 0 ? allOffers : sortedOffers} />
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4">
                    {sortedOffers.map((offer, index) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        index={index}
                        isSaved={savedOffers.has(offer.id)}
                        onToggleSave={() => toggleSave(offer.id)}
                      />
                    ))}
                  </div>
                  {renderPagination()}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function OfferCard({ offer, index, isSaved, onToggleSave }: {
  offer: Offer;
  index: number;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const isNew = new Date().getTime() - new Date(offer.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;
  const logoUrl = offer.entreprise?.photo
    ? `http://localhost:8000${offer.entreprise.photo}`
    : getAvatarUrl(offer.entreprise?.nom || 'Stage');

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}
      className="group glass-panel rounded-2xl p-5 flex flex-col md:flex-row gap-5 relative overflow-hidden shadow-md hover:shadow-xl hover:border-primary/20 transition-all duration-200"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0 shadow-sm">
        <img src={logoUrl} alt={offer.entreprise?.nom || 'Entreprise'} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h4 className="text-lg font-bold text-on-surface line-clamp-1">{offer.titre}</h4>
            {isNew && (
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full ml-2 shrink-0">
                Nouveau
              </span>
            )}
          </div>
          <p className="text-primary font-semibold mb-2 flex items-center gap-1 text-sm">
            <Building2 className="w-3.5 h-3.5" />
            {offer.entreprise?.nom || 'Entreprise'}
          </p>
          <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">{offer.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {offer.localisation && (
            <span className="flex items-center gap-1 bg-surface-container-low text-on-surface-variant text-xs font-medium px-2.5 py-1 rounded-lg">
              <MapPin className="w-3 h-3" /> {offer.localisation}
            </span>
          )}
          {offer.duree && (
            <span className="flex items-center gap-1 bg-surface-container-low text-on-surface-variant text-xs font-medium px-2.5 py-1 rounded-lg">
              <Clock className="w-3 h-3" /> {offer.duree}
            </span>
          )}
          {offer.remuneration && (
            <span className="flex items-center gap-1 bg-secondary/10 text-secondary text-xs font-medium px-2.5 py-1 rounded-lg">
              💰 {offer.remuneration}
            </span>
          )}
          {offer.date_debut && (
            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-lg">
              📅 {new Date(offer.date_debut).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-row md:flex-col items-center justify-end md:justify-center gap-3 md:border-l border-outline-variant/30 md:pl-4 shrink-0">
        <Link href={`/offres/${offer.id}`}>
          <button className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-md">
            Voir <ArrowRight className="w-3 h-3" />
          </button>
        </Link>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            isSaved ? 'bg-secondary text-white' : 'bg-surface-container-low hover:bg-secondary-container text-on-surface-variant'
          }`}
        >
          <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>
    </motion.article>
  );
}
