'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { apiFetch } from '@/lib/api';

// Mock Data Types
type UserRole = 'etudiant' | 'entreprise' | 'mentor' | 'admin';
type UserStatus = 'Actif' | 'Banni' | 'En attente';

interface User {
  id: string;
  nom: string;
  email: string;
  telephone?: string;
  role: UserRole;
  is_blocked: boolean;
  est_valide: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  photo?: string;
  candidatures?: any[];
  offres_stages?: any[];
  skills?: any[];
}

const getToken = () => document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

// Generate a consistent color from a string (user name)
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-primary/20 text-primary',
    'bg-tertiary/20 text-tertiary',
    'bg-secondary/20 text-secondary',
    'bg-green-100 text-green-700',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Build the correct photo URL
const getPhotoUrl = (photo: string | null | undefined): string | null => {
  if (!photo) return null;
  // Already a full URL
  if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
  // If it already starts with /storage
  if (photo.startsWith('/storage/')) return `http://localhost:8000${photo}`;
  // Relative path — prepend backend URL
  return `http://localhost:8000/storage/${photo}`;
};

export default function AdminUsersContent() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'Tous'>('Tous');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'Tous'>('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Action State
  const [showBanModal, setShowBanModal] = useState(false);
  const [userToBan, setUserToBan] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Add User State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ nom: '', email: '', password: '', role: 'etudiant' });
  const [isAdding, setIsAdding] = useState(false);

  // Tab State: 'active' or 'trashed'
  const [activeTab, setActiveTab] = useState<'active'|'trashed'>('active');

  // Trashed Users State
  const [trashedUsers, setTrashedUsers] = useState<User[]>([]);
  const [trashedPage, setTrashedPage] = useState(1);
  const [trashedTotalPages, setTrashedTotalPages] = useState(1);
  const [trashedTotal, setTrashedTotal] = useState(0);
  const [isTrashedLoading, setIsTrashedLoading] = useState(false);

  // Detail Drawer State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  // Toast
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success'|'error'}>({show: false, message: '', type: 'success'});

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
      });
      if (roleFilter !== 'Tous') params.append('role', roleFilter.toLowerCase());
      if (statusFilter !== 'Tous') params.append('status', statusFilter);
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);

      const res = await apiFetch(`/admin/users?${params.toString()}`);

      if (res.ok) {
        const data = await res.json();
        const pagination = data.data; // Laravel paginator
        setUsers(pagination.data);
        setTotalPages(pagination.last_page);
        setTotalUsers(pagination.total);
      }
    } catch (e) {
      console.error('Erreur lors du chargement des utilisateurs', e);
      showToast("Impossible de charger les données.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, roleFilter, statusFilter, debouncedSearchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter, debouncedSearchQuery]);

  useEffect(() => {
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

  const exportToCSV = () => {
    if (users.length === 0) return showToast("Aucune donnée à exporter", "error");
    
    const headers = ["Nom", "Email", "Rôle", "Statut", "Date d'inscription"];
    const csvContent = [
      headers.join(","),
      ...users.map(u => [
        `"${u.nom}"`, 
        `"${u.email}"`, 
        `"${u.role}"`, 
        `"${getUserStatus(u)}"`, 
        `"${new Date(u.created_at).toLocaleDateString('fr-FR')}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `utilisateurs_nexusintern_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exportation réussie !", "success");
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await apiFetch(`/register`, {
        method: 'POST',
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        showToast("Utilisateur ajouté avec succès.", "success");
        setShowAddModal(false);
        setNewUser({ nom: '', email: '', password: '', role: 'etudiant' });
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.message || "Erreur lors de l'ajout.", "error");
      }
    } catch (e) {
      showToast("Erreur réseau.", "error");
    } finally {
      setIsAdding(false);
    }
  };

  // Actions
  const handleBanUserClick = (user: User) => {
    setUserToBan(user);
    setShowBanModal(true);
  };

  const confirmBanUser = async () => {
    if (!userToBan) return;
    setIsProcessing(true);
    
    try {
      const res = await apiFetch(`/admin/users/${userToBan.id}/toggle-block`, {
        method: 'PATCH'
      });
      if (res.ok) {
        showToast(`Le compte de ${userToBan.nom} a été suspendu avec succès.`, 'success');
        fetchUsers(); // refresh data
      } else {
        showToast("Erreur lors de la suspension du compte.", "error");
      }
    } catch (e) {
      showToast("Erreur réseau.", "error");
    } finally {
      setIsProcessing(false);
      setShowBanModal(false);
      setUserToBan(null);
    }
  };

  const unbanUser = async (user: User) => {
    try {
      const res = await apiFetch(`/admin/users/${user.id}/toggle-block`, {
        method: 'PATCH'
      });
      if (res.ok) {
        showToast(`Utilisateur débanni avec succès.`, 'success');
        fetchUsers(); // refresh data
      } else {
        showToast("Erreur lors du débannissement.", "error");
      }
    } catch (e) {
      showToast("Erreur réseau.", "error");
    }
  };

  const fetchTrashedUsers = useCallback(async () => {
    setIsTrashedLoading(true);
    try {
      const params = new URLSearchParams({ page: trashedPage.toString() });
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      const res = await apiFetch(`/admin/users/trashed?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTrashedUsers(data.data.data);
        setTrashedTotalPages(data.data.last_page);
        setTrashedTotal(data.data.total);
      }
    } catch (e) { console.error(e); } finally { setIsTrashedLoading(false); }
  }, [trashedPage, debouncedSearchQuery]);

  useEffect(() => { if (activeTab === 'trashed') fetchTrashedUsers(); }, [activeTab, fetchTrashedUsers]);

  const fetchUserDetails = async (userId: string) => {
    setIsDetailLoading(true);
    setShowDetailDrawer(true);
    try {
      const res = await apiFetch(`/admin/users/${userId}/details`);
      if (res.ok) { const data = await res.json(); setSelectedUser(data.data); }
    } catch (e) { showToast("Erreur chargement détails", "error"); } finally { setIsDetailLoading(false); }
  };

  const softDeleteUser = async (user: User) => {
    try {
      const res = await apiFetch(`/admin/users/${user.id}`, {
        method: 'DELETE'
      });
      if (res.ok) { showToast(`Compte de ${user.nom} archivé.`); fetchUsers(); }
      else showToast("Erreur lors de l'archivage.", "error");
    } catch (e) { showToast("Erreur réseau.", "error"); }
  };

  const restoreUser = async (userId: string, userName: string) => {
    try {
      const res = await apiFetch(`/admin/users/${userId}/restore`, {
        method: 'PATCH'
      });
      if (res.ok) { showToast(`Compte de ${userName} restauré !`); fetchTrashedUsers(); }
      else showToast("Erreur lors de la restauration.", "error");
    } catch (e) { showToast("Erreur réseau.", "error"); }
  };

  // UI Helpers
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-error/10 text-error border-error/20';
      case 'entreprise': return 'bg-tertiary/10 text-tertiary border-tertiary/20';
      case 'mentor': return 'bg-secondary/10 text-secondary border-secondary/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getUserStatus = (user: User): UserStatus => {
    if (user.is_blocked) return 'Banni';
    if (user.role === 'entreprise' && !user.est_valide) return 'En attente';
    return 'Actif';
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case 'Actif': return 'bg-green-100 text-green-800 border-green-200 shadow-sm';
      case 'Banni': return 'bg-red-100 text-red-800 border-red-200 shadow-sm';
      case 'En attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200 shadow-sm';
    }
  };

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-surface text-on-surface">
      {/* Dynamic 3D Ambient Background Elements */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23a53b22' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          transform: `translateY(${scrollY * 0.05}px)`,
        }}
      />

      <motion.div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-500 mix-blend-multiply"
        style={{
          opacity: cursorGlowOpacity,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(165,59,34, 0.08), transparent 70%)`
        }}
      />
      
      {/* Floating 3D Orbs */}
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="fixed top-1/4 -left-20 w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"
      />
      <motion.div
        animate={{ y: [0, 40, 0], x: [0, -40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed bottom-10 right-10 w-[40vw] h-[40vw] bg-tertiary/10 rounded-full blur-[120px] pointer-events-none -z-10"
      />

      {/* Mobile Top Header */}
      <div className="md:hidden flex justify-between items-center p-4 bg-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/20 shadow-sm">
        <h2 className="font-heading text-primary font-bold text-xl">NexusIntern Admin</h2>
        <button className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-primary shadow-sm">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      <main className="w-full p-4 md:p-10 min-h-screen relative z-10 flex flex-col max-w-[1440px] mx-auto perspective-1000">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: 20, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-6"
        >
          <div>
            <h1 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tighter text-primary drop-shadow-sm">
              Utilisateurs
            </h1>
            <p className="font-body-base text-on-surface-variant mt-2 font-medium">
              Gérez les comptes, les rôles et les accès de manière dynamique.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToCSV}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/80 backdrop-blur-md border border-white/80 text-on-surface font-label-caps font-bold py-3 px-6 rounded-xl shadow-sm hover:shadow-md hover:bg-white transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Exporter
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white font-label-caps font-bold py-3 px-6 rounded-xl shadow-[0_8px_32px_0_rgba(165,59,34,0.2)] hover:shadow-[0_12px_40px_0_rgba(165,59,34,0.4)] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Ajouter
            </motion.button>
          </div>
        </motion.header>

        {/* Filters & Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg rounded-[2rem] p-4 md:p-6 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center z-20 relative hover:-translate-y-1 transition-transform duration-500"
        >
          {/* Search */}
          <div className="relative w-full lg:w-96 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
              search
            </span>
            <input 
              type="text" 
              placeholder="Rechercher par nom ou email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/50 border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
            />
          </div>

          {/* Select Filters */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-48">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">badge</span>
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="w-full bg-white/50 border border-outline-variant/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold text-on-surface cursor-pointer shadow-sm transition-all"
              >
                <option value="Tous">Tous les rôles</option>
                <option value="Étudiant">Étudiants</option>
                <option value="Entreprise">Entreprises</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
            </div>
            
            <div className="relative flex-1 sm:w-48">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">rule</span>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-white/50 border border-outline-variant/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold text-on-surface cursor-pointer shadow-sm transition-all"
              >
                <option value="Tous">Tous les statuts</option>
                <option value="Actif">Actifs</option>
                <option value="Banni">Bannis</option>
                <option value="En attente">En attente (KYC)</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs: Active / Trashed */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 mb-6">
          {(['active', 'trashed'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'bg-white/60 text-on-surface-variant hover:bg-white/80 border border-outline-variant/20'}`}
            >
              <span className="material-symbols-outlined text-[16px] mr-1 align-middle">{tab === 'active' ? 'group' : 'delete'}</span>
              {tab === 'active' ? `Utilisateurs actifs (${totalUsers})` : `Corbeille (${trashedTotal})`}
            </button>
          ))}
        </motion.div>

        {/* Active Users Table */}
        {activeTab === 'active' && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg rounded-[2.5rem] overflow-hidden relative flex-1 flex flex-col group hover:-translate-y-1 transition-transform duration-500"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-secondary/10 to-transparent rounded-full blur-[100px] pointer-events-none -mr-40 -mt-40" />

          <div className="overflow-x-auto custom-scrollbar flex-1 relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/40 border-b border-outline-variant/20 backdrop-blur-md">
                  <th className="p-5 md:p-6 font-label-caps text-xs text-primary font-extrabold uppercase tracking-widest">Utilisateur</th>
                  <th className="p-5 md:p-6 font-label-caps text-xs text-primary font-extrabold uppercase tracking-widest hidden lg:table-cell">Téléphone</th>
                  <th className="p-5 md:p-6 font-label-caps text-xs text-primary font-extrabold uppercase tracking-widest">Rôle</th>
                  <th className="p-5 md:p-6 font-label-caps text-xs text-primary font-extrabold uppercase tracking-widest">Statut</th>
                  <th className="p-5 md:p-6 font-label-caps text-xs text-primary font-extrabold uppercase tracking-widest hidden md:table-cell">Inscription</th>
                  <th className="p-5 md:p-6 font-label-caps text-xs text-primary font-extrabold uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="relative">
                {isLoading ? (
                   <tr><td colSpan={6} className="p-12 text-center h-64"><div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-20"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div></td></tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {users.length === 0 ? (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td colSpan={6} className="p-16 text-center">
                          <div className="flex flex-col items-center">
                            <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-4">search_off</span>
                            <h3 className="text-xl font-bold font-heading text-on-surface mb-2">Aucun résultat</h3>
                          </div>
                        </td>
                      </motion.tr>
                    ) : (
                      users.map((user, i) => {
                        const status = getUserStatus(user);
                        return (
                          <motion.tr 
                            key={user.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05, duration: 0.4, type: 'spring' }}
                            className="border-b border-outline-variant/10 hover:bg-white/60 transition-colors group/row"
                          >
                            {/* User Profile */}
                            <td className="p-5 md:p-6">
                              <div className="flex items-center gap-4">
                                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className={`w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md flex items-center justify-center font-bold text-xl ${!getPhotoUrl(user.photo) ? getAvatarColor(user.nom) : 'bg-surface-container'}`}>
                                  {getPhotoUrl(user.photo) ? (
                                    <img src={getPhotoUrl(user.photo)!} alt={user.nom} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.textContent = user.nom.charAt(0).toUpperCase(); }} />
                                  ) : (
                                    user.nom.charAt(0).toUpperCase()
                                  )}
                                </motion.div>
                                <div>
                                  <p className="font-bold text-on-surface group-hover/row:text-primary transition-colors line-clamp-1">{user.nom}</p>
                                  <p className="text-xs text-on-surface-variant font-medium mt-0.5 line-clamp-1">{user.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Telephone */}
                            <td className="p-5 md:p-6 hidden lg:table-cell">
                              <span className="text-sm text-on-surface font-medium">{user.telephone || '—'}</span>
                            </td>

                            {/* Role */}
                            <td className="p-5 md:p-6">
                              <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border shadow-sm ${getRoleBadgeColor(user.role)}`}>
                                {user.role}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="p-5 md:p-6">
                              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center w-fit gap-2 ${getStatusBadgeColor(status)}`}>
                                {status === 'Actif' && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                                {status === 'Banni' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                                {status === 'En attente' && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>}
                                {status}
                              </span>
                            </td>

                            {/* Registered At */}
                            <td className="p-5 md:p-6 hidden md:table-cell">
                              <p className="text-sm text-on-surface font-bold">
                                {new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                              <p className="text-xs text-on-surface-variant mt-0.5">
                                {new Date(user.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </td>

                            {/* Actions */}
                            <td className="p-5 md:p-6 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-all transform translate-x-4 group-hover/row:translate-x-0">
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  onClick={() => fetchUserDetails(user.id)}
                                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm border border-outline-variant/20 hover:border-primary/50 text-on-surface-variant hover:text-primary transition-all"
                                  title="Voir détails & historique"
                                >
                                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </motion.button>
                                
                                {status === 'Banni' ? (
                                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={() => unbanUser(user)}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-50 shadow-sm border border-green-200 text-green-600 transition-all"
                                    title="Débannir"
                                  ><span className="material-symbols-outlined text-[18px]">how_to_reg</span></motion.button>
                                ) : (
                                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={() => handleBanUserClick(user)}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-error/10 shadow-sm border border-error/20 text-error transition-all"
                                    title="Bloquer"
                                  ><span className="material-symbols-outlined text-[18px]">block</span></motion.button>
                                )}

                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  onClick={() => { if(confirm(`Archiver ${user.nom} ?`)) softDeleteUser(user); }}
                                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-50 shadow-sm border border-amber-200 text-amber-600 transition-all"
                                  title="Archiver (supprimer)"
                                ><span className="material-symbols-outlined text-[18px]">archive</span></motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 md:p-6 border-t border-outline-variant/20 flex justify-between items-center bg-white/40 backdrop-blur-md relative z-10">
              <p className="text-sm text-on-surface-variant font-medium">
                Affichage <span className="font-bold text-on-surface">{(currentPage - 1) * 10 + 1}</span> - <span className="font-bold text-on-surface">{Math.min(currentPage * 10, totalUsers)}</span> sur <span className="font-bold text-on-surface">{totalUsers}</span>
              </p>
              <div className="flex gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-outline-variant/30 disabled:opacity-50 disabled:pointer-events-none hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </motion.button>
                <div className="flex items-center justify-center px-4 font-bold text-sm bg-white rounded-xl shadow-sm border border-outline-variant/30">
                  {currentPage} / {totalPages}
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-outline-variant/30 disabled:opacity-50 disabled:pointer-events-none hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
        )}

        {/* Trashed Users Table */}
        {activeTab === 'trashed' && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg rounded-[2.5rem] overflow-hidden relative flex-1 flex flex-col">
          <div className="overflow-x-auto custom-scrollbar flex-1 relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-red-50/40 border-b border-red-200/30 backdrop-blur-md">
                  <th className="p-5 font-label-caps text-xs text-error font-extrabold uppercase tracking-widest">Utilisateur</th>
                  <th className="p-5 font-label-caps text-xs text-error font-extrabold uppercase tracking-widest">Rôle</th>
                  <th className="p-5 font-label-caps text-xs text-error font-extrabold uppercase tracking-widest hidden md:table-cell">Supprimé le</th>
                  <th className="p-5 font-label-caps text-xs text-error font-extrabold uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isTrashedLoading ? (
                  <tr><td colSpan={4} className="p-12 text-center"><div className="w-10 h-10 border-4 border-error border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                ) : trashedUsers.length === 0 ? (
                  <tr><td colSpan={4} className="p-16 text-center"><span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2 block">delete_sweep</span><p className="font-bold text-on-surface-variant">La corbeille est vide.</p></td></tr>
                ) : trashedUsers.map((user, i) => (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-outline-variant/10 hover:bg-red-50/30 transition-colors group/row">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${getAvatarColor(user.nom)} opacity-60`}>{user.nom.charAt(0).toUpperCase()}</div>
                        <div><p className="font-bold text-on-surface/60 line-through line-clamp-1">{user.nom}</p><p className="text-xs text-on-surface-variant">{user.email}</p></div>
                      </div>
                    </td>
                    <td className="p-5"><span className={`px-3 py-1 rounded-xl text-[11px] font-bold uppercase border opacity-60 ${getRoleBadgeColor(user.role)}`}>{user.role}</span></td>
                    <td className="p-5 hidden md:table-cell"><p className="text-sm text-error font-medium">{user.deleted_at ? new Date(user.deleted_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p></td>
                    <td className="p-5 text-right">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => restoreUser(user.id, user.nom)}
                        className="px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold hover:bg-green-100 transition-all flex items-center gap-1.5 ml-auto">
                        <span className="material-symbols-outlined text-[16px]">restore</span> Restaurer
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {trashedTotalPages > 1 && (
            <div className="p-4 border-t border-outline-variant/20 flex justify-between items-center bg-white/40">
              <p className="text-sm text-on-surface-variant">Page {trashedPage}/{trashedTotalPages} — {trashedTotal} archivé(s)</p>
              <div className="flex gap-2">
                <button onClick={() => setTrashedPage(p => Math.max(1, p - 1))} disabled={trashedPage === 1} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border disabled:opacity-50"><span className="material-symbols-outlined">chevron_left</span></button>
                <button onClick={() => setTrashedPage(p => Math.min(trashedTotalPages, p + 1))} disabled={trashedPage === trashedTotalPages} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border disabled:opacity-50"><span className="material-symbols-outlined">chevron_right</span></button>
              </div>
            </div>
          )}
        </motion.div>
        )}
      </main>

      {/* User Detail Drawer */}
      <AnimatePresence>
        {showDetailDrawer && (
          <div className="fixed inset-0 z-[90] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetailDrawer(false)} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
              className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-xl shadow-2xl h-full overflow-y-auto border-l border-white">
              {isDetailLoading ? (
                <div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
              ) : selectedUser ? (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-heading text-2xl font-extrabold text-primary">Détails du profil</h3>
                    <button onClick={() => setShowDetailDrawer(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-outline-variant/30 text-on-surface-variant"><span className="material-symbols-outlined">close</span></button>
                  </div>
                  {/* User Info Card */}
                  <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-sm mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl ${getAvatarColor(selectedUser.nom)}`}>{selectedUser.nom.charAt(0).toUpperCase()}</div>
                      <div>
                        <h4 className="font-bold text-lg">{selectedUser.nom}</h4>
                        <p className="text-sm text-on-surface-variant">{selectedUser.email}</p>
                        {selectedUser.telephone && <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1"><span className="material-symbols-outlined text-[14px]">call</span>{selectedUser.telephone}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-surface-container/30 p-3 rounded-xl"><p className="text-on-surface-variant text-xs font-bold uppercase mb-1">Rôle</p><p className="font-bold capitalize">{selectedUser.role}</p></div>
                      <div className="bg-surface-container/30 p-3 rounded-xl"><p className="text-on-surface-variant text-xs font-bold uppercase mb-1">Inscrit le</p><p className="font-bold">{new Date(selectedUser.created_at).toLocaleDateString('fr-FR')}</p></div>
                    </div>
                  </div>
                  {/* Skills */}
                  {selectedUser.skills && selectedUser.skills.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-3">Compétences</h4>
                      <div className="flex flex-wrap gap-2">{selectedUser.skills.map((s: any) => <span key={s.id} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">{s.nom}</span>)}</div>
                    </div>
                  )}
                  {/* Candidatures (Student) */}
                  {selectedUser.role === 'etudiant' && selectedUser.candidatures && (
                    <div className="mb-6">
                      <h4 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-3">Candidatures ({selectedUser.candidatures.length})</h4>
                      {selectedUser.candidatures.length === 0 ? <p className="text-sm text-on-surface-variant italic">Aucune candidature.</p> :
                        <div className="flex flex-col gap-2">{selectedUser.candidatures.map((c: any) => (
                          <div key={c.id} className="bg-white p-4 rounded-xl border border-outline-variant/20 shadow-sm">
                            <p className="font-bold text-sm line-clamp-1">{c.offre_stage?.titre || 'Offre supprimée'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.statut === 'accepte' ? 'bg-green-100 text-green-700' : c.statut === 'refuse' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.statut}</span>
                              <span className="text-xs text-on-surface-variant">{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        ))}</div>
                      }
                    </div>
                  )}
                  {/* Offers (Enterprise) */}
                  {selectedUser.role === 'entreprise' && selectedUser.offres_stages && (
                    <div className="mb-6">
                      <h4 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-3">Offres publiées ({selectedUser.offres_stages.length})</h4>
                      {selectedUser.offres_stages.length === 0 ? <p className="text-sm text-on-surface-variant italic">Aucune offre.</p> :
                        <div className="flex flex-col gap-2">{selectedUser.offres_stages.map((o: any) => (
                          <div key={o.id} className="bg-white p-4 rounded-xl border border-outline-variant/20 shadow-sm">
                            <p className="font-bold text-sm line-clamp-1">{o.titre}</p>
                            <p className="text-xs text-on-surface-variant mt-1">{o.ville || 'À distance'} • {o.statut}</p>
                          </div>
                        ))}</div>
                      }
                    </div>
                  )}
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ban Confirmation Modal */}
      <AnimatePresence>
        {showBanModal && userToBan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setShowBanModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30, rotateX: -20 }}
              className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 max-w-md w-full relative z-10 shadow-2xl border border-white"
              style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
            >
              <div className="w-20 h-20 rounded-[1.5rem] bg-error/10 text-error flex items-center justify-center mb-6 mx-auto shadow-inner border border-error/20">
                <span className="material-symbols-outlined text-4xl">gavel</span>
              </div>
              <h3 className="text-2xl font-bold text-center font-heading text-on-surface mb-2">Suspendre l'accès ?</h3>
              <p className="text-center text-on-surface-variant font-medium mb-6">
                Êtes-vous sûr de vouloir bannir <strong>{userToBan.nom}</strong> ? Son accès à la plateforme sera immédiatement révoqué et ses jetons détruits.
              </p>
              
              <div className="bg-white rounded-2xl p-4 mb-8 flex items-center gap-4 shadow-sm border border-outline-variant/20">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center font-bold text-primary text-xl shadow-inner">
                  {userToBan.nom.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{userToBan.email}</p>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mt-1">{userToBan.role}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  disabled={isProcessing}
                  onClick={() => setShowBanModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-on-surface bg-surface-container hover:bg-outline-variant/20 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={confirmBanUser}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-error hover:bg-error/90 transition-all shadow-[0_8px_20px_0_rgba(186,26,26,0.3)] flex items-center justify-center disabled:opacity-80"
                >
                  {isProcessing ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined">
                      sync
                    </motion.span>
                  ) : (
                    "Oui, Bannir"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isAdding && setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30, rotateX: -20 }}
              className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 max-w-md w-full relative z-10 shadow-2xl border border-white"
              style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold font-heading text-on-surface">Ajouter un utilisateur</h3>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-outline-variant/30 text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleAddUser} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">Nom complet</label>
                  <input type="text" required value={newUser.nom} onChange={e => setNewUser({...newUser, nom: e.target.value})} className="w-full bg-white/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" placeholder="Entrez le nom" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">Adresse Email</label>
                  <input type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-white/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" placeholder="email@exemple.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">Mot de passe</label>
                  <input type="password" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-white/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" placeholder="Min. 8 caractères" minLength={8} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">Rôle</label>
                  <div className="relative">
                    <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-white/50 border border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 appearance-none shadow-sm cursor-pointer">
                      <option value="etudiant">Étudiant</option>
                      <option value="entreprise">Entreprise</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isAdding}
                  className="mt-4 py-3.5 px-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center disabled:opacity-80"
                >
                  {isAdding ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined">
                      sync
                    </motion.span>
                  ) : (
                    "Créer l'utilisateur"
                  )}
                </button>
              </form>
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
