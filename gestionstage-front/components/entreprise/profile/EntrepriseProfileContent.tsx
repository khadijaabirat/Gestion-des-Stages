'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Save, Edit2, CheckCircle, AlertCircle, Lock, Building2, MapPin, Phone, Mail, Globe, FileText, Image as ImageIcon } from 'lucide-react';
import { apiFetch, authHeaders, API_BASE, getAvatarUrl } from '@/lib/api';
import Link from 'next/link';

interface UserData {
  id: number; nom: string; email: string; telephone: string | null;
  adresse: string | null; description: string | null; site_web: string | null;
  photo: string | null;
}

export default function EntrepriseProfileContent() {
  const [activeTab, setActiveTab] = useState('general');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{show: boolean; msg: string; type: 'success'|'error'}>({show: false, msg: '', type: 'success'});
  
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', adresse: '', description: '', site_web: '' });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });



  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/profil');
      if (!res.ok) throw new Error('Erreur de chargement du profil');
      const data = await res.json();
      const u = data.data ?? data;
      setUserData(u);
      setForm({ 
        nom: u.nom || '', 
        email: u.email || '', 
        telephone: u.telephone || '', 
        adresse: u.adresse || '', 
        description: u.description || '', 
        site_web: u.site_web || '' 
      });
      setPhotoPreview(u.photo ? getAvatarUrl(u.nom, u.photo) : getAvatarUrl(u.nom, 'company'));
    } catch (e: any) { 
      setError(e.message); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);



  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setIsEditing(true); // Auto-trigger editing mode if they upload a photo
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
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la sauvegarde');
      
      setUserData(data.data);
      if (selectedPhoto) {
        setPhotoPreview(URL.createObjectURL(selectedPhoto));
      } else if (data.data.photo) {
        setPhotoPreview(getAvatarUrl(data.data.nom, data.data.photo));
      } else {
        setPhotoPreview(getAvatarUrl(data.data.nom, 'company'));
      }
      setIsEditing(false);
      showToast('Profil entreprise mis à jour avec succès !');
    } catch (e: any) { 
      showToast(e.message, 'error'); 
    } finally { 
      setIsSaving(false); 
    }
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
    { key: 'general', label: 'Général', icon: Building2 },
    { key: 'identite', label: 'Identité', icon: FileText },
    { key: 'securite', label: 'Sécurité', icon: Lock },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-background">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <Loader2 className="w-12 h-12 text-primary" />
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-background">
      <AlertCircle className="w-12 h-12 text-error" />
      <p className="text-on-surface-variant font-medium">{error}</p>
      <button onClick={fetchProfile} className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all">Réessayer</button>
    </div>
  );

  const inputCls = (editing: boolean) => `w-full bg-white/60 border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${!editing ? 'opacity-70 bg-transparent border-transparent cursor-default shadow-none' : 'shadow-sm'}`;

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-background">

      
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 z-50 px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center gap-3 text-sm font-bold backdrop-blur-xl border ${toast.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-800' : 'bg-red-50/90 border-red-200 text-red-800'}`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full pt-4 md:pt-10 px-4 md:px-8 pb-24 relative z-10 max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface font-heading tracking-tight mb-2">Profil Entreprise</h1>
            <p className="text-on-surface-variant font-medium">Gérez vos informations, votre identité et vos paramètres de sécurité.</p>
          </div>
          {(activeTab === 'general' || activeTab === 'identite') && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={isSaving}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${isEditing ? 'bg-primary text-white shadow-primary/30' : 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container-high'}`}
            >
              {isSaving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader2 className="w-5 h-5" /></motion.div> : isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
              {isSaving ? 'Enregistrement...' : isEditing ? 'Sauvegarder' : 'Modifier le profil'}
            </motion.button>
          )}
        </motion.div>

        {/* Info Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-primary/10 border border-primary/20 rounded-2xl p-4 md:p-5 flex gap-4 items-start backdrop-blur-md shadow-sm"
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary">campaign</span>
          </div>
          <div>
            <p className="font-label-caps text-xs font-bold text-primary uppercase tracking-wider">Visibilité de votre entreprise</p>
            <p className="font-body-sm text-sm text-on-surface-variant mt-1 leading-relaxed">
              Un profil complet et bien renseigné attire <strong>3x plus de candidats</strong>. Assurez-vous que votre description et votre site web sont à jour !
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-2 p-1.5 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl w-fit shadow-sm overflow-x-auto max-w-full">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setIsEditing(false); }}
                className={`relative px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab.key ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {activeTab === tab.key && <motion.div layoutId="entrepriseProfileTab" className="absolute inset-0 bg-primary rounded-xl shadow-md" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            )
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'general' && (
            <motion.div key="general" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Logo Card */}
              <motion.div whileHover={{ y: -4 }} className="md:col-span-4 bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_8px_32px_rgba(165,59,34,0.04)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
                <h3 className="font-label-caps text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-6">Logo Entreprise</h3>
                
                <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-white shadow-xl mb-6 relative bg-surface-container flex items-center justify-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt={userData?.nom} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <Building2 className="w-16 h-16 text-outline-variant" />
                  )}
                  
                  <label className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity duration-300 ${isEditing ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-sm font-bold">Changer le logo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={!isEditing} />
                  </label>
                </div>
                <h2 className="text-2xl font-extrabold text-on-surface mb-1">{form.nom || 'Entreprise'}</h2>
                <p className="text-sm text-on-surface-variant font-medium bg-surface-container py-1 px-3 rounded-full">{userData?.email}</p>
              </motion.div>

              {/* Info Form */}
              <motion.div whileHover={{ y: -4 }} className="md:col-span-8 bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-[0_8px_32px_rgba(165,59,34,0.04)]">
                <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Informations Générales</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 group">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Nom de l'entreprise *</label>
                    <input type="text" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} disabled={!isEditing} className={inputCls(isEditing)} placeholder="Nom de votre entreprise" />
                  </div>
                  <div className="space-y-1.5 group">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Adresse Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={!isEditing} className={inputCls(isEditing)} placeholder="contact@entreprise.com" />
                  </div>
                  <div className="space-y-1.5 group">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Téléphone</label>
                    <input type="tel" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} disabled={!isEditing} className={inputCls(isEditing)} placeholder="+212 6..." />
                  </div>
                  <div className="space-y-1.5 group">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Adresse complète</label>
                    <input type="text" value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} disabled={!isEditing} className={inputCls(isEditing)} placeholder="Ex: 123 Avenue Hassan II, Casablanca" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'identite' && (
            <motion.div key="identite" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-[0_8px_32px_rgba(165,59,34,0.04)]">
              <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-secondary" /> Identité de l'Entreprise</h3>
              
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Site Web</label>
                  <input type="url" value={form.site_web} onChange={e => setForm(f => ({ ...f, site_web: e.target.value }))} disabled={!isEditing} className={inputCls(isEditing)} placeholder="https://www.votre-entreprise.com" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Description détaillée</label>
                  <textarea 
                    value={form.description} 
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                    disabled={!isEditing} 
                    rows={8} 
                    className={`${inputCls(isEditing)} resize-y min-h-[150px] leading-relaxed`} 
                    placeholder="Présentez votre entreprise, sa mission, sa culture et ce que vous recherchez chez un stagiaire..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'securite' && (
            <motion.div key="securite" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-[0_8px_32px_rgba(165,59,34,0.04)]">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 bg-error/10 text-error rounded-2xl flex items-center justify-center mb-4 border border-error/20 shadow-inner">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface">Sécurité du compte</h3>
                  <p className="text-sm text-on-surface-variant mt-2">Assurez-vous d'utiliser un mot de passe long et complexe.</p>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mot de passe actuel</label>
                    <input type="password" value={pwForm.current_password} onChange={e => setPwForm(p => ({...p, current_password: e.target.value}))} className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-error focus:ring-2 focus:ring-error/20 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nouveau mot de passe</label>
                    <input type="password" value={pwForm.new_password} onChange={e => setPwForm(p => ({...p, new_password: e.target.value}))} className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-error focus:ring-2 focus:ring-error/20 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Confirmer le nouveau mot de passe</label>
                    <input type="password" value={pwForm.new_password_confirmation} onChange={e => setPwForm(p => ({...p, new_password_confirmation: e.target.value}))} className="w-full bg-white border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-error focus:ring-2 focus:ring-error/20 transition-all" />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleChangePassword} 
                    className="w-full bg-error text-white py-3.5 rounded-xl font-bold mt-4 shadow-lg shadow-error/20 hover:bg-error/90 transition-colors"
                  >
                    Mettre à jour le mot de passe
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-outline-variant/20 flex justify-around py-3 px-2 z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] pb-safe">
        <Link href="/entreprise/dashboard" className="flex flex-col items-center text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] mt-1 font-label-caps">Accueil</span>
        </Link>
        <Link href="/entreprise/candidates" className="flex flex-col items-center text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] mt-1 font-label-caps">Candidats</span>
        </Link>
        <Link href="/entreprise/offers" className="flex flex-col items-center text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">work</span>
          <span className="text-[10px] mt-1 font-label-caps">Offres</span>
        </Link>
        <Link href="/entreprise/messages" className="flex flex-col items-center text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">mail</span>
          <span className="text-[10px] mt-1 font-label-caps">Msg</span>
        </Link>
        <Link href="/entreprise/profile" className="flex flex-col items-center text-primary font-bold">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="text-[10px] mt-1 font-label-caps">Profil</span>
        </Link>
      </nav>
    </div>
  );
}
