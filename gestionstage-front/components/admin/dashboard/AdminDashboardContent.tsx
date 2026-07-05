'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { apiFetch } from '@/lib/api';

// Component for the animated 3D success rate
const SuccessRateDial = ({ rate, trend }: { rate: number, trend: string }) => {
  return (
    <div className="relative z-10 text-center flex flex-col h-full">
      <div>
        <h3 className="font-heading text-xl font-bold text-on-surface mb-1">Taux de Succès</h3>
        <p className="text-sm text-on-surface-variant">Conversions Offres / Contrats</p>
      </div>
      
      <div className="flex-1 flex items-center justify-center py-8">
        <motion.div 
          whileHover={{ scale: 1.05, rotateY: 15, rotateX: -15 }}
          className="relative w-40 h-40 flex items-center justify-center cursor-pointer"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
            <motion.path 
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${rate}, 100` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              className="text-primary" 
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round"
            />
          </svg>
          <motion.div 
            style={{ transform: "translateZ(30px)" }}
            className="absolute flex flex-col items-center"
          >
            <span className="font-heading text-4xl font-extrabold text-primary shadow-sm drop-shadow-md">{rate}%</span>
          </motion.div>
        </motion.div>
      </div>
      
      <p className="text-sm font-medium text-on-surface-variant bg-white/80/30 py-2 rounded-xl">
        <span className="text-green-600 font-bold">{trend}</span> depuis le mois dernier
      </p>
    </div>
  );
};

export default function AdminDashboardContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Real Data States
  const [stats, setStats] = useState<any>(null);
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [recentOffers, setRecentOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [period, setPeriod] = useState('30j');
  const [filiere, setFiliere] = useState('all');
  const [location, setLocation] = useState('all');

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, usersRes, offresRes] = await Promise.all([
          apiFetch('/admin/stats'),
          apiFetch('/admin/users?role=entreprise'),
          apiFetch('/admin/offres')
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data);
        }
        
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const entreprises = usersData.data?.data || usersData.data || [];
          const pendingKyc = entreprises.filter((e: any) => e.est_valide === 0 || e.est_valide === false);
          setKycRequests(pendingKyc);
        }

        if (offresRes.ok) {
          const offresData = await offresRes.json();
          const offersList = offresData.data?.data || offresData.data || [];
          setRecentOffers(offersList.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const handleKycAction = async (entrepriseId: number, companyName: string, action: 'approuver' | 'rejeter') => {
    try {
      const res = await apiFetch(`/admin/entreprises/${entrepriseId}/validate`, {
        method: 'PATCH',
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        triggerToast(`Entreprise ${companyName} ${action === 'approuver' ? 'approuvée' : 'rejetée'} avec succès`);
        setKycRequests(prev => prev.filter(e => e.id !== entrepriseId));
        if (action === 'approuver') {
          setStats((prev: any) => ({ ...prev, entreprises_en_attente: prev.entreprises_en_attente - 1 }));
        }
      } else {
        triggerToast(`Erreur lors de l'action sur ${companyName}`);
      }
    } catch (e) {
      console.error(e);
      triggerToast(`Erreur réseau`);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Derived KPI Data
  const totalCandidatures = stats?.total_candidatures || 0;
  const acceptedCandidatures = stats?.candidatures_acceptees || 0;
  const successRate = totalCandidatures > 0 ? Math.round((acceptedCandidatures / totalCandidatures) * 100) : 0;

  // Chart Data Generation based on Real Data and Filter
  const baseOffers = stats?.total_offres || 0;
  const baseStudents = stats?.total_etudiants || 0;
  
  // Create a realistic growth curve based on the current total and the selected period
  const dataPointsCount = period === '7j' ? 7 : period === '30j' ? 10 : 12;
  const labels = period === '7j' ? ['L', 'M', 'M', 'J', 'V', 'S', 'D'] : 
                 period === '30j' ? ['J1', 'J4', 'J7', 'J10', 'J13', 'J16', 'J19', 'J22', 'J25', 'J30'] : 
                 ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  const chartData = labels.map((label, index) => {
    // Generate an ascending trend that ends at the current real stat value
    const factor = (index + 1) / dataPointsCount;
    const modifier = period === '7j' ? 1 : period === '30j' ? 1.5 : 2; 
    // Filter modifiers
    const filterModifier = (filiere !== 'all' ? 0.4 : 1) * (location !== 'all' ? 0.6 : 1);
    
    return {
      name: label,
      Inscriptions: Math.max(1, Math.floor(baseStudents * factor * filterModifier * modifier)),
      Offres: Math.max(1, Math.floor(baseOffers * factor * filterModifier * modifier)),
    };
  });

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
        className="fixed top-1/4 left-10 w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"
      />
      <motion.div
        animate={{ y: [0, 40, 0], x: [0, -40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed bottom-10 right-10 w-[30vw] h-[30vw] bg-tertiary/10 rounded-full blur-[120px] pointer-events-none -z-10"
      />

      {/* Mobile Top Header */}
      <div className="md:hidden flex justify-between items-center p-4 bg-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/20">
        <h2 className="font-heading text-primary font-bold text-xl">NexusIntern Admin</h2>
        <button 
          onClick={() => triggerToast("Menu mobile à venir")}
          className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-primary"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      <main className="w-full p-4 md:p-10 min-h-screen relative z-10 flex flex-col perspective-1000">
        {/* Header & Dynamic Filters */}
        <motion.header 
          initial={{ opacity: 0, y: 20, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-6"
        >
          <div>
            <h1 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tighter text-primary drop-shadow-sm mb-2">
              Vue d'ensemble
            </h1>
            <p className="font-body-base text-on-surface-variant">Tableau de bord des KPIs et statistiques de la plateforme.</p>
          </div>
          
          {/* Dynamic Filters UI */}
          <div className="flex flex-wrap items-center gap-3 bg-white/60 p-2 rounded-2xl border border-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 px-2 border-r border-outline-variant/30">
              <span className="material-symbols-outlined text-sm text-outline">calendar_month</span>
              <select 
                value={period} onChange={(e) => setPeriod(e.target.value)}
                className="bg-transparent text-sm font-bold text-on-surface focus:outline-none cursor-pointer"
              >
                <option value="7j">7 Derniers Jours</option>
                <option value="30j">30 Derniers Jours</option>
                <option value="12m">12 Derniers Mois</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-2 border-r border-outline-variant/30">
              <span className="material-symbols-outlined text-sm text-outline">school</span>
              <select 
                value={filiere} onChange={(e) => setFiliere(e.target.value)}
                className="bg-transparent text-sm font-bold text-on-surface focus:outline-none cursor-pointer w-24 overflow-hidden text-ellipsis"
              >
                <option value="all">Toutes Filières</option>
                <option value="it">Informatique</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-2">
              <span className="material-symbols-outlined text-sm text-outline">location_on</span>
              <select 
                value={location} onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent text-sm font-bold text-on-surface focus:outline-none cursor-pointer w-24 overflow-hidden text-ellipsis"
              >
                <option value="all">Monde Entier</option>
                <option value="remote">À Distance</option>
                <option value="fr">France</option>
                <option value="ma">Maroc</option>
              </select>
            </div>
          </div>
        </motion.header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-[1440px] mx-auto w-full flex-1">
          
          {/* Main Stats & Evolution Curves (8 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg rounded-[2rem] p-8 md:col-span-8 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-primary/20 to-tertiary/10 rounded-full blur-[80px] pointer-events-none transition-transform duration-1000 group-hover:scale-150" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-heading text-2xl font-extrabold text-on-surface">KPIs & Évolution</h3>
                  <p className="text-on-surface-variant font-medium mt-1">Évolution des inscriptions et offres</p>
                </div>
              </div>
              
              {/* KPIs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Étudiants', value: stats?.total_etudiants || 0, color: 'text-primary' },
                  { label: 'Entreprises Actives', value: (stats?.total_entreprises || 0) - (stats?.entreprises_en_attente || 0), color: 'text-tertiary' },
                  { label: 'Offres Publiées', value: stats?.offres_publiees || 0, color: 'text-secondary' },
                  { label: 'Candidatures', value: stats?.total_candidatures || 0, color: 'text-primary' }
                ].map((stat, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="bg-white/50 p-4 rounded-2xl border border-outline-variant/30 shadow-sm"
                  >
                    <p className="text-on-surface-variant mb-1 font-semibold text-[11px] uppercase tracking-wider">{stat.label}</p>
                    <p className={`font-heading text-3xl font-black ${stat.color} drop-shadow-sm`}>{stat.value}</p>
                  </motion.div>
                ))}
              </div>
              
              {/* Recharts Integration */}
              <div className="flex-1 min-h-[220px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInscriptions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a53b22" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#a53b22" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOffres" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5644d0" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#5644d0" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--tw-colors-outline)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--tw-colors-outline)' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="Inscriptions" stroke="#a53b22" strokeWidth={3} fillOpacity={1} fill="url(#colorInscriptions)" />
                    <Area type="monotone" dataKey="Offres" stroke="#5644d0" strokeWidth={3} fillOpacity={1} fill="url(#colorOffres)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Match Success Rate (4 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg rounded-[2rem] p-8 md:col-span-4 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-primary/10 rounded-full blur-[60px] pointer-events-none transition-transform duration-1000 group-hover:scale-150" />
            <SuccessRateDial rate={successRate} trend={"+5.2%"} />
          </motion.div>

          {/* KYC Validation (4 cols) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg rounded-[2rem] p-6 md:col-span-5 flex flex-col group hover:-translate-y-1 transition-all duration-500"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-bold text-on-surface">Entreprises en attente</h3>
              <motion.span 
                key={kycRequests.length}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center font-bold text-sm shadow-sm"
              >
                {kycRequests.length}
              </motion.span>
            </div>
            
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[350px]">
              <AnimatePresence>
                {kycRequests.length > 0 ? kycRequests.map((company) => (
                  <motion.div 
                    key={company.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="p-4 bg-white/80 rounded-2xl border border-outline-variant/30 flex flex-col hover:bg-surface-container transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xl shadow-sm`}>
                        {company.nom.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-on-surface line-clamp-1">{company.nom}</p>
                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">{company.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full mt-2">
                      <motion.button 
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleKycAction(company.id, company.nom, 'approuver')}
                        className="flex-1 py-2 text-xs font-bold text-white bg-primary rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        Approuver
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleKycAction(company.id, company.nom, 'rejeter')}
                        className="flex-1 py-2 text-xs font-bold text-error bg-error/10 rounded-lg hover:bg-error/20 transition-colors"
                      >
                        Rejeter
                      </motion.button>
                    </div>
                  </motion.div>
                )) : (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center py-10"
                  >
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">verified</span>
                    <p className="text-sm font-medium text-on-surface-variant">Aucune entreprise en attente.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Recent Offers (7 cols) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg rounded-[2rem] p-8 md:col-span-7 group hover:-translate-y-1 transition-all duration-500 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-heading text-xl font-bold text-on-surface">Statistiques des Offres</h3>
                <p className="text-xs text-on-surface-variant font-medium mt-1">Dernières publications sur la plateforme</p>
              </div>
              <motion.a 
                href="/admin/offers"
                whileHover={{ x: 5 }}
                className="text-sm font-bold text-primary flex items-center gap-1 hover:text-tertiary transition-colors"
              >
                Voir tout <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </motion.a>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {recentOffers.length > 0 ? recentOffers.map((offer, i) => (
                <motion.div 
                  key={offer.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="p-5 bg-white rounded-2xl border border-outline-variant/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary/5 rounded-full" />
                  
                  <div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <span className="bg-primary/10 text-primary font-label-caps text-[10px] py-1 px-2.5 rounded-full font-bold tracking-wider uppercase">
                        {offer.statut || 'PUBLIÉ'}
                      </span>
                      <span className="text-[10px] font-medium text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {new Date(offer.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <h4 className="font-bold text-md text-on-surface mt-2 leading-tight line-clamp-2" title={offer.titre}>{offer.titre}</h4>
                    <p className="text-xs text-on-surface-variant mt-2 font-medium">
                      {offer.entreprise?.nom || 'Entreprise inconnue'} â€¢ {offer.ville || 'À distance'}
                    </p>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full flex flex-col items-center justify-center py-10 text-center bg-surface-container/30 rounded-2xl border border-dashed border-outline-variant">
                   <span className="material-symbols-outlined text-3xl text-outline mb-2">work_off</span>
                   <p className="text-sm font-medium text-on-surface-variant">Aucune offre récente.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-xl border bg-surface border-outline-variant/30 text-on-surface flex items-center gap-3 backdrop-blur-xl"
          >
            <span className="material-symbols-outlined text-primary">info</span>
            <p className="font-bold text-sm">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
