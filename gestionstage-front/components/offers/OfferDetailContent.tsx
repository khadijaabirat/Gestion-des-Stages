'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Building2, ArrowLeft, Send, Loader2, AlertCircle, CheckCircle, X, FileText } from 'lucide-react';
import { apiFetch, extractArray, authHeaders, getAvatarUrl, API_BASE, getToken } from '@/lib/api';
import Link from 'next/link';

interface CV {
  id: number;
  title: string;
  is_main: boolean;
  file_path: string;
}

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

export default function OfferDetailContent({ offerId, initialData }: { offerId: string; initialData?: any }) {
  const [offer, setOffer] = useState<Offer | null>(initialData || null);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [motivation, setMotivation] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [offerRes, cvsRes] = await Promise.all([
          apiFetch(`/offres-stage/${offerId}`),
          apiFetch('/cvs'),
        ]);

        if (!offerRes.ok) throw new Error('Offre introuvable');
        const offerData = await offerRes.json();
        setOffer(offerData.data);

        if (cvsRes.ok) {
          const cvsData = await cvsRes.json();
          const cvsArray = extractArray(cvsData);
          setCvs(cvsArray);
          const mainCv = cvsArray.find((c: CV) => c.is_main);
          if (mainCv) setSelectedCvId(mainCv.id);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [offerId]);

  const handleApply = async () => {
    if (!selectedCvId) {
      setApplyError('Veuillez sélectionner un CV');
      return;
    }
    try {
      setApplying(true);
      setApplyError(null);
      const res = await apiFetch(`/candidatures`, {
        method: 'POST',
        body: JSON.stringify({
          offre_stage_id: offer?.id,
          cv_id: selectedCvId,
          lettre_motivation: motivation,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la candidature');
      setApplySuccess(true);
      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccess(false);
      }, 2500);
    } catch (err: any) {
      setApplyError(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 className="w-10 h-10 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-error" />
        <h2 className="text-2xl font-bold text-on-surface">{error || 'Offre introuvable'}</h2>
        <Link href="/etudiant/offres">
          <motion.button whileHover={{ scale: 1.05 }} className="bg-primary text-white px-6 py-3 rounded-xl font-semibold">
            Retour aux offres
          </motion.button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
      {/* Back Button */}
      <Link href="/etudiant/offres">
        <motion.button
          whileHover={{ x: -4 }}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux offres
        </motion.button>
      </Link>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-8 mb-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
            <img
              src={offer.entreprise?.photo ? `http://localhost:8000${offer.entreprise.photo}` : getAvatarUrl(offer.entreprise?.nom || 'Stage')}
              alt={offer.entreprise?.nom}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-on-surface font-heading mb-2">{offer.titre}</h1>
            <p className="text-primary font-bold text-lg flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5" />
              {offer.entreprise?.nom}
              <span className={`ml-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${offer.statut === 'ouverte' || offer.statut === 'published' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {offer.statut === 'published' ? 'ouverte' : offer.statut}
              </span>
            </p>
            <div className="flex flex-wrap gap-3">
              {offer.localisation && (
                <span className="flex items-center gap-1 bg-surface-container text-on-surface-variant text-sm px-3 py-2 rounded-lg font-medium">
                  <MapPin className="w-4 h-4" /> {offer.localisation}
                </span>
              )}
              {offer.duree && (
                <span className="flex items-center gap-1 bg-surface-container text-on-surface-variant text-sm px-3 py-2 rounded-lg font-medium">
                  <Clock className="w-4 h-4" /> {offer.duree}
                </span>
              )}
              {offer.remuneration && (
                <span className="flex items-center gap-1 bg-secondary/10 text-secondary text-sm px-3 py-2 rounded-lg font-bold">
                  💰 {offer.remuneration}
                </span>
              )}
              {offer.date_debut && (
                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-sm px-3 py-2 rounded-lg font-bold">
                  📅 Début: {new Date(offer.date_debut).toLocaleDateString('fr-FR')}
                </span>
              )}
              {offer.date_expiration && (
                <span className="flex items-center gap-1 bg-orange-50 text-orange-700 text-sm px-3 py-2 rounded-lg font-bold">
                  ⏳ Expire: {new Date(offer.date_expiration).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>
        </div>

        <motion.button
          onClick={() => setShowApplyModal(true)}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="mt-6 w-full md:w-auto bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:shadow-xl transition-all"
        >
          <Send className="w-5 h-5" />
          Postuler maintenant
        </motion.button>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-2xl p-8 mb-6 shadow-xl"
      >
        <h2 className="text-xl font-bold text-on-surface font-heading mb-4">Description du poste</h2>
        <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{offer.description}</p>
      </motion.div>

      {/* Company Info */}
      {offer.entreprise?.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-2xl p-8 shadow-xl"
        >
          <h2 className="text-xl font-bold text-on-surface font-heading mb-4">À propos de {offer.entreprise.nom}</h2>
          <p className="text-on-surface-variant leading-relaxed">{offer.entreprise.description}</p>
          {offer.entreprise.site_web && (
            <a
              href={offer.entreprise.site_web}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              🌐 Visiter le site web
            </a>
          )}
        </motion.div>
      )}

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
              onClick={() => !applying && setShowApplyModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-0 flex items-center justify-center z-[100] p-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative">
                <button
                  onClick={() => !applying && setShowApplyModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {applySuccess ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center py-8 gap-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-on-surface">Candidature envoyée!</h3>
                    <p className="text-on-surface-variant text-center">
                      Votre candidature pour <strong>{offer.titre}</strong> a été soumise avec succès.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-on-surface font-heading mb-2">Postuler</h3>
                    <p className="text-on-surface-variant mb-6">
                      {offer.titre} · {offer.entreprise?.nom}
                    </p>

                    {/* CV Selection */}
                    <div className="mb-5">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3 block">
                        Choisir un CV *
                      </label>
                      {cvs.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 p-6 bg-surface-container rounded-xl text-center">
                          <FileText className="w-8 h-8 text-on-surface-variant" />
                          <p className="text-on-surface-variant text-sm">Aucun CV disponible.</p>
                          <Link href="/etudiant/cv">
                            <button className="text-primary font-semibold text-sm hover:underline">
                              Uploader un CV →
                            </button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {cvs.map(cv => (
                            <label
                              key={cv.id}
                              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                selectedCvId === cv.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-outline-variant/30 hover:border-primary/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="cv"
                                checked={selectedCvId === cv.id}
                                onChange={() => setSelectedCvId(cv.id)}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selectedCvId === cv.id ? 'border-primary bg-primary' : 'border-outline-variant'
                              }`}>
                                {selectedCvId === cv.id && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-on-surface text-sm">{cv.title}</p>
                                {cv.is_main && (
                                  <span className="text-xs text-primary font-medium">CV Principal</span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Motivation */}
                    <div className="mb-6">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3 block">
                        Lettre de motivation (optionnel)
                      </label>
                      <textarea
                        value={motivation}
                        onChange={e => setMotivation(e.target.value)}
                        rows={4}
                        placeholder="Décrivez votre motivation pour ce poste..."
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      />
                    </div>

                    {applyError && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 p-3 bg-error/10 border border-error/20 text-error rounded-xl text-sm flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {applyError}
                      </motion.div>
                    )}

                    <motion.button
                      onClick={handleApply}
                      disabled={applying || cvs.length === 0}
                      whileHover={!applying ? { scale: 1.02 } : {}}
                      whileTap={!applying ? { scale: 0.98 } : {}}
                      className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    >
                      {applying ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                            <Loader2 className="w-5 h-5" />
                          </motion.div>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Envoyer ma candidature
                        </>
                      )}
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
