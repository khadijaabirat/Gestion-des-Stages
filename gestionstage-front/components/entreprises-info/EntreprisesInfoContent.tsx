'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Users, BarChart3, Building, ArrowRight, CheckCircle2, Clock, XCircle, Activity } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';

const FEATURES = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Accès au top 1% des talents",
    description: "Notre algorithme filtre et met en avant les meilleurs profils étudiants, validés par notre équipe."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Recrutement ultra-rapide",
    description: "Publiez une offre en 2 minutes, recevez des candidatures ciblées le jour même."
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Processus sécurisé",
    description: "Des conventions de stage générées automatiquement et un suivi rigoureux garanti."
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Tableau de bord intelligent",
    description: "Gérez vos candidats, planifiez des entretiens et suivez vos statistiques de recrutement en temps réel."
  }
];

export default function EntreprisesInfoContent() {
  const [recentActivity, setRecentActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/home/data')
      .then(res => res.json())
      .then(data => {
        setRecentActivity(data.recent_activity);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getTimeAgo = (dateString: string) => {
    const diff = new Date().getTime() - new Date(dateString).getTime();
    const minutes = Math.max(0, Math.floor(diff / 60000));
    if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="w-full relative overflow-x-hidden bg-background pb-32">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="max-w-4xl mx-auto z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-8 backdrop-blur-md">
            <Building className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold tracking-widest text-secondary uppercase">Espace Entreprises</span>
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl font-black text-on-background tracking-tight mb-8 leading-tight">
            Recrutez les leaders de <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">demain.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-on-surface-variant font-medium max-w-2xl mx-auto mb-12">
            Rejoignez des centaines d'entreprises innovantes qui utilisent NexusIntern pour dénicher leurs prochains talents.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register?type=entreprise">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_15px_40px_rgba(var(--primary-rgb),0.5)] transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Publier une offre <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/offres">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-surface-variant/30 text-on-surface font-bold px-8 py-4 rounded-full hover:bg-surface-variant/50 transition-all w-full sm:w-auto justify-center"
              >
                Explorer la plateforme
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-secondary/10 blur-[120px] rounded-[100%] pointer-events-none -z-10" />
      </section>

      {/* Visual Showcase */}
      <section className="px-6 lg:px-12 mb-32 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, type: "spring" }}
          className="relative w-full aspect-video rounded-[2rem] glass-panel p-2 shadow-2xl overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent z-10 pointer-events-none" />
          <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=2000" 
              alt="Dashboard Entreprise" 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            {loading ? null : recentActivity ? (
              <div className="absolute bottom-10 left-10 glass-panel p-6 rounded-2xl max-w-sm hidden md:block backdrop-blur-xl bg-black/40 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-green-400 uppercase tracking-widest font-bold">Activité en direct de la plateforme</span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      recentActivity.statut === 'accepte' ? 'bg-green-500/30 text-green-400' :
                      recentActivity.statut === 'refuse' ? 'bg-red-500/30 text-red-400' :
                      'bg-primary/30 text-primary-light'
                  }`}>
                    {recentActivity.statut === 'accepte' ? <CheckCircle2 className="w-6 h-6" /> :
                     recentActivity.statut === 'refuse' ? <XCircle className="w-6 h-6" /> :
                     <Clock className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">
                      {recentActivity.statut === 'accepte' ? 'Candidature Acceptée' :
                       recentActivity.statut === 'refuse' ? 'Candidature Traitée' :
                       'Nouvelle Candidature'}
                    </p>
                    <p className="text-white/70 text-sm">{getTimeAgo(recentActivity.date)}</p>
                  </div>
                </div>
                <p className="text-white/90 text-sm font-medium">
                  {recentActivity.statut === 'accepte' ? `Un étudiant en ${recentActivity.etudiant_filiere} vient d'être accepté pour le poste de "${recentActivity.offre_titre}" chez ${recentActivity.entreprise_nom}.` :
                   recentActivity.statut === 'refuse' ? `L'entreprise ${recentActivity.entreprise_nom} vient de traiter une candidature pour "${recentActivity.offre_titre}".` :
                   `Un étudiant en ${recentActivity.etudiant_filiere} vient de postuler pour l'offre "${recentActivity.offre_titre}" chez ${recentActivity.entreprise_nom}.`}
                </p>
              </div>
            ) : (
              <div className="absolute bottom-10 left-10 glass-panel p-6 rounded-2xl max-w-sm hidden md:block backdrop-blur-xl bg-black/40 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-white/50" />
                  <p className="text-white font-bold text-lg">Plateforme en attente</p>
                </div>
                <p className="text-white/80 text-sm font-medium">
                  Aucune activité récente. Soyez la première entreprise à publier une offre et recevoir des candidatures.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-32">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-black text-on-background mb-6 tracking-tight">
            Pourquoi choisir <span className="text-primary">NexusIntern</span> ?
          </h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Une suite d'outils pensée par et pour les recruteurs exigeants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-panel p-8 rounded-[2rem] relative overflow-hidden group hover:shadow-[0_20px_40px_rgba(var(--secondary-rgb),0.1)] transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary/10 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 text-secondary shadow-inner group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-on-background mb-4 font-heading">{feature.title}</h3>
              <p className="text-on-surface-variant leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-panel p-12 md:p-20 rounded-[3rem] relative overflow-hidden shadow-2xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-white/20"
        >
          <div className="relative z-10">
            <h2 className="font-heading text-4xl md:text-5xl font-black mb-6">Prêt à transformer votre recrutement ?</h2>
            <p className="text-xl text-on-surface-variant font-medium mb-10 max-w-xl mx-auto">
              L'inscription est gratuite. Découvrez les profils de nos étudiants dès aujourd'hui.
            </p>
            <Link href="/register?type=entreprise">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-on-background text-background px-10 py-5 rounded-full font-bold shadow-2xl hover:shadow-primary/20 transition-all text-lg"
              >
                Publier ma première offre
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
