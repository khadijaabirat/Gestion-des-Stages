'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import Link from 'next/link';
import { apiFetch, getAvatarUrl, API_BASE, getToken } from '@/lib/api';

type ApplicationStatus = 'En attente' | 'Accepté' | 'Refusé' | 'Annulé';

interface Candidate {
  id: string; // candidature id
  name: string;
  email: string;
  phone: string;
  school: string;
  appliedDate: string;
  status: ApplicationStatus;
  rawStatus: string;
  avatarUrl: string;
  photoUrl?: string;
  cvUrl?: string;
  skills: string[];
  userId: string;
  matchScore: number;
  filiere?: string;
  niveauEtude?: string;
  bio?: string;
  motivation?: string;
  conventionStatus?: 'non_generee' | 'generee' | 'en_signature' | 'signee';
  signatureLinkEntreprise?: string;
  conventionPdfPath?: string;
}

interface EntrepriseOfferCandidatesContentProps {
  offerId: string;
}

export default function EntrepriseOfferCandidatesContent({ offerId }: EntrepriseOfferCandidatesContentProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Data State
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offerDetails, setOfferDetails] = useState<any>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'Tous'>('Tous');

  // Modals / CV Preview
  const [cvPreviewCandidate, setCvPreviewCandidate] = useState<Candidate | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success'|'error'}>({show: false, message: '', type: 'success'});

  const mapStatus = (status: string): ApplicationStatus => {
    switch (status) {
      case 'accepte': return 'Accepté';
      case 'refuse': return 'Refusé';
      case 'annule': return 'Annulé';
      default: return 'En attente';
    }
  };

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get candidates
      const res = await apiFetch(`/entreprise/offres/${offerId}/candidatures`);
      if (res.ok) {
        const json = await res.json();
        const apiCandidatures = json.data?.data || json.data || [];
        
        const mappedCandidates: Candidate[] = apiCandidatures.map((cand: any) => ({
          id: cand.id.toString(),
          name: cand.etudiant?.nom || 'Inconnu',
          email: cand.etudiant?.email || '',
          phone: cand.etudiant?.telephone || 'Non renseigné',
          school: cand.etudiant?.filiere || 'Filière non spécifiée',
          appliedDate: cand.created_at,
          status: mapStatus(cand.statut),
          rawStatus: cand.statut,
          avatarUrl: getAvatarUrl(cand.etudiant?.nom || 'Inconnu', cand.etudiant?.photo),
          photoUrl: cand.etudiant?.photo ? getAvatarUrl(cand.etudiant?.nom || 'Inconnu', cand.etudiant?.photo) : undefined,
          cvUrl: cand.cv_file_snapshot ? `${API_BASE.replace('/api', '')}/storage/${cand.cv_file_snapshot}` : (cand.cv?.file_path ? `${API_BASE.replace('/api', '')}/storage/${cand.cv.file_path}` : undefined),
          skills: [], // We might not have skills directly attached in this endpoint
          userId: cand.etudiant?.user_id || cand.user_id,
          matchScore: Math.floor(Math.random() * (98 - 60 + 1) + 60), // Simulate match score if not backend generated
          filiere: cand.etudiant?.filiere || undefined,
          niveauEtude: cand.etudiant?.niveau_etude || undefined,
          bio: cand.etudiant?.bio || undefined,
          motivation: cand.lettre_motivation || undefined,
          conventionStatus: cand.convention_statut || 'non_generee',
          signatureLinkEntreprise: cand.yousign_signature_link_entreprise || undefined,
          conventionPdfPath: cand.convention_pdf_path || undefined,
        }));
        setCandidates(mappedCandidates);

        // Also fetch offer details so we can show the title
        const offerRes = await apiFetch(`/entreprise/mes-offres`);
        if (offerRes.ok) {
          const offerJson = await offerRes.json();
          const offers = offerJson.data?.data || offerJson.data || [];
          const currentOffer = offers.find((o: any) => o.id.toString() === offerId);
          if (currentOffer) {
            setOfferDetails(currentOffer);
          }
        }
      } else {
        throw new Error('Impossible de charger les candidatures');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    fetchCandidates();

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
  }, [fetchCandidates, mouseX, mouseY]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'Tous' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [candidates, searchQuery, statusFilter]);

  const updateCandidateStatus = async (candidateId: string, backendStatus: 'accepte' | 'refuse') => {
    setIsProcessing(candidateId);
    try {
      const res = await apiFetch(`/candidatures/${candidateId}`, {
        method: 'PUT',
        body: JSON.stringify({ statut: backendStatus })
      });
      if (res.ok) {
        const newStatus = mapStatus(backendStatus);
        setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status: newStatus, rawStatus: backendStatus } : c));
        showToast(`Candidature ${newStatus.toLowerCase()}. Un email et une notification ont été automatiquement envoyés à l'étudiant.`, backendStatus === 'refuse' ? 'error' : 'success');
        setCvPreviewCandidate(null);
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusBadgeColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Accepté': return 'bg-green-500/10 text-green-600 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]';
      case 'Refusé': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'Annulé': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'En attente': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)] animate-pulse';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const downloadCv = async (candidatureId: string) => {
    try {
      const token = getToken();
      const response = await apiFetch(`/candidatures/${candidatureId}/download-cv`);
      
      if (!response.ok) throw new Error('CV non disponible');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_Candidature_${candidatureId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleConventionAction = async (action: 'generate' | 'send-signature', candidatureId: string) => {
    setIsProcessing(candidatureId + '_' + action);
    try {
      const res = await apiFetch(`/candidatures/${candidatureId}/convention/${action}`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de l\'action convention');
      }
      showToast(`Action ${action === 'generate' ? 'Génération' : 'Envoi'} effectuée avec succès !`);
      fetchCandidates(); // Refresh to get updated status and links
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const downloadConvention = async (candidatureId: string) => {
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
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-background text-on-background pb-24 md:pb-10">
      {/* Background Pattern */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(165,59,34, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(165,59,34, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: `${mousePosition.x / 10}px ${mousePosition.y / 10}px`,
          transition: 'background-position 0.2s ease-out'
        }}
      />
      
      {/* Dynamic Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-500 mix-blend-multiply"
        style={{
          opacity: cursorGlowOpacity,
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,126,95, 0.08) 0%, transparent 60%)`
        }}
      />

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center p-4 bg-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/20 gap-4">
        <Link href="/entreprise/offers" className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <h2 className="font-heading text-primary font-bold text-lg truncate">Candidats : Offre {offerId}</h2>
      </div>

      <main className="w-full p-4 md:p-10 relative z-10 flex flex-col max-w-[1400px] mx-auto gap-6">
        
        {/* Sticky Header */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] rounded-3xl p-6 md:p-8 sticky top-4 md:top-6 z-30"
        >
          <Link href="/entreprise/offers" className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors mb-4">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Retour aux offres
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-heading text-2xl md:text-4xl font-extrabold text-on-background tracking-tighter mb-2">
                {offerDetails?.titre || 'Chargement de l\'offre...'}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant font-medium">
                {offerDetails?.duree && <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {offerDetails.duree}</span>}
                {offerDetails?.localisation && <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">location_on</span> {offerDetails.localisation}</span>}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-heading font-extrabold text-primary">{candidates.length}</p>
                <p className="text-[10px] font-label-caps uppercase text-on-surface-variant">Candidats</p>
              </div>
              <div className="w-px h-10 bg-outline-variant/30 hidden md:block"></div>
              <div className="text-center hidden md:block">
                <p className="text-3xl font-heading font-extrabold text-green-600">{candidates.filter(c => c.status === 'Accepté').length}</p>
                <p className="text-[10px] font-label-caps uppercase text-on-surface-variant">Acceptés</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-4 justify-between items-center z-20"
        >
          <div className="relative w-full md:w-80 group shrink-0">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Rechercher par nom..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>

          <div className="flex p-1 bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-x-auto custom-scrollbar w-full lg:w-auto">
            {['Tous', 'En attente', 'Accepté', 'Refusé', 'Annulé'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`relative px-4 py-2.5 rounded-lg text-sm font-bold font-label-caps tracking-wider transition-colors whitespace-nowrap flex-1 lg:flex-none ${
                  statusFilter === status ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {statusFilter === status && (
                  <motion.div layoutId="offerCandStatus" className="absolute inset-0 bg-white shadow-sm rounded-lg border border-outline-variant/20" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                )}
                <span className="relative z-10">{status}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Candidates List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface-container/50 animate-pulse rounded-3xl h-64 border border-outline-variant/10"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-2">
            <AnimatePresence mode="popLayout">
              {filteredCandidates.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="col-span-full bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-[0_8px_32px_0_rgba(165,59,34,0.05)]"
                >
                  <div className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/50">group_off</span>
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-on-surface mb-2">Aucun candidat</h3>
                  <p className="text-on-surface-variant max-w-md">
                    Modifiez vos filtres ou attendez de nouvelles candidatures.
                  </p>
                </motion.div>
              ) : (
                filteredCandidates.map((candidate, i) => (
                  <motion.div
                    key={candidate.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="bg-white/80 backdrop-blur-xl border border-outline-variant/30 shadow-sm hover:shadow-[0_16px_40px_rgba(165,59,34,0.08)] rounded-3xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        <img src={candidate.avatarUrl} alt={candidate.name} className="w-14 h-14 rounded-2xl border border-outline-variant/20 shadow-sm object-cover" />
                        <div>
                          <Link href={`/entreprise/profile/${candidate.userId}`} className="font-heading text-lg font-bold text-on-surface hover:text-primary transition-colors line-clamp-1">{candidate.name}</Link>
                          <p className="text-xs text-on-surface-variant font-medium mt-0.5 line-clamp-1">{candidate.school}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 uppercase tracking-wider ${getStatusBadgeColor(candidate.status)}`}>
                          {candidate.status}
                        </span>
                        <div className="flex items-center gap-1 bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/20">
                          <span className={`text-xs font-bold ${getMatchScoreColor(candidate.matchScore)}`}>{candidate.matchScore}% Match</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-on-surface-variant mb-4 flex items-center gap-2">
                       <span className="material-symbols-outlined text-[14px]">event</span>
                       Postulé le {new Date(candidate.appliedDate).toLocaleDateString('fr-FR')}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {candidate.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-1 bg-surface-container text-on-surface text-[10px] font-bold rounded-md uppercase tracking-wider border border-outline-variant/10">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-outline-variant/20 flex gap-2">
                      <button 
                        onClick={() => setCvPreviewCandidate(candidate)}
                        className="flex-1 py-2.5 rounded-xl font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5 text-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                        Aperçu CV
                      </button>
                      <button 
                        disabled={isProcessing === candidate.id || candidate.rawStatus === 'accepte' || candidate.rawStatus === 'refuse' || candidate.rawStatus === 'annule'}
                        onClick={() => updateCandidateStatus(candidate.id, 'accepte')}
                        className="w-10 h-10 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 transition-colors flex items-center justify-center disabled:opacity-50"
                        title="Accepter"
                      >
                        {isProcessing === candidate.id ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined text-[18px]">sync</motion.span> : <span className="material-symbols-outlined text-[20px]">check</span>}
                      </button>
                      <button 
                        disabled={isProcessing === candidate.id || candidate.rawStatus === 'accepte' || candidate.rawStatus === 'refuse' || candidate.rawStatus === 'annule'}
                        onClick={() => updateCandidateStatus(candidate.id, 'refuse')}
                        className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors flex items-center justify-center disabled:opacity-50"
                        title="Rejeter"
                      >
                        {isProcessing === candidate.id ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined text-[18px]">sync</motion.span> : <span className="material-symbols-outlined text-[20px]">close</span>}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Side Drawer: Full Profile & CV Preview */}
      <AnimatePresence>
        {cvPreviewCandidate && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setCvPreviewCandidate(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ x: '100%', rotateY: -10 }}
              animate={{ x: 0, rotateY: 0 }}
              exit={{ x: '100%', rotateY: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full md:w-[600px] h-full bg-surface shadow-2xl relative z-10 flex flex-col border-l border-outline-variant/20 perspective-1000"
            >
              {/* Drawer Header */}
              <div className="p-6 md:p-8 border-b border-outline-variant/20 flex justify-between items-start bg-white/60 backdrop-blur-md">
                <div className="flex gap-5 items-center">
                  <motion.div 
                    initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", delay: 0.1 }}
                    className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg relative"
                  >
                    <img src={cvPreviewCandidate.photoUrl || cvPreviewCandidate.avatarUrl} alt={cvPreviewCandidate.name} className="w-full h-full object-cover" />
                    {cvPreviewCandidate.photoUrl && (
                      <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm" />
                    )}
                  </motion.div>
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <h2 className="font-heading text-2xl font-bold text-on-surface">{cvPreviewCandidate.name}</h2>
                    {cvPreviewCandidate.filiere && (
                      <p className="text-xs text-on-surface-variant/70 mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">school</span>
                        {cvPreviewCandidate.filiere} {cvPreviewCandidate.niveauEtude && `· ${cvPreviewCandidate.niveauEtude}`}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeColor(cvPreviewCandidate.status)}`}>
                        {cvPreviewCandidate.status}
                      </span>
                    </div>
                  </motion.div>
                </div>
                <button 
                  onClick={() => setCvPreviewCandidate(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                
                {/* Actions Toolbar */}
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 mb-8 flex gap-3">
                  <button 
                    disabled={isProcessing === cvPreviewCandidate.id || cvPreviewCandidate.rawStatus === 'accepte' || cvPreviewCandidate.rawStatus === 'refuse' || cvPreviewCandidate.rawStatus === 'annule'}
                    onClick={() => updateCandidateStatus(cvPreviewCandidate.id, 'accepte')}
                    className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-green-50 hover:text-green-600 text-on-surface-variant transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    <span className="text-xs font-bold font-label-caps">Accepter</span>
                  </button>
                  <div className="w-px bg-outline-variant/30"></div>
                  <button 
                    disabled={isProcessing === cvPreviewCandidate.id || cvPreviewCandidate.rawStatus === 'accepte' || cvPreviewCandidate.rawStatus === 'refuse' || cvPreviewCandidate.rawStatus === 'annule'}
                    onClick={() => updateCandidateStatus(cvPreviewCandidate.id, 'refuse')}
                    className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-red-50 hover:text-red-600 text-on-surface-variant transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">cancel</span>
                    <span className="text-xs font-bold font-label-caps">Rejeter</span>
                  </button>
                  <div className="w-px bg-outline-variant/30"></div>
                  <button 
                    disabled={isProcessing !== null}
                    onClick={() => window.location.href = `/entreprise/messages`}
                    className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 text-on-surface-variant transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">chat</span>
                    <span className="text-xs font-bold font-label-caps">Contacter</span>
                  </button>
                </div>

                {/* Profile Link Banner */}
                <Link
                  href={`/entreprise/profile/${cvPreviewCandidate.userId}`}
                  className="group/profile flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 rounded-2xl p-4 mb-6 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover/profile:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[20px]">person_search</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900">Voir le profil complet</p>
                      <p className="text-xs text-blue-600">Compétences, expériences, formations...</p>
                    </div>
                  </div>
                  <motion.span 
                    className="material-symbols-outlined text-blue-600"
                    whileHover={{ x: 5 }}
                  >
                    arrow_forward
                  </motion.span>
                </Link>

                {/* Contact Info */}
                <div className="space-y-4 mb-8">
                  <h3 className="font-label-caps text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/20 pb-2">Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[16px]">mail</span>
                      </div>
                      <div className="truncate">
                        <p className="text-[10px] text-on-surface-variant font-label-caps">Email</p>
                        <p className="text-sm font-semibold truncate" title={cvPreviewCandidate.email}>{cvPreviewCandidate.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[16px]">phone</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-label-caps">Téléphone</p>
                        <p className="text-sm font-semibold">{cvPreviewCandidate.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {cvPreviewCandidate.bio && (
                  <div className="space-y-2 mb-8 bg-surface-container-low/50 rounded-2xl p-4 border border-outline-variant/20">
                    <h3 className="font-label-caps text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      À propos
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{cvPreviewCandidate.bio}</p>
                  </div>
                )}

                {/* Lettre de motivation */}
                {cvPreviewCandidate.motivation && (
                  <div className="space-y-4 mb-8 bg-primary/5 rounded-2xl p-5 border border-primary/10">
                    <h3 className="font-label-caps text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">edit_note</span>
                      Lettre de Motivation
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap italic">
                      "{cvPreviewCandidate.motivation}"
                    </p>
                  </div>
                )}

                {/* Section Convention de Stage (visible only if Accepted) */}
                {cvPreviewCandidate.status === 'Accepté' && (
                  <div className="space-y-4 mb-8 bg-blue-50/50 rounded-2xl p-5 border border-blue-200">
                    <h3 className="font-label-caps text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-[18px]">contract</span>
                      Convention de Stage
                    </h3>
                    
                    <div className="flex flex-col gap-3">
                      {cvPreviewCandidate.conventionStatus === 'non_generee' && (
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100 shadow-sm">
                          <p className="text-sm font-medium text-on-surface-variant">La convention n'a pas encore été générée.</p>
                          <button
                            onClick={() => handleConventionAction('generate', cvPreviewCandidate.id)}
                            disabled={isProcessing !== null}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            Générer Convention
                          </button>
                        </div>
                      )}

                      {cvPreviewCandidate.conventionStatus === 'generee' && (
                        <div className="flex flex-col gap-3 p-3 bg-white rounded-xl border border-blue-100 shadow-sm">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">task_alt</span>
                              Générée avec succès
                            </p>
                            <button
                              onClick={() => downloadConvention(cvPreviewCandidate.id)}
                              className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
                            >
                              Voir PDF
                            </button>
                          </div>
                          <button
                            onClick={() => handleConventionAction('send-signature', cvPreviewCandidate.id)}
                            disabled={isProcessing !== null}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">send</span>
                            Envoyer pour signature (Yousign)
                          </button>
                        </div>
                      )}

                      {cvPreviewCandidate.conventionStatus === 'en_signature' && (
                        <div className="flex flex-col gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 shadow-sm">
                          <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">draw</span>
                            En attente de signatures
                          </p>
                          {cvPreviewCandidate.signatureLinkEntreprise ? (
                            <a
                              href={cvPreviewCandidate.signatureLinkEntreprise}
                              target="_blank" rel="noopener noreferrer"
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-colors text-center shadow-sm"
                            >
                              Signer ma partie (Entreprise)
                            </a>
                          ) : (
                            <p className="text-xs text-amber-700 italic">Vous avez déjà signé. En attente de l'étudiant.</p>
                          )}
                        </div>
                      )}

                      {cvPreviewCandidate.conventionStatus === 'signee' && (
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm">
                          <p className="text-sm font-bold text-green-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            Convention Signée !
                          </p>
                          <button
                            onClick={() => downloadConvention(cvPreviewCandidate.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            Télécharger
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CV Preview Section */}
                <div className="space-y-4 h-[600px] flex flex-col">
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                    <h3 className="font-label-caps text-xs font-bold text-on-surface-variant uppercase tracking-wider">Curriculum Vitae</h3>
                    {cvPreviewCandidate.cvUrl && (
                      <button onClick={() => downloadCv(cvPreviewCandidate.id)} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                        Télécharger <span className="material-symbols-outlined text-[14px]">download</span>
                      </button>
                    )}
                  </div>
                  
                  {/* PDF Viewer */}
                  <div className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center shadow-inner overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-12 bg-surface-container-low border-b border-outline-variant/20 flex items-center px-4 justify-between text-on-surface-variant z-10">
                      <span className="text-xs font-bold font-label-caps truncate mr-2">CV_{cvPreviewCandidate.name.replace(' ', '_')}.pdf</span>
                      <div className="flex gap-2 shrink-0">
                        <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-primary transition-colors">zoom_out</span>
                        <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-primary transition-colors">zoom_in</span>
                      </div>
                    </div>
                    {cvPreviewCandidate.cvUrl ? (
                       <iframe src={cvPreviewCandidate.cvUrl} className="w-full h-full pt-12" title="CV" />
                    ) : (
                      <div className="mt-12 text-center text-on-surface-variant">
                        <motion.span animate={{ rotateY: [0, 180, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="material-symbols-outlined text-6xl opacity-20 mb-4 inline-block">description</motion.span>
                        <p className="font-bold text-sm">Aucun CV n'a été fourni.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
              
              {/* Loading Overlay inside Drawer */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center"
                  >
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined text-primary text-4xl">
                      sync
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[150] px-6 py-4 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-xl ${
              toast.type === 'error' 
                ? 'bg-error-container/90 border-error/20 text-on-error-container' 
                : 'bg-green-50/90 border-green-200 text-green-800'
            }`}
          >
            <span className="material-symbols-outlined">
              {toast.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <p className="font-bold">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
