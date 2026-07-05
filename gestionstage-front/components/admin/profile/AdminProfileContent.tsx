'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Loader2, Save, Edit2, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { apiFetch, authHeaders, API_BASE, getAvatarUrl } from '@/lib/api';

interface UserData {
  id: number; 
  nom: string; 
  email: string; 
  telephone: string | null;
  adresse: string | null; 
  photo: string | null;
  role: string;
}

export default function AdminProfileContent() {
  const [activeTab, setActiveTab] = useState('general');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{show: boolean; msg: string; type: 'success'|'error'}>({show: false, msg: '', type: 'success'});
  
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', adresse: '' });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Mouse cursor glow state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profRes = await apiFetch('/profil');
      if (!profRes.ok) throw new Error('Erreur de chargement');
      const profData = await profRes.json();
      const u = profData.data;
      setUserData(u);
      setForm({ nom: u.nom || '', email: u.email || '', telephone: u.telephone || '', adresse: u.adresse || '' });
      setPhotoPreview(u.photo ? getAvatarUrl(u.nom, u.photo) : getAvatarUrl(u.nom));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value as string));
      if (selectedPhoto) formData.append('photo', selectedPhoto);
      formData.append('_method', 'PUT'); // PHP requires _method for multipart PUT

      const headers = authHeaders() as Record<string, string>;
      delete headers['Content-Type']; // Let the browser set the boundary

      const res = await apiFetch(`/profil`, {
        method: 'POST', // POST with _method=PUT
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      setUserData(data.data);
      if (selectedPhoto) {
        setPhotoPreview(URL.createObjectURL(selectedPhoto));
      } else if (data.data.photo) {
        setPhotoPreview(getAvatarUrl(data.data.nom, data.data.photo));
      } else {
        setPhotoPreview(getAvatarUrl(data.data.nom));
      }
      setIsEditing(false);
      showToast('Profil mis à jour avec succès !');
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setIsSaving(false); }
  };

  const handleChangePassword = async () => {
    if (pwForm.new_password !== pwForm.new_password_confirmation) {
      showToast('Les mots de passe ne correspondent pas', 'error'); return;
    }
    try {
      const res = await apiFetch(`/profil/password`, {
        method: 'PUT',
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      showToast('Mot de passe changé avec succès !');
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const TABS = [
    { key: 'general', label: 'Général' },
    { key: 'parametres', label: 'Paramètres & Sécurité' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <Loader2 className="w-10 h-10 text-primary" />
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertCircle className="w-12 h-12 text-error" />
      <p className="text-on-surface-variant">{error}</p>
      <button onClick={fetchProfile} className="bg-primary text-white px-6 py-3 rounded-xl">Réessayer</button>
    </div>
  );

  const inputCls = (editing: boolean) => `w-full bg-white/60 border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${!editing ? 'opacity-70 bg-transparent border-transparent cursor-default' : ''}`;

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
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-sm font-semibold ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full pt-4 md:pt-6 px-4 md:px-8 pb-24 relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface font-heading tracking-tight mb-1">Profil Administrateur</h1>
              <p className="text-on-surface-variant">Gérez vos informations de compte administrateur.</p>
            </div>
            {activeTab === 'general' && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                disabled={isSaving}
                className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm ${isEditing ? 'bg-primary text-white shadow-primary/30' : 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container-high'}`}
              >
                {isSaving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader2 className="w-4 h-4" /></motion.div> : isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {isSaving ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Modifier'}
              </motion.button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 glass-panel rounded-xl w-fit">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setIsEditing(false); }}
                className={`relative px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === tab.key ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {activeTab === tab.key && <motion.div layoutId="profileTab" className="absolute inset-0 bg-primary rounded-lg" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'general' && (
            <motion.div key="general" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Avatar Card */}
              <motion.div whileHover={{ y: -4 }} className="md:col-span-4 glass-panel rounded-2xl p-8 flex flex-col items-center text-center shadow-xl relative overflow-hidden group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4 relative">
                  <img src={photoPreview || getAvatarUrl(userData?.nom || 'Admin')} alt={userData?.nom} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  {isEditing && (
                    <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white cursor-pointer hover:bg-black/60 transition-colors">
                      <Edit2 className="w-6 h-6 mb-1 drop-shadow-md" />
                      <span className="text-xs font-bold drop-shadow-md">Changer photo</span>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
                <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  {userData?.nom}
                  <Shield className="w-5 h-5 text-primary" />
                </h3>
                <p className="text-sm text-primary font-medium mt-1 bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">Super Administrateur</p>
                {userData?.email && <p className="text-xs text-on-surface-variant mt-3">{userData.email}</p>}
              </motion.div>

              {/* Info Form */}
              <motion.div whileHover={{ y: -4 }} className="md:col-span-8 glass-panel rounded-2xl p-8 shadow-xl flex flex-col justify-center">
                <h3 className="text-lg font-bold text-on-surface mb-5">Informations Administrateur</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'nom', label: 'Nom complet', type: 'text' },
                    { key: 'email', label: 'Email professionnel', type: 'email' },
                    { key: 'telephone', label: 'Téléphone de contact', type: 'tel' }
                  ].map(field => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{field.label}</label>
                      <input type={field.type} value={(form as any)[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} disabled={!isEditing} className={inputCls(isEditing)} />
                    </div>
                  ))}
                  <div className="md:col-span-2 space-y-1 mt-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Adresse / Localisation</label>
                    <textarea value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} disabled={!isEditing} rows={3} className={inputCls(isEditing) + ' resize-none'} />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'parametres' && (
            <motion.div key="parametres" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-panel rounded-2xl p-8 shadow-xl max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
                <Shield className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-bold text-on-surface">Sécurité du compte</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mot de passe actuel</label>
                  <input type="password" value={pwForm.current_password} onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))} className="w-full bg-white/60 border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nouveau mot de passe</label>
                  <input type="password" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} className="w-full bg-white/60 border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Confirmer le nouveau mot de passe</label>
                  <input type="password" value={pwForm.new_password_confirmation} onChange={e => setPwForm(f => ({ ...f, new_password_confirmation: e.target.value }))} className="w-full bg-white/60 border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <button onClick={handleChangePassword} className="w-full bg-primary text-white py-3 rounded-xl font-bold mt-4 hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
                  Mettre à jour le mot de passe
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
