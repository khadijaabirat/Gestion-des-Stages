'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Upload, Trash2, Star, Eye, FileText, Loader2, AlertCircle, CheckCircle, X, RotateCcw } from 'lucide-react';
import { apiFetch, extractArray, getToken, API_BASE } from '@/lib/api';

interface CV {
  id: number;
  title: string;
  file_path: string;
  is_main: boolean;
  created_at: string;
}

export default function CVManagerContent() {
  const [cvList, setCvList] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTitle, setUploadTitle] = useState('');
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [editingCvId, setEditingCvId] = useState<number | null>(null);
  const [editCvTitle, setEditCvTitle] = useState('');
  const [toast, setToast] = useState<{show: boolean; msg: string; type: 'success'|'error'}>({show: false, msg: '', type: 'success'});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Mouse cursor glow state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 300 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 300 });

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  const fetchCvs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch('/cvs');
      if (!res.ok) throw new Error('Erreur de chargement');
      const data = await res.json();
      setCvList(extractArray(data));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCvs(); }, [fetchCvs]);

  // Mouse follow glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setMousePosition({ x: e.clientX, y: e.clientY });
      setCursorGlowOpacity(1);
    };
    const handleMouseLeave = () => {
      setCursorGlowOpacity(0);
    };
    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle.trim()) { showToast('Veuillez sélectionner un fichier et entrer un titre', 'error'); return; }
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const token = getToken();
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadTitle.trim());

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 15, 85));
      }, 200);

      const res = await apiFetch('/cvs', {
        method: 'POST',
        body: formData,
      });
      clearInterval(progressInterval);
      setUploadProgress(100);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur upload');
      await fetchCvs();
      setSelectedFile(null);
      setUploadTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast('CV uploadé avec succès !');
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setIsUploading(false); setUploadProgress(0); }
  };

  const handleSetMain = async (id: number) => {
    try {
      const res = await apiFetch(`/cvs/${id}/set-main`, { method: 'POST' });
      if (!res.ok) throw new Error('Erreur');
      setCvList(prev => prev.map(cv => ({ ...cv, is_main: cv.id === id })));
      showToast('CV principal mis à jour !');
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleUpdateCv = async (id: number) => {
    if (!editCvTitle.trim()) { showToast('Le titre ne peut pas être vide', 'error'); return; }
    try {
      const res = await apiFetch(`/cvs/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: editCvTitle.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur modification');
      setCvList(prev => prev.map(cv => cv.id === id ? { ...cv, title: editCvTitle.trim() } : cv));
      setEditingCvId(null);
      setEditCvTitle('');
      showToast('CV renommé avec succès !');
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await apiFetch(`/cvs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur suppression');
      setCvList(prev => prev.filter(cv => cv.id !== id));
      setDeleteModalId(null);
      showToast('CV supprimé avec succès');
    } catch (e: any) { showToast(e.message, 'error'); setDeleteModalId(null); }
  };

  const handleView = (cv: CV) => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/storage/${cv.file_path}`, '_blank');
  };

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-background">
        {/* Cursor Follow Glow Effect */}
        <motion.div
          className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-500 mix-blend-multiply"
          style={{
            opacity: cursorGlowOpacity,
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,126,95, 0.1), transparent 70%)`,
          }}
        />
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteModalId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setDeleteModalId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-error" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-2">Supprimer ce CV ?</h3>
                <p className="text-on-surface-variant mb-6 text-sm">Cette action est irréversible. Le fichier sera définitivement supprimé.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteModalId(null)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface font-semibold hover:bg-surface-container transition-colors">Annuler</button>
                  <motion.button whileHover={{ scale: 1.02 }} onClick={() => handleDelete(deleteModalId)} className="flex-1 py-3 rounded-xl bg-error text-white font-semibold">Supprimer</motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="w-full pt-4 md:pt-6 p-4 md:p-8 pb-24 relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface font-heading tracking-tight mb-2">Mon CV &amp; Portfolio</h1>
          <p className="text-on-surface-variant">Gérez vos CVs pour postuler aux offres de stage. Maximum 5 CVs.</p>
        </motion.div>

        {/* Upload Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-8 mb-8 shadow-xl">
          <h2 className="text-lg font-bold text-on-surface mb-5">Uploader un nouveau CV</h2>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={e => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragOver ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-outline-variant/40 hover:border-primary/60 hover:bg-primary/3'}`}
          >
            <motion.div animate={isDragOver ? { y: [-5, 0, -5] } : {}} transition={{ duration: 1, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
            >
              <Upload className="w-8 h-8 text-primary" />
            </motion.div>
            <p className="font-bold text-on-surface mb-1">{selectedFile ? selectedFile.name : 'Glissez votre CV ici'}</p>
            <p className="text-sm text-on-surface-variant">PDF uniquement · Maximum 10MB</p>
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
          </div>

          {selectedFile && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Titre du CV *</label>
                <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="Ex: CV Marketing 2026" className="w-full border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              {isUploading && (
                <div className="bg-surface-container rounded-xl h-3 overflow-hidden">
                  <motion.div animate={{ width: `${uploadProgress}%` }} className="h-full bg-primary rounded-xl transition-all" />
                </div>
              )}
              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleUpload} disabled={isUploading}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-60 shadow-md shadow-primary/20"
                >
                  {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Upload en cours...</> : <><Upload className="w-4 h-4" /> Uploader</>}
                </motion.button>
                <button onClick={() => { setSelectedFile(null); setUploadTitle(''); }} className="text-on-surface-variant px-4 py-3 rounded-xl hover:bg-surface-container transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* CV List */}
        {loading ? (
          <div className="flex justify-center py-10">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Loader2 className="w-10 h-10 text-primary" />
            </motion.div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-10">
            <AlertCircle className="w-10 h-10 text-error" />
            <p className="text-on-surface-variant">{error}</p>
            <motion.button whileHover={{ scale: 1.05 }} onClick={fetchCvs} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold">
              <RotateCcw className="w-4 h-4" /> Réessayer
            </motion.button>
          </div>
        ) : cvList.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-2xl p-16 text-center shadow-xl">
            <FileText className="w-16 h-16 text-on-surface-variant mx-auto mb-4" />
            <h3 className="text-xl font-bold text-on-surface mb-2">Aucun CV</h3>
            <p className="text-on-surface-variant">Uploadez votre premier CV pour pouvoir postuler.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-on-surface">Mes CVs ({cvList.length}/5)</h2>
            {cvList.map((cv, index) => (
              <motion.div
                key={cv.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -4, scale: 1.005 }}
                className={`glass-panel rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center gap-4 relative overflow-hidden ${cv.is_main ? 'border-l-4 border-l-primary' : ''}`}
              >
                {/* Shimmer */}
                <motion.div initial={{ x: '-100%' }} whileHover={{ x: '200%' }} transition={{ duration: 0.7 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none"
                />

                <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 shadow-md">
                  <FileText className="w-7 h-7 text-red-500" />
                </div>

                <div className="flex-1 min-w-0">
                  {editingCvId === cv.id ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input 
                        type="text" 
                        value={editCvTitle}
                        onChange={(e) => setEditCvTitle(e.target.value)}
                        className="flex-1 border border-primary/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white/80"
                        autoFocus
                      />
                      <button onClick={() => handleUpdateCv(cv.id)} className="bg-primary text-white p-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingCvId(null)} className="bg-surface-container text-on-surface-variant p-1.5 rounded-lg hover:bg-surface-container-high transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap mb-1 group/title">
                      <h3 className="font-bold text-on-surface truncate">{cv.title}</h3>
                      <button onClick={() => { setEditingCvId(cv.id); setEditCvTitle(cv.title); }} className="opacity-0 group-hover/title:opacity-100 text-primary hover:bg-primary/10 p-1 rounded transition-all">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      {cv.is_main && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-current" /> Principal
                        </motion.span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-on-surface-variant">Uploadé le {new Date(cv.created_at).toLocaleDateString('fr-FR')}</p>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleView(cv)}
                    className="w-10 h-10 rounded-xl bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface-variant flex items-center justify-center transition-colors"
                    title="Voir le PDF"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>

                  {!cv.is_main && (
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleSetMain(cv.id)}
                      className="w-10 h-10 rounded-xl bg-surface-container hover:bg-amber-50 hover:text-amber-600 text-on-surface-variant flex items-center justify-center transition-colors"
                      title="Définir comme principal"
                    >
                      <Star className="w-4 h-4" />
                    </motion.button>
                  )}

                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => setDeleteModalId(cv.id)}
                    className="w-10 h-10 rounded-xl bg-surface-container hover:bg-error/10 hover:text-error text-on-surface-variant flex items-center justify-center transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
