'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type ApplicationStatus = 'En attente' | 'En cours d\'examen' | 'Accepté' | 'Rejeté';

interface Candidate {
  id: string;
  etudiantId: string;
  name: string;
  email: string;
  phone: string;
  filiere?: string;
  niveauEtude?: string;
  bio?: string;
  appliedDate: string;
  status: ApplicationStatus;
  matchScore: number;
  avatarUrl: string;
  photoUrl?: string;
  cvUrl?: string;
  offerId: string;
  offerTitle: string;
  motivation?: string;
  conventionStatus?: 'non_generee' | 'generee' | 'en_signature' | 'signee';
  signatureLinkEntreprise?: string;
  conventionPdfPath?: string;
}

// 3D Card for Candidates
const CandidateCard3D = ({ candidate, getStatusBadgeColor, getMatchScoreColor, setSelectedCandidate }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
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
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      onClick={() => setSelectedCandidate(candidate)}
      className="perspective-1000 cursor-pointer"
    >
      <div 
        className="bg-white/80 backdrop-blur-xl border border-outline-variant/30 shadow-sm hover:shadow-[0_20px_50px_rgba(165,59,34,0.12)] rounded-3xl p-6 flex flex-col transition-shadow duration-300 relative overflow-hidden group h-full"
        style={{ transform: "translateZ(20px)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-3xl" />
        
        <div className="flex justify-between items-start gap-4 relative z-10" style={{ transform: "translateZ(30px)" }}>
          <div className="flex gap-4 items-center">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-md shrink-0 relative"
            >
              <img src={candidate.photoUrl || candidate.avatarUrl} alt={candidate.name} className="w-full h-full object-cover" />
              {candidate.photoUrl && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm" />
              )}
            </motion.div>
            <div>
              <h3 className="font-heading text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                {candidate.name}
              </h3>
              <p className="text-sm text-on-surface-variant font-medium line-clamp-1">{candidate.offerTitle}</p>
              {candidate.filiere && (
                <p className="text-xs text-on-surface-variant/70 mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">school</span>
                  {candidate.filiere}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold border flex items-center gap-1 uppercase tracking-wider ${getStatusBadgeColor(candidate.status)}`}>
              {candidate.status}
            </div>
            <div className="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded border border-outline-variant/20">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span className={`text-xs font-bold ${getMatchScoreColor(candidate.matchScore)}`}>{candidate.matchScore}% Match</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-outline-variant/20 flex justify-between items-center text-sm text-on-surface-variant font-medium relative z-10" style={{ transform: "translateZ(15px)" }}>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">calendar_today</span> {new Date(candidate.appliedDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/entreprise/candidates/profile/${candidate.etudiantId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200 transition-all hover:shadow-sm"
            >
              <span className="material-symbols-outlined text-[14px]">person</span>
              Voir le profil
            </Link>
            <motion.span 
              className="text-primary font-bold group-hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              whileHover={{ x: 5 }}
            >
              Voir le dossier <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function EntrepriseCandidatesContent() {
  const router = useRouter();

  // Data State
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'Tous'>('Tous');
  const [sortBy, setSortBy] = useState<'Recent' | 'Match'>('Recent');

  // Actions & Drawer State
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success'|'error'}>({show: false, message: '', type: 'success'});

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/candidatures');
      if (res.ok) {
        const json = await res.json();
        const apiCandidates = json.data?.data || json.data || [];
        const mappedCandidates = apiCandidates.map((c: any) => ({
          id: c.id,
          etudiantId: c.etudiant?.user_id || c.user_id,
          name: c.etudiant?.nom || 'Inconnu',
          email: c.etudiant?.email || 'Non spécifié',
          phone: c.etudiant?.telephone || 'Non spécifié',
          filiere: c.etudiant?.filiere || undefined,
          niveauEtude: c.etudiant?.niveau_etude || undefined,
          bio: c.etudiant?.bio || undefined,
          appliedDate: c.created_at,
          status: c.statut === 'accepte' ? 'Accepté' : c.statut === 'refuse' ? 'Rejeté' : 'En attente',
          matchScore: Math.floor(Math.random() * 30) + 70, // Pseudo matching score 70-100%
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.etudiant?.nom || 'User')}&background=6366f1&color=fff&bold=true`,
          photoUrl: c.etudiant?.photo ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${c.etudiant.photo}` : undefined,
          offerId: c.offre_stage?.id,
          offerTitle: c.offre_stage?.titre || 'Offre supprimée',
          cvUrl: c.cv_file_snapshot ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/storage/${c.cv_file_snapshot}` : (c.cv?.file_path ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/storage/${c.cv.file_path}` : undefined),
          motivation: c.lettre_motivation || undefined,
          conventionStatus: c.convention_statut || 'non_generee',
          signatureLinkEntreprise: c.yousign_signature_link_entreprise || undefined,
          conventionPdfPath: c.convention_pdf_path || undefined,
        }));
        setCandidates(mappedCandidates);
      }
    } catch (e) {
      showToast('Erreur de connexion', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const filteredCandidates = useMemo(() => {
    let result = candidates.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.offerTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'Tous' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === 'Recent') {
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      } else {
        return b.matchScore - a.matchScore;
      }
    });

    return result;
  }, [candidates, searchQuery, statusFilter, sortBy]);

  const updateCandidateStatus = async (id: string, newStatus: ApplicationStatus) => {
    // Only API endpoints are 'accepte' and 'refuse'
    if (newStatus === 'En cours d\'examen') {
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      if (selectedCandidate && selectedCandidate.id === id) {
        setSelectedCandidate(prev => prev ? { ...prev, status: newStatus } : null);
      }
      return;
    }

    setIsProcessing(true);
    try {
      const apiStatus = newStatus === 'Accepté' ? 'accepte' : 'refuse';
      const res = await apiFetch(`/candidatures/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ statut: apiStatus })
      });
      if (res.ok) {
        setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        if (selectedCandidate && selectedCandidate.id === id) {
          setSelectedCandidate(null); // Close drawer
        }
        showToast(`Candidature ${apiStatus === 'accepte' ? 'acceptée' : 'rejetée'} ! Un email a été automatiquement envoyé à l'étudiant.`, 'success');
      } else {
        const errorData = await res.json();
        showToast(errorData.message || "Erreur lors de l'opération", 'error');
      }
    } catch (e) {
      showToast('Erreur de réseau', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadgeColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Accepté': return 'bg-green-500/10 text-green-600 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]';
      case 'Rejeté': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'En attente': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)] animate-pulse';
      case 'En cours d\'examen': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const startConversation = async (etudiantId: string) => {
    setIsProcessing(true);
    try {
      const res = await apiFetch('/conversations', {
        method: 'POST',
        body: JSON.stringify({ user_id: etudiantId })
      });
      if (res.ok) {
        const json = await res.json();
        const convId = json.data?.id;
        setSelectedCandidate(null);
        router.push(`/entreprise/messages?conv=${convId}`);
      } else {
        const errorData = await res.json();
        showToast(errorData.message || 'Erreur lors de la création de la conversation', 'error');
      }
    } catch (e) {
      showToast('Erreur de réseau', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConventionAction = async (action: 'generate' | 'send-signature', candidatureId: string) => {
    setIsProcessing(true);
    try {
      const res = await apiFetch(`/candidatures/${candidatureId}/convention/${action}`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de l\'action convention');
      }
      showToast(`Action ${action === 'generate' ? 'Génération' : 'Envoi'} effectuée avec succès !`);
      fetchCandidates();
      if (selectedCandidate) {
        setSelectedCandidate(null); // Simple way to force refresh of drawer state
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsProcessing(false);
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
    <div className="h-full w-full relative overflow-x-hidden text-on-background pb-24 md:pb-10">
      {/* Main Content Area */}
      <main className="w-full p-4 md:p-10 relative z-10 flex flex-col max-w-[1400px] mx-auto gap-6">
        
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4"
        >
          <div>
            <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-on-background tracking-tighter">Candidatures</h1>
            <p className="font-body-base text-on-surface-variant mt-2 max-w-xl">
              Gérez les candidats, consultez leurs CV et prenez des décisions rapides pour vos recrutements.
            </p>
          </div>
        </motion.header>

        {/* Filters Bar */}
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
                placeholder="Rechercher un candidat, un poste..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex p-1 bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-x-auto custom-scrollbar flex-shrink-0">
              {['Tous', 'En attente', 'En cours d\'examen', 'Accepté', 'Rejeté'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`relative px-4 py-2.5 rounded-lg text-sm font-bold font-label-caps tracking-wider transition-colors whitespace-nowrap ${
                    statusFilter === status ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {statusFilter === status && (
                    <motion.div
                      layoutId="candidateStatusFilter"
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
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
              >
                <option value="Recent">Plus récentes</option>
                <option value="Match">Meilleur matching</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">sort</span>
            </div>
          </div>
        </motion.div>

        {/* Candidates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-container/50 animate-pulse rounded-3xl h-32 border border-outline-variant/10"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4">
            <AnimatePresence mode="popLayout">
              {filteredCandidates.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="col-span-full bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] perspective-1000"
                >
                  <motion.div 
                    animate={{ rotateY: [0, 180, 360], scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(165,59,34,0.2)]"
                  >
                    <span className="material-symbols-outlined text-5xl text-primary">search_off</span>
                  </motion.div>
                  <h3 className="text-2xl font-bold font-heading text-on-surface mb-2">Aucun candidat trouvé</h3>
                  <p className="text-on-surface-variant max-w-md">
                    Modifiez vos filtres ou effectuez une nouvelle recherche.
                  </p>
                </motion.div>
              ) : (
                filteredCandidates.map((candidate, i) => (
                  <CandidateCard3D 
                    key={candidate.id} 
                    candidate={candidate} 
                    getStatusBadgeColor={getStatusBadgeColor} 
                    getMatchScoreColor={getMatchScoreColor} 
                    setSelectedCandidate={setSelectedCandidate} 
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Side Drawer: CV Preview & Actions */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setSelectedCandidate(null)}
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
                    <img src={selectedCandidate.photoUrl || selectedCandidate.avatarUrl} alt={selectedCandidate.name} className="w-full h-full object-cover" />
                    {selectedCandidate.photoUrl && (
                      <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm" />
                    )}
                  </motion.div>
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <h2 className="font-heading text-2xl font-bold text-on-surface">{selectedCandidate.name}</h2>
                    <p className="text-sm font-medium text-on-surface-variant">{selectedCandidate.offerTitle}</p>
                    {selectedCandidate.filiere && (
                      <p className="text-xs text-on-surface-variant/70 mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">school</span>
                        {selectedCandidate.filiere} {selectedCandidate.niveauEtude && `· ${selectedCandidate.niveauEtude}`}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeColor(selectedCandidate.status)}`}>
                        {selectedCandidate.status}
                      </span>
                    </div>
                  </motion.div>
                </div>
                <button 
                  onClick={() => setSelectedCandidate(null)}
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
                    disabled={isProcessing || selectedCandidate.status === 'Accepté'}
                    onClick={() => updateCandidateStatus(selectedCandidate.id, 'Accepté')}
                    className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-green-50 hover:text-green-600 text-on-surface-variant transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    <span className="text-xs font-bold font-label-caps">Accepter</span>
                  </button>
                  <div className="w-px bg-outline-variant/30"></div>
                  <button 
                    disabled={isProcessing}
                    onClick={() => updateCandidateStatus(selectedCandidate.id, 'En cours d\'examen')}
                    className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-on-surface-variant transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                    <span className="text-xs font-bold font-label-caps">Examiner</span>
                  </button>
                  <div className="w-px bg-outline-variant/30"></div>
                  <button 
                    disabled={isProcessing || selectedCandidate.status === 'Rejeté'}
                    onClick={() => updateCandidateStatus(selectedCandidate.id, 'Rejeté')}
                    className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-red-50 hover:text-red-600 text-on-surface-variant transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">cancel</span>
                    <span className="text-xs font-bold font-label-caps">Rejeter</span>
                  </button>
                  <div className="w-px bg-outline-variant/30"></div>
                  <button 
                    disabled={isProcessing}
                    onClick={() => startConversation(selectedCandidate.etudiantId)}
                    className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 text-on-surface-variant transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">chat</span>
                    <span className="text-xs font-bold font-label-caps">Contacter</span>
                  </button>
                </div>

                {/* Profile Link Banner */}
                <Link
                  href={`/entreprise/candidates/profile/${selectedCandidate.etudiantId}`}
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
                        <p className="text-sm font-semibold truncate" title={selectedCandidate.email}>{selectedCandidate.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[16px]">phone</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-label-caps">Téléphone</p>
                        <p className="text-sm font-semibold">{selectedCandidate.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedCandidate.bio && (
                  <div className="space-y-2 mb-8 bg-surface-container-low/50 rounded-2xl p-4 border border-outline-variant/20">
                    <h3 className="font-label-caps text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      À propos
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{selectedCandidate.bio}</p>
                  </div>
                )}

                {/* Lettre de motivation */}
                {selectedCandidate.motivation && (
                  <div className="space-y-4 mb-8 bg-primary/5 rounded-2xl p-5 border border-primary/10">
                    <h3 className="font-label-caps text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">edit_note</span>
                      Lettre de Motivation
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap italic">
                      "{selectedCandidate.motivation}"
                    </p>
                  </div>
                )}

                {/* Section Convention de Stage (visible only if Accepted) */}
                {selectedCandidate.status === 'Accepté' && (
                  <div className="space-y-4 mb-8 bg-blue-50/50 rounded-2xl p-5 border border-blue-200">
                    <h3 className="font-label-caps text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-[18px]">contract</span>
                      Convention de Stage
                    </h3>
                    
                    <div className="flex flex-col gap-3">
                      {(!selectedCandidate.conventionStatus || selectedCandidate.conventionStatus === 'non_generee') && (
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100 shadow-sm">
                          <p className="text-sm font-medium text-on-surface-variant">La convention n'a pas encore été générée.</p>
                          <button
                            onClick={() => handleConventionAction('generate', selectedCandidate.id)}
                            disabled={isProcessing}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            Générer Convention
                          </button>
                        </div>
                      )}

                      {selectedCandidate.conventionStatus === 'generee' && (
                        <div className="flex flex-col gap-3 p-3 bg-white rounded-xl border border-blue-100 shadow-sm">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">task_alt</span>
                              Générée avec succès
                            </p>
                            <button
                              onClick={() => downloadConvention(selectedCandidate.id)}
                              className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
                            >
                              Voir PDF
                            </button>
                          </div>
                          <button
                            onClick={() => handleConventionAction('send-signature', selectedCandidate.id)}
                            disabled={isProcessing}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">send</span>
                            Envoyer pour signature (Yousign)
                          </button>
                        </div>
                      )}

                      {selectedCandidate.conventionStatus === 'en_signature' && (
                        <div className="flex flex-col gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 shadow-sm">
                          <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">draw</span>
                            En attente de signatures
                          </p>
                          {selectedCandidate.signatureLinkEntreprise ? (
                            <a
                              href={selectedCandidate.signatureLinkEntreprise}
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

                      {selectedCandidate.conventionStatus === 'signee' && (
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm">
                          <p className="text-sm font-bold text-green-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            Convention Signée !
                          </p>
                          <button
                            onClick={() => downloadConvention(selectedCandidate.id)}
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
                    {selectedCandidate.cvUrl && (
                      <a href={selectedCandidate.cvUrl} target="_blank" rel="noreferrer" className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                        Télécharger <span className="material-symbols-outlined text-[14px]">download</span>
                      </a>
                    )}
                  </div>
                  
                  {/* PDF Viewer */}
                  <div className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center shadow-inner overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-12 bg-surface-container-low border-b border-outline-variant/20 flex items-center px-4 justify-between text-on-surface-variant z-10">
                      <span className="text-xs font-bold font-label-caps">CV_{selectedCandidate.name.replace(' ', '_')}.pdf</span>
                      <div className="flex gap-2">
                        <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-primary transition-colors">zoom_out</span>
                        <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-primary transition-colors">zoom_in</span>
                      </div>
                    </div>
                    {selectedCandidate.cvUrl ? (
                       <iframe src={selectedCandidate.cvUrl} className="w-full h-full pt-12" title="CV" />
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
