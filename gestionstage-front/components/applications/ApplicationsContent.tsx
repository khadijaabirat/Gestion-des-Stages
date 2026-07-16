'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, FileText, Building2, MapPin, Clock, CheckCircle, XCircle, MinusCircle, RotateCcw, Trash2, ChevronDown } from 'lucide-react';
import { apiFetch, extractArray, authHeaders, API_BASE, getAvatarUrl } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Candidature {
  id: number;
  statut: 'en_attente' | 'accepte' | 'refuse' | 'annule';
  lettre_motivation: string | null;
  convention_statut?: 'non_generee' | 'generee' | 'en_signature' | 'signee';
  convention_pdf_path?: string;
  yousign_signature_link_etudiant?: string;
  created_at: string;
  updated_at: string;
  offreStage?: {
    id: number;
    titre: string;
    localisation: string;
    duree: string;
    remuneration: string | null;
    entreprise?: {
      id: number;
      nom: string;
      photo?: string;
    };
  };
}

const STATUS_CONFIG = {
  en_attente: {
    label: 'En attente',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    icon: Clock,
    dot: 'bg-amber-400',
  },
  accepte: {
    label: 'Acceptée',
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    icon: CheckCircle,
    dot: 'bg-green-400',
  },
  refuse: {
    label: 'Refusée',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    icon: XCircle,
    dot: 'bg-red-400',
  },
  annule: {
    label: 'Annulée',
    color: 'text-gray-500',
    bg: 'bg-gray-50 border-gray-200',
    icon: MinusCircle,
    dot: 'bg-gray-400',
  },
};

export default function ApplicationsContent() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'en_attente' | 'accepte' | 'refuse' | 'annule'>('all');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchCandidatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch('/candidatures');
      if (!res.ok) throw new Error('Erreur de chargement');
      const data = await res.json();
      setCandidatures(extractArray(data));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidatures();
  }, [fetchCandidatures]);

  const handleCancel = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette candidature ?')) return;
    try {
      setCancellingId(id);
      const res = await apiFetch(`/candidatures/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ statut: 'annule' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de l\'annulation');
      }
      setCandidatures(prev =>
        prev.map(c => c.id === id ? { ...c, statut: 'annule' } : c)
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const signConvention = async (candidatureId: number) => {
    try {
      const res = await apiFetch(`/candidatures/${candidatureId}/convention/status`);
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      if (data.signature_link) {
        window.open(data.signature_link, '_blank');
      } else {
        toast.error('Lien de signature non disponible.');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const downloadConvention = async (candidatureId: number) => {
    try {
      const response = await apiFetch(`/candidatures/${candidatureId}/convention/download`);
      if (!response.ok) throw new Error('Convention non disponible');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Convention_Stage_${candidatureId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleTabChange = (key: 'all' | 'en_attente' | 'accepte' | 'refuse' | 'annule') => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const TABS = [
    { key: 'all', label: 'Toutes', count: candidatures.length },
    { key: 'en_attente', label: 'En attente', count: candidatures.filter(c => c.statut === 'en_attente').length },
    { key: 'accepte', label: 'Acceptées', count: candidatures.filter(c => c.statut === 'accepte').length },
    { key: 'refuse', label: 'Refusées', count: candidatures.filter(c => c.statut === 'refuse').length },
    { key: 'annule', label: 'Annulées', count: candidatures.filter(c => c.statut === 'annule').length },
  ] as const;

  const filtered = activeTab === 'all' ? candidatures : candidatures.filter(c => c.statut === activeTab);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedFiltered = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: candidatures.length,
    accepte: candidatures.filter(c => c.statut === 'accepte').length,
    en_attente: candidatures.filter(c => c.statut === 'en_attente').length,
    refuse: candidatures.filter(c => c.statut === 'refuse').length,
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (endPage - startPage < 4) {
      if (startPage === 1) endPage = Math.min(totalPages, 5);
      else startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => { setCurrentPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`w-10 h-10 rounded-xl font-bold transition-all shadow-sm ${currentPage === i ? 'bg-primary text-white shadow-primary/20 shadow-md scale-105' : 'bg-surface-container text-on-surface hover:bg-surface-variant'}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-10 gap-2 pb-8">
        <button 
          onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
          disabled={currentPage === 1}
          className="px-4 py-2.5 bg-surface-container text-on-surface font-semibold rounded-xl disabled:opacity-40 hover:bg-surface-variant transition-colors shadow-sm"
        >
          Précédent
        </button>
        <div className="flex items-center gap-1.5 mx-2 hidden sm:flex">
          {startPage > 1 && <span className="text-on-surface-variant font-bold">...</span>}
          {pages}
          {endPage < totalPages && <span className="text-on-surface-variant font-bold">...</span>}
        </div>
        <button 
          onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
          disabled={currentPage === totalPages}
          className="px-4 py-2.5 bg-surface-container text-on-surface font-semibold rounded-xl disabled:opacity-40 hover:bg-surface-variant transition-colors shadow-sm"
        >
          Suivant
        </button>
      </div>
    );
  };

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-background">
      {/* Static ambient gradient */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none z-0 opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(165,59,34, 0.1) 0%, transparent 70%)' }}
      />

      <main className="w-full pt-4 md:pt-6 p-4 md:p-8 pb-24 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface font-heading tracking-tight mb-2">
              Mes Candidatures
            </h1>
            <p className="text-on-surface-variant">
              Suivez en temps réel l&apos;avancement de vos candidatures de stage.
            </p>
          </motion.div>

          {/* Stats Cards */}
          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              {[
                { label: 'Total', value: stats.total, icon: FileText, color: 'primary' },
                { label: 'En attente', value: stats.en_attente, icon: Clock, color: 'secondary' },
                { label: 'Acceptées', value: stats.accepte, icon: CheckCircle, color: 'green' },
                { label: 'Refusées', value: stats.refuse, icon: XCircle, color: 'error' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="glass-panel rounded-2xl p-5 shadow-lg"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{stat.label}</p>
                  <p className={`text-3xl font-extrabold text-${stat.color === 'green' ? 'green-600' : stat.color}`}>
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-2 mb-6">
            {TABS.map(tab => (
              <motion.button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as any)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'bg-white/60 text-on-surface-variant hover:bg-white/80'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Loader2 className="w-10 h-10 text-primary" />
              </motion.div>
              <p className="text-on-surface-variant">Chargement de vos candidatures...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <AlertCircle className="w-12 h-12 text-error" />
              <p className="text-on-surface-variant">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={fetchCandidatures}
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold"
              >
                <RotateCcw className="w-4 h-4" /> Réessayer
              </motion.button>
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel rounded-2xl p-16 text-center shadow-xl"
            >
              <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-on-surface-variant" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">
                {activeTab === 'all' ? 'Aucune candidature' : `Aucune candidature ${TABS.find(t => t.key === activeTab)?.label.toLowerCase()}`}
              </h3>
              <p className="text-on-surface-variant mb-6">
                {activeTab === 'all' ? 'Commencez à postuler pour voir vos candidatures ici.' : 'Essayez un autre filtre.'}
              </p>
              {activeTab === 'all' && (
                <a href="/etudiant/offres">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-semibold"
                  >
                    Explorer les offres →
                  </motion.button>
                </a>
              )}
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {paginatedFiltered.map((candidature, index) => (
                  <CandidatureCard
                    key={candidature.id}
                    candidature={candidature}
                    index={index}
                    onCancel={handleCancel}
                    isCancelling={cancellingId === candidature.id}
                    onDownloadConvention={downloadConvention}
                    onSignConvention={signConvention}
                  />
                ))}
              </div>
              {renderPagination()}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}

function CandidatureCard({
  candidature,
  index,
  onCancel,
  isCancelling,
  onDownloadConvention,
  onSignConvention,
}: {
  candidature: Candidature;
  index: number;
  onCancel: (id: number) => void;
  isCancelling: boolean;
  onDownloadConvention: (id: number) => void;
  onSignConvention: (id: number) => void;
}) {
  const [showMotivation, setShowMotivation] = useState(false);
  const config = STATUS_CONFIG[candidature.statut] || STATUS_CONFIG.annule;
  const StatusIcon = config.icon;
  // @ts-ignore
  const offre = candidature.offreStage || candidature.offre_stage;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.005 }}
      className="glass-panel rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative"
    >
      {/* Shimmer */}
      <motion.div
        initial={{ x: '-100%' }}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.7 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none"
      />

      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Company Logo */}
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
          <img
            src={offre?.entreprise?.photo ? `http://localhost:8000${offre.entreprise.photo}` : getAvatarUrl(offre?.entreprise?.nom || 'Stage')}
            alt={offre?.entreprise?.nom}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-on-surface truncate mb-1">
            {offre?.titre || 'Offre supprimée'}
          </h3>
          <p className="text-primary font-semibold text-sm flex items-center gap-1 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            {offre?.entreprise?.nom || 'Entreprise'}
          </p>
          <div className="flex flex-wrap gap-2">
            {offre?.localisation && (
              <span className="flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded-lg">
                <MapPin className="w-3 h-3" /> {offre.localisation}
              </span>
            )}
            {offre?.duree && (
              <span className="flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded-lg">
                <Clock className="w-3 h-3" /> {offre.duree}
              </span>
            )}
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${config.bg} ${config.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
          </span>

          <p className="text-xs text-on-surface-variant">
            {new Date(candidature.created_at).toLocaleDateString('fr-FR')}
          </p>

          {candidature.statut === 'en_attente' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCancel(candidature.id)}
              disabled={isCancelling}
              className="flex items-center gap-1.5 text-xs font-semibold text-error bg-error/10 hover:bg-error hover:text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-60"
            >
              {isCancelling ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
              Annuler
            </motion.button>
          )}
        </div>
      </div>

      {/* Motivation Expandable */}
      {candidature.lettre_motivation && (
        <div className="mt-4 pt-4 border-t border-outline-variant/20">
          <button
            onClick={() => setShowMotivation(!showMotivation)}
            className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showMotivation ? 'rotate-180' : ''}`} />
            Lettre de motivation
          </button>
          <AnimatePresence>
            {showMotivation && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-sm text-on-surface-variant leading-relaxed"
              >
                {candidature.lettre_motivation}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Convention de Stage Block */}
      {candidature.statut === 'accepte' && (
        <div className="mt-4 pt-4 border-t border-outline-variant/20">
          <div className="flex flex-col gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4" />
              Convention de Stage
            </h4>
            
            {(!candidature.convention_statut || candidature.convention_statut === 'non_generee' || candidature.convention_statut === 'generee') && (
              <p className="text-xs text-blue-700">En attente de génération par l'entreprise.</p>
            )}

            {candidature.convention_statut === 'en_signature' && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-amber-700 font-medium">L'entreprise a envoyé la convention. Elle est en attente de votre signature.</p>
                <button
                  onClick={() => onSignConvention(candidature.id)}
                  className="w-fit bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  Signer ma convention (Yousign)
                </button>
              </div>
            )}

            {candidature.convention_statut === 'signee' && (
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-green-700 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Convention Signée
                </p>
                <button
                  onClick={() => onDownloadConvention(candidature.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                >
                  Télécharger le PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
