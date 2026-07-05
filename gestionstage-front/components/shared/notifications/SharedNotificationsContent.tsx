'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { 
  Bell, CheckCircle2, XCircle, Info, Check, Trash2, 
  ArrowRight, Briefcase, FileText 
} from 'lucide-react';

interface NotificationData {
  id: string;
  data: {
    titre: string;
    message: string;
    type: string;
    candidature_id?: number;
    offre_id?: number;
    etudiant_id?: number;
  };
  read_at: string | null;
  created_at: string;
}

interface SharedNotificationsContentProps {
  basePath: string; // 'etudiant' or 'entreprise'
}

export default function SharedNotificationsContent({ basePath }: SharedNotificationsContentProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch('/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data?.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch(`/notifications/read-all`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'candidature_accepted':
        return <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>;
      case 'candidature_rejected':
        return <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><XCircle className="w-6 h-6" /></div>;
      case 'new_candidature':
        return <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><FileText className="w-6 h-6" /></div>;
      default:
        return <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center"><Bell className="w-6 h-6" /></div>;
    }
  };

  const getNotificationLink = (n: NotificationData) => {
    if (basePath === 'etudiant') {
      return '/etudiant/applications';
    } else {
      if (n.data.offre_id) {
        return `/entreprise/offers/${n.data.offre_id}/candidatures`;
      }
      return '/entreprise/candidates';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-on-background tracking-tighter">
            Mes Notifications
          </h1>
          <p className="text-on-surface-variant mt-2 font-medium">
            Restez informé(e) de l'évolution de vos candidatures et de vos activités.
          </p>
        </div>
        {notifications.some(n => !n.read_at) && (
          <button 
            onClick={markAllAsRead}
            className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl text-sm font-bold text-on-surface flex items-center gap-2 transition-colors border border-outline-variant/30 shadow-sm"
          >
            <Check className="w-4 h-4" /> Marquer tout comme lu
          </button>
        )}
      </motion.div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] rounded-3xl overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center">
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined text-primary text-4xl">
              sync
            </motion.span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 text-on-surface-variant" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-on-surface mb-2">Aucune notification</h3>
            <p className="text-on-surface-variant max-w-md">
              Vous n'avez reçu aucune notification pour le moment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            <AnimatePresence>
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => !n.read_at && markAsRead(n.id)}
                  className={`relative group p-4 md:p-6 transition-colors flex gap-4 md:gap-6 ${n.read_at ? 'bg-transparent' : 'bg-primary/5 hover:bg-primary/10 cursor-pointer'}`}
                >
                  <div className="flex-shrink-0">
                    {getNotificationIcon(n.data.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1">
                      <h4 className={`text-base font-bold ${!n.read_at ? 'text-on-surface' : 'text-on-surface/80'}`}>
                        {n.data.titre}
                      </h4>
                      <span className="text-xs font-semibold text-on-surface-variant/70">
                        {new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-sm mb-3 ${!n.read_at ? 'text-on-surface-variant font-medium' : 'text-on-surface-variant/70'}`}>
                      {n.data.message}
                    </p>
                    <Link 
                      href={getNotificationLink(n)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      Voir les détails <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="flex items-start">
                    <button 
                      onClick={(e) => deleteNotification(n.id, e)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant/50 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {!n.read_at && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-r-full" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
