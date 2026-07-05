'use client';

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { Loader2, Save, Edit2, Plus, Trash2, CheckCircle, AlertCircle, Lock, Bell } from 'lucide-react';
import { apiFetch, authHeaders, API_BASE, getAvatarUrl, ApiErrorResponse, isApiErrorResponse } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface Skill { id: number; nom: string; }
interface Experience { id: number; titre: string; entreprise: string; date_debut: string; date_fin: string | null; }
interface UserData {
  id: number; nom: string; email: string; telephone: string | null;
  adresse: string | null; bio: string | null; filiere: string | null;
  niveau_etude: string | null; photo: string | null; skills?: Skill[]; experiences?: Experience[];
}

const profileSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis (min 2 caractères)'),
  email: z.string().email('Format email invalide'),
  telephone: z.string().nullable().optional(),
  adresse: z.string().nullable().optional(),
  filiere: z.string().nullable().optional(),
  niveau_etude: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileContent() {
  const [activeTab, setActiveTab] = useState('general');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{show: boolean; msg: string; type: 'success'|'error'}>({show: false, msg: '', type: 'success'});
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { nom: '', email: '', telephone: '', adresse: '', bio: '', filiere: '', niveau_etude: '' }
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  // Mouse cursor glow state
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 300 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 300 });
  const glowBackground = useMotionTemplate`radial-gradient(600px circle at ${smoothMouseX}px ${smoothMouseY}px, rgba(255,126,95, 0.1), transparent 70%)`;
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [showAddExp, setShowAddExp] = useState(false);
  const [editingExpId, setEditingExpId] = useState<number | null>(null);
  const [newExp, setNewExp] = useState({ titre: '', entreprise: '', date_debut: '', date_fin: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [profRes, skillsRes] = await Promise.all([
        apiFetch('/profil'),
        apiFetch('/skills'),
      ]);
      if (!profRes.ok) throw new Error('Erreur de chargement');
      const profData = await profRes.json();
      const u = profData.data;
      setUserData(u);
      reset({ nom: u.nom || '', email: u.email || '', telephone: u.telephone || '', adresse: u.adresse || '', bio: u.bio || '', filiere: u.filiere || '', niveau_etude: u.niveau_etude || '' });
      setPhotoPreview(u.photo ? getAvatarUrl(u.nom, u.photo) : getAvatarUrl(u.nom));
      setSelectedSkillIds(u.skills?.map((s: Skill) => s.id) || []);
      if (skillsRes.ok) { const d = await skillsRes.json(); setAllSkills(Array.isArray(d) ? d : (d.data || [])); }
    } catch (e: unknown) { 
      const msg = isApiErrorResponse(e) ? e.message : 'Erreur de chargement';
      setError(msg); 
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Mouse follow glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
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

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value as string);
        }
      });
      if (selectedPhoto) formData.append('photo', selectedPhoto);
      formData.append('_method', 'PUT'); // PHP requires _method for multipart PUT

      const headers = authHeaders() as Record<string, string>;
      delete headers['Content-Type']; // Let the browser set the boundary

      const res = await apiFetch('/profil', {
        method: 'POST', // POST with _method=PUT
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      setUserData(data.data);
      // Update photo preview: use the uploaded file preview if available, otherwise server URL
      if (selectedPhoto) {
        setPhotoPreview(URL.createObjectURL(selectedPhoto));
      } else if (data.data.photo) {
        setPhotoPreview(getAvatarUrl(data.data.nom, data.data.photo));
      } else {
        setPhotoPreview(getAvatarUrl(data.data.nom));
      }
      setIsEditing(false);
      showToast('Profil mis à jour avec succès !');
    } catch (e: unknown) { 
      const msg = isApiErrorResponse(e) ? e.message : 'Erreur';
      showToast(msg, 'error'); 
    }
    finally { setIsSaving(false); }
  };

  const handleSyncSkills = async () => {
    try {
      const res = await apiFetch('/profil/skills', {
        method: 'POST',
        body: JSON.stringify({ skills: selectedSkillIds }),
      });
      if (!res.ok) throw new Error('Erreur sync compétences');
      showToast('Compétences mises à jour !');
    } catch (e: unknown) { 
      const msg = isApiErrorResponse(e) ? e.message : 'Erreur sync compétences';
      showToast(msg, 'error'); 
    }
  };

  const handleAddExp = async () => {
    try {
      const url = editingExpId ? `/profil/experiences/${editingExpId}` : '/profil/experiences';
      const method = editingExpId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(newExp),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      await fetchProfile();
      setShowAddExp(false);
      setEditingExpId(null);
      setNewExp({ titre: '', entreprise: '', date_debut: '', date_fin: '' });
      showToast(editingExpId ? 'Expérience modifiée !' : 'Expérience ajoutée !');
    } catch (e: unknown) { 
      const msg = isApiErrorResponse(e) ? e.message : 'Erreur';
      showToast(msg, 'error'); 
    }
  };

  const handleEditClick = (exp: Experience) => {
    setNewExp({
      titre: exp.titre,
      entreprise: exp.entreprise,
      date_debut: exp.date_debut ? exp.date_debut.split('T')[0] : '',
      date_fin: exp.date_fin ? exp.date_fin.split('T')[0] : '',
    });
    setEditingExpId(exp.id);
    setShowAddExp(true);
  };

  const handleDeleteExp = async (id: number) => {
    if (!confirm('Supprimer cette expérience ?')) return;
    try {
      const res = await apiFetch(`/profil/experiences/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Erreur');
      await fetchProfile();
      showToast('Expérience supprimée');
    } catch (e: unknown) { 
      const msg = isApiErrorResponse(e) ? e.message : 'Erreur';
      showToast(msg, 'error'); 
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.new_password !== pwForm.new_password_confirmation) {
      showToast('Les mots de passe ne correspondent pas', 'error'); return;
    }
    try {
      const res = await apiFetch('/profil/password', {
        method: 'PUT',
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      showToast('Mot de passe changé avec succès !');
    } catch (e: unknown) { 
      const msg = isApiErrorResponse(e) ? e.message : 'Erreur';
      showToast(msg, 'error'); 
    }
  };

  const TABS = [
    { key: 'general', label: 'Général' },
    { key: 'experiences', label: 'Expériences' },
    { key: 'parametres', label: 'Paramètres' },
  ];

  if (loading) return (
    <div className="w-full pt-4 md:pt-6 px-4 md:px-8 pb-24 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-4 glass-panel rounded-2xl p-8 flex flex-col items-center">
          <Skeleton className="w-32 h-32 rounded-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="md:col-span-8 glass-panel rounded-2xl p-8">
          <Skeleton className="h-6 w-48 mb-5" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full md:col-span-2 mt-4" />
          </div>
        </div>
      </div>
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
            background: glowBackground,
          }}
        />
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-sm font-semibold ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`w-full pt-4 md:pt-6 px-4 md:px-8 pb-24 relative z-10 max-w-5xl mx-auto ${isSaving ? 'pointer-events-none opacity-80' : ''}`}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface font-heading tracking-tight mb-1">Mon Profil</h1>
              <p className="text-on-surface-variant">Gérez vos informations et compétences.</p>
            </div>
            {activeTab === 'general' && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={isEditing ? handleSubmit(onSubmit) : () => setIsEditing(true)}
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
                  <img src={photoPreview || getAvatarUrl(userData?.nom || 'User')} alt={userData?.nom} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  {isEditing && (
                    <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Edit2 className="w-6 h-6 mb-1" />
                      <span className="text-xs font-bold">Modifier</span>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
                <h3 className="text-xl font-bold text-on-surface">{userData?.nom}</h3>
                {userData?.filiere && <p className="text-sm text-primary font-medium mt-1 bg-primary/10 px-3 py-1 rounded-full">{userData.filiere}</p>}
                {userData?.niveau_etude && <p className="text-xs text-on-surface-variant mt-2">{userData.niveau_etude}</p>}
                {userData?.email && <p className="text-xs text-on-surface-variant mt-1">{userData.email}</p>}
              </motion.div>

              {/* Info Form */}
              <motion.div whileHover={{ y: -4 }} className="md:col-span-8 glass-panel rounded-2xl p-8 shadow-xl">
                <h3 className="text-lg font-bold text-on-surface mb-5">Informations Personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'nom', label: 'Nom complet', type: 'text' },
                    { key: 'email', label: 'Email', type: 'email' },
                    { key: 'telephone', label: 'Téléphone', type: 'tel' },
                    { key: 'adresse', label: 'Adresse', type: 'text' },
                    { key: 'filiere', label: 'Filière', type: 'text' },
                    { key: 'niveau_etude', label: 'Niveau d\'étude', type: 'text' },
                  ].map(field => (
                    <div key={field.key} className="space-y-1 relative">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{field.label}</label>
                      <input type={field.type} {...register(field.key as keyof ProfileFormValues)} disabled={!isEditing} className={inputCls(isEditing)} />
                      {errors[field.key as keyof ProfileFormValues] && (
                        <p className="text-error text-xs absolute -bottom-5">{errors[field.key as keyof ProfileFormValues]?.message}</p>
                      )}
                    </div>
                  ))}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Bio</label>
                    <textarea {...register('bio')} disabled={!isEditing} rows={3} className={inputCls(isEditing) + ' resize-none'} />
                    {errors.bio && <p className="text-error text-xs absolute -bottom-5">{errors.bio.message}</p>}
                  </div>
                </div>
              </motion.div>

              {/* Skills */}
              <motion.div whileHover={{ y: -4 }} className="md:col-span-12 glass-panel rounded-2xl p-8 shadow-xl">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-bold text-on-surface">Compétences</h3>
                  <motion.button whileHover={{ scale: 1.05 }} onClick={handleSyncSkills} className="text-xs bg-primary text-white px-4 py-2 rounded-xl font-semibold">Enregistrer</motion.button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map(skill => (
                    <motion.button key={skill.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedSkillIds(prev => prev.includes(skill.id) ? prev.filter(id => id !== skill.id) : [...prev, skill.id])}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${selectedSkillIds.includes(skill.id) ? 'bg-primary text-white border-primary shadow-md' : 'bg-white/60 text-on-surface-variant border-outline-variant/30 hover:border-primary/50'}`}
                    >{skill.nom}</motion.button>
                  ))}
                  {allSkills.length === 0 && <p className="text-on-surface-variant text-sm">Aucune compétence disponible dans le référentiel.</p>}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'experiences' && (
            <motion.div key="experiences" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-panel rounded-2xl p-8 shadow-xl">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/20">
                  <h3 className="text-lg font-bold text-on-surface">Expériences &amp; Formations</h3>
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => {
                    setEditingExpId(null);
                    setNewExp({ titre: '', entreprise: '', date_debut: '', date_fin: '' });
                    setShowAddExp(!showAddExp);
                  }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold">
                    <Plus className="w-4 h-4" /> Ajouter
                  </motion.button>
                </div>

                {/* Add Experience Form */}
                <AnimatePresence>
                  {showAddExp && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-5 bg-surface-container/50 rounded-2xl border border-outline-variant/30">
                      <h4 className="font-bold text-on-surface mb-4">Nouvelle expérience</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[{key:'titre',label:'Titre du poste'},{key:'entreprise',label:'Entreprise'}].map(f => (
                          <div key={f.key}>
                            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1">{f.label}</label>
                            <input value={newExp[f.key as keyof typeof newExp] as string} onChange={e => setNewExp(n => ({...n,[f.key]:e.target.value}))} className="w-full border border-outline-variant/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary" />
                          </div>
                        ))}
                        {[{key:'date_debut',label:'Date début'},{key:'date_fin',label:'Date fin (optionnel)'}].map(f => (
                          <div key={f.key}>
                            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1">{f.label}</label>
                            <input type="date" value={newExp[f.key as keyof typeof newExp] as string} onChange={e => setNewExp(n => ({...n,[f.key]:e.target.value}))} className="w-full border border-outline-variant/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary" />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3 mt-4">
                        <motion.button whileHover={{ scale: 1.03 }} onClick={handleAddExp} className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold">
                          {editingExpId ? 'Mettre à jour' : 'Enregistrer'}
                        </motion.button>
                        <button onClick={() => { setShowAddExp(false); setEditingExpId(null); setNewExp({ titre: '', entreprise: '', date_debut: '', date_fin: '' }); }} className="text-on-surface-variant text-sm px-5 py-2 rounded-xl hover:bg-surface-container">Annuler</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Experiences List */}
                {userData?.experiences?.length === 0 ? (
                  <p className="text-on-surface-variant text-center py-10">Aucune expérience ajoutée.</p>
                ) : (
                  <div className="relative border-l-2 border-outline-variant/30 ml-4 space-y-8 pb-4">
                    {userData?.experiences?.map((exp, i) => (
                      <motion.div key={exp.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="relative pl-8 group">
                        <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-1 border-2 border-white shadow-sm" />
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-base font-bold text-on-surface">{exp.titre}</h4>
                            <p className="text-primary font-medium text-sm">{exp.entreprise}</p>
                            <p className="text-xs text-on-surface-variant mt-1">
                              {new Date(exp.date_debut).toLocaleDateString('fr-FR')} — {exp.date_fin ? new Date(exp.date_fin).toLocaleDateString('fr-FR') : 'Présent'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <motion.button aria-label="Modifier l'expérience" whileHover={{ scale: 1.1 }} onClick={() => handleEditClick(exp)} className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white" title="Modifier">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </motion.button>
                            <motion.button aria-label="Supprimer l'expérience" whileHover={{ scale: 1.1 }} onClick={() => handleDeleteExp(exp.id)} className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center hover:bg-error hover:text-white" title="Supprimer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'parametres' && (
            <motion.div key="parametres" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Change Password */}
              <div className="glass-panel rounded-2xl p-8 shadow-xl">
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-5"><Lock className="w-5 h-5 text-primary" />Changer le mot de passe</h3>
                <div className="space-y-4">
                  {[{key:'current_password',label:'Mot de passe actuel'},{key:'new_password',label:'Nouveau mot de passe'},{key:'new_password_confirmation',label:'Confirmer le nouveau'}].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1">{f.label}</label>
                      <input type="password" value={pwForm[f.key as keyof typeof pwForm]} onChange={e => setPwForm(p => ({...p,[f.key]:e.target.value}))} className="w-full border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                  ))}
                  <motion.button whileHover={{ scale: 1.02 }} onClick={handleChangePassword} className="w-full bg-primary text-white py-3 rounded-xl font-semibold mt-2">Mettre à jour</motion.button>
                </div>
              </div>

              {/* Notifications */}
              <div className="glass-panel rounded-2xl p-8 shadow-xl">
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-5"><Bell className="w-5 h-5 text-secondary" />Notifications</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Nouvelles offres correspondantes', desc: 'Email quand une offre correspond à votre profil' },
                    { label: 'Mise à jour de candidature', desc: 'Alertes de changement de statut' },
                    { label: 'Messages recruteurs', desc: 'Notifications pour les nouveaux messages' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-outline-variant/20">
                      <div>
                        <h4 className="font-semibold text-on-surface text-sm">{item.label}</h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={i !== 2} />
                        <div className="w-11 h-6 bg-outline-variant/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
