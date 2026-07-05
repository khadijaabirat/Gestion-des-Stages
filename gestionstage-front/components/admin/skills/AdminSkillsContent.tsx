'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';


export type SkillCategory = 'Développement' | 'Design' | 'Data' | 'Marketing' | 'Soft Skills';

interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  tags: string[];
  usageCount: number;
}

import { apiFetch } from '@/lib/api';

// MOCK DATA REMOVED

export default function AdminSkillsContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Data State
  const [skills, setSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | 'Toutes'>('Toutes');
  const [isLoading, setIsLoading] = useState(true);

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [skillToEdit, setSkillToEdit] = useState<Skill | null>(null);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Merge State
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [mainMergeSkillId, setMainMergeSkillId] = useState<string>('');

  // New Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('Développement');
  const [newSkillTags, setNewSkillTags] = useState('');

  // Toasts
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success'|'error'}>({show: false, message: '', type: 'success'});

  useEffect(() => {
    fetchSkills();

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setMousePosition({ x: e.clientX, y: e.clientY });
      setCursorGlowOpacity(1);
    };
    const handleMouseLeave = () => setCursorGlowOpacity(0);
    const handleScroll = () => setScrollY(window.scrollY);

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
    }
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mouseX, mouseY]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Derived State
  const filteredSkills = useMemo(() => {
    return skills.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'Toutes' || s.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [skills, searchQuery, categoryFilter]);

  const fetchSkills = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/skills');
      if (response.ok) {
        const data = await response.json();
        const mapped = data.data.map((s: any) => ({
          id: s.id.toString(),
          name: s.nom,
          category: s.category || 'Développement',
          level: s.level || 'Intermédiaire',
          tags: s.tags || [],
          usageCount: s.etudiants_count || 0
        }));
        setSkills(mapped);
      }
    } catch (e) {
      console.error(e);
      showToast('Erreur de chargement des compétences.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Actions
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      showToast('Le nom de la compétence est requis.', 'error');
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await apiFetch('/admin/skills', {
        method: 'POST',
        body: JSON.stringify({
          nom: newSkillName.trim(),
          category: newSkillCategory,
          tags: newSkillTags.split(',').map(t => t.trim()).filter(t => t)
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newSkill: Skill = {
          id: data.data.id.toString(),
          name: data.data.nom,
          category: data.data.category,
          tags: data.data.tags || [],
          usageCount: 0
        };
        
        setSkills(prev => [newSkill, ...prev]);
        setShowAddModal(false);
        setNewSkillName('');
        setNewSkillTags('');
        setNewSkillCategory('Développement');
        showToast('Compétence ajoutée avec succès.', 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Erreur lors de l\'ajout.', 'error');
      }
    } catch (e) {
      showToast('Erreur de connexion.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditClick = (skill: Skill) => {
    setSkillToEdit(skill);
    setNewSkillName(skill.name);
    setNewSkillCategory(skill.category);
    setNewSkillTags(skill.tags.join(', '));
    setShowEditModal(true);
  };

  const handleUpdateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillToEdit || !newSkillName.trim()) return;

    setIsProcessing(true);
    try {
      const response = await apiFetch(`/admin/skills/${skillToEdit.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          nom: newSkillName.trim(),
          category: newSkillCategory,
          tags: newSkillTags.split(',').map(t => t.trim()).filter(t => t)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSkills(prev => prev.map(s => s.id === skillToEdit.id ? {
          ...s,
          name: data.data.nom,
          category: data.data.category,
          tags: data.data.tags || []
        } : s));
        
        setShowEditModal(false);
        setSkillToEdit(null);
        setNewSkillName('');
        setNewSkillTags('');
        showToast('Compétence modifiée avec succès.', 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Erreur lors de la modification.', 'error');
      }
    } catch (e) {
      showToast('Erreur de connexion.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = (skill: Skill) => {
    setSkillToDelete(skill);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!skillToDelete) return;
    setIsProcessing(true);
    
    try {
      const response = await apiFetch(`/admin/skills/${skillToDelete.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSkills(prev => prev.filter(s => s.id !== skillToDelete.id));
        setShowDeleteModal(false);
        setSkillToDelete(null);
        showToast('Compétence supprimée définitivement.', 'success');
      } else {
        showToast('Erreur lors de la suppression.', 'error');
      }
    } catch (e) {
      showToast('Erreur de connexion.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleSkillSelection = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleMergeSkills = async () => {
    if (selectedSkills.length < 2 || !mainMergeSkillId) return;

    setIsProcessing(true);
    try {
      const response = await apiFetch(`/admin/skills/merge`, {
        method: 'POST',
        body: JSON.stringify({
          main_skill_id: mainMergeSkillId,
          duplicate_ids: selectedSkills.filter(id => id !== mainMergeSkillId)
        })
      });

      if (response.ok) {
        showToast('Compétences fusionnées avec succès.', 'success');
        setSelectedSkills([]);
        setShowMergeModal(false);
        setMainMergeSkillId('');
        fetchSkills(); // refresh the list to see changes
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Erreur lors de la fusion.', 'error');
      }
    } catch (e) {
      showToast('Erreur de connexion.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // UI Helpers
  const getCategoryColor = (category: SkillCategory) => {
    switch (category) {
      case 'Développement': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Design': return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
      case 'Data': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'Marketing': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'Soft Skills': return 'bg-teal-500/10 text-teal-600 border-teal-500/20';
    }
  };
  return (
    <div className="h-full w-full relative overflow-x-hidden bg-surface text-on-surface">
      {/* Background Pattern */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23a53b22' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          transform: `translateY(${scrollY * 0.05}px)`,
        }}
      />

      {/* Dynamic Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-500 mix-blend-multiply"
        style={{
          opacity: cursorGlowOpacity,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(165,59,34, 0.08), transparent 70%)`
        }}
      />

      

      {/* Mobile Top Header */}
      <div className="md:hidden flex justify-between items-center p-4 bg-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/20">
        <h2 className="font-heading text-primary font-bold text-xl">NexusIntern Admin</h2>
        <button className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      <main className="w-full p-4 md:p-10 min-h-screen relative z-10 flex flex-col max-w-[1600px] mx-auto">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-6"
        >
          <div>
            <h1 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tighter text-primary">
              Compétences
            </h1>
            <p className="font-body-base text-on-surface-variant mt-2 max-w-xl">
              Gérez la bibliothèque globale de compétences (Hard Skills & Soft Skills) utilisée par les étudiants et les entreprises.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white font-label-caps font-bold py-3 px-6 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg transition-shadow"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nouvelle Compétence
            </motion.button>
          </div>
        </motion.header>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] rounded-2xl p-4 md:p-6 mb-8 flex flex-col xl:flex-row gap-4 justify-between items-center z-20"
        >
          <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
            {/* Category Tabs */}
            <div className="flex p-1 bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-x-auto custom-scrollbar flex-shrink-0">
              {['Toutes', 'Développement', 'Design', 'Data', 'Marketing', 'Soft Skills'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat as any)}
                  className={`relative px-4 py-2.5 rounded-lg text-sm font-bold font-label-caps tracking-wider transition-colors whitespace-nowrap ${
                    categoryFilter === cat ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {categoryFilter === cat && (
                    <motion.div
                      layoutId="activeSkillCategory"
                      className="absolute inset-0 bg-white shadow-sm rounded-lg"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80 group flex-shrink-0">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                search
              </span>
              <input 
                type="text" 
                placeholder="Rechercher par nom ou tag..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Loading Skeletons OR Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white/40 backdrop-blur-md animate-pulse rounded-3xl h-48 border border-white/60 shadow-sm"></div>
              ))
            ) : filteredSkills.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="col-span-full bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-[0_8px_32px_0_rgba(165,59,34,0.05)]"
                >
                  <div className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/50">extension_off</span>
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-on-surface mb-2">Aucune compétence trouvée</h3>
                  <p className="text-on-surface-variant max-w-md">
                    Modifiez vos filtres ou ajoutez une nouvelle compétence à la bibliothèque.
                  </p>
                </motion.div>
              ) : (
                filteredSkills.map((skill, i) => (
                  <motion.div
                    key={skill.id}
                    layout
                    initial={{ opacity: 0, y: 30, rotateX: 10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotateX: -10 }}
                    transition={{ delay: i * 0.05, type: 'spring', damping: 20, stiffness: 100 }}
                    className="group relative h-full perspective-1000"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02, rotateY: 2, rotateX: -2, z: 20 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                      className={`bg-white/70 backdrop-blur-2xl border ${selectedSkills.includes(skill.id) ? 'border-primary ring-2 ring-primary/20 shadow-primary/20' : 'border-white/60'} shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] hover:shadow-[0_20px_50px_rgba(165,59,34,0.15)] rounded-[2rem] p-6 flex flex-col h-full transform-style-preserve-3d transition-all`}
                    >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleToggleSkillSelection(skill.id)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${selectedSkills.includes(skill.id) ? 'bg-primary border-primary text-white' : 'bg-surface-container border-outline-variant/50 text-transparent hover:border-primary/50'}`}
                        >
                          <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                        </button>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 uppercase tracking-wider ${getCategoryColor(skill.category)}`}>
                          {skill.category}
                        </div>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteClick(skill)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100"
                        title="Supprimer"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </motion.button>
                    </div>

                    <h3 className="text-xl font-bold font-heading text-on-surface mb-4 line-clamp-1">{skill.name}</h3>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {skill.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-surface-container-low text-on-surface-variant text-[10px] font-bold rounded-md border border-outline-variant/20 uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                      {skill.tags.length > 3 && (
                        <span className="px-2 py-1 bg-surface-container-low text-on-surface-variant text-[10px] font-bold rounded-md border border-outline-variant/20">
                          +{skill.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">group</span>
                        <span className="text-xs font-semibold">{skill.usageCount} profils</span>
                      </div>
                      <button 
                        onClick={() => handleEditClick(skill)}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Éditer <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                    </div>
                    </motion.div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
      </main>

      {/* Add Skill Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full relative z-10 shadow-2xl border border-white/80 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold font-heading text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-3xl">add_circle</span>
                  Ajouter une compétence
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleAddSkill} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Nom de la compétence</label>
                  <input 
                    type="text" 
                    autoFocus
                    required
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Ex: React.js, Management, etc."
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Catégorie</label>
                  <div className="relative">
                    <select 
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="Développement">Développement</option>
                      <option value="Design">Design</option>
                      <option value="Data">Data</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Soft Skills">Soft Skills</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Tags (séparés par des virgules)</label>
                  <input 
                    type="text" 
                    value={newSkillTags}
                    onChange={(e) => setNewSkillTags(e.target.value)}
                    placeholder="Ex: Frontend, JS, Web..."
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={isProcessing || !newSkillName.trim()}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined">
                        sync
                      </motion.span>
                    ) : (
                      "Enregistrer"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Skill Modal */}
      <AnimatePresence>
        {showEditModal && skillToEdit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setShowEditModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full relative z-10 shadow-2xl border border-white/80 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold font-heading text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-3xl">edit</span>
                  Modifier la compétence
                </h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleUpdateSkill} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Nom de la compétence</label>
                  <input 
                    type="text" 
                    autoFocus
                    required
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Ex: React.js, Management, etc."
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Catégorie</label>
                  <div className="relative">
                    <select 
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="Développement">Développement</option>
                      <option value="Design">Design</option>
                      <option value="Data">Data</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Soft Skills">Soft Skills</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Tags (séparés par des virgules)</label>
                  <input 
                    type="text" 
                    value={newSkillTags}
                    onChange={(e) => setNewSkillTags(e.target.value)}
                    placeholder="Ex: Frontend, JS, Web..."
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={isProcessing || !newSkillName.trim()}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined">
                        sync
                      </motion.span>
                    ) : (
                      "Enregistrer"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Merge Skills Modal */}
      <AnimatePresence>
        {showMergeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setShowMergeModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full relative z-10 shadow-2xl border border-white/80 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold font-heading text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-3xl">call_merge</span>
                  Fusionner {selectedSkills.length} Compétences
                </h3>
                <button 
                  onClick={() => setShowMergeModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-sm text-on-surface-variant">
                  Les étudiants ayant choisi ces doublons seront réassignés à la compétence principale que vous choisirez. Les autres doublons seront définitivement supprimés.
                </p>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2 font-label-caps">Choisir le nom définitif (à conserver)</label>
                  <div className="relative">
                    <select 
                      value={mainMergeSkillId}
                      onChange={(e) => setMainMergeSkillId(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>-- Sélectionner la compétence principale --</option>
                      {selectedSkills.map(id => {
                        const skill = skills.find(s => s.id === id);
                        return skill ? <option key={id} value={id}>{skill.name} ({skill.category})</option> : null;
                      })}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    disabled={isProcessing}
                    onClick={() => setShowMergeModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button 
                    disabled={isProcessing || !mainMergeSkillId}
                    onClick={handleMergeSkills}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined">
                        sync
                      </motion.span>
                    ) : (
                      "Fusionner"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && skillToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl border border-white/80 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">delete</span>
              </div>
              <h3 className="text-xl font-bold font-heading text-on-surface mb-2">Supprimer la compétence ?</h3>
              <p className="text-sm text-on-surface-variant mb-6">
                Êtes-vous sûr de vouloir supprimer <strong>{skillToDelete.name}</strong> ? Cette action est irréversible et retirera la compétence des profils.
              </p>
              
              <div className="flex gap-3">
                <button 
                  disabled={isProcessing}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-on-surface bg-white/80 hover:bg-surface-dim transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-error hover:bg-error/90 transition-all shadow-md shadow-error/20 flex items-center justify-center disabled:opacity-50"
                >
                  {isProcessing ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined">
                      sync
                    </motion.span>
                  ) : (
                    "Supprimer"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Bar for Merge */}
      <AnimatePresence>
        {selectedSkills.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] bg-on-surface text-surface px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                {selectedSkills.length}
              </div>
              <span className="font-bold text-sm">Compétences sélectionnées</span>
            </div>
            
            <div className="w-px h-8 bg-surface-variant/30" />

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedSkills([])}
                className="px-4 py-2 text-sm font-bold text-surface-variant hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={() => setShowMergeModal(true)}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-full shadow-md shadow-primary/20 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">call_merge</span>
                Fusionner les doublons
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-xl ${
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

