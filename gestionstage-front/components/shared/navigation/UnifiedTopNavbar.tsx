'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  User, 
  Settings, 
  LogOut,
  MessageSquare,
  ChevronDown,
  Check,
  CheckCircle2,
  Trash2,
  X,
  Menu
} from 'lucide-react';
import { apiFetch, getAvatarUrl } from '@/lib/api';
import NavbarSearch from './NavbarSearch';

interface NotificationData {
  id: string;
  data: {
    titre: string;
    message: string;
    type: string;
    candidature_id?: number;
    offre_id?: number;
  };
  read_at: string | null;
  created_at: string;
}

interface UnifiedTopNavbarProps {
  role?: string;
  userName?: string;
  userAvatar?: string;
  userRole?: string;
  pageTitle?: string;
  onOpenMobileSidebar?: () => void;
}

export default function UnifiedTopNavbar({ 
  role = 'etudiant',
  userName = 'Alexandre Dupont',
  userAvatar = 'https://ui-avatars.com/api/?name=Alexandre+Dupont&background=random',
  userRole = 'Étudiant',
  pageTitle,
  onOpenMobileSidebar
}: UnifiedTopNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false); // Should be hooked to your theme provider
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadMessagesList, setUnreadMessagesList] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const router = useRouter();

  const [navUserName, setNavUserName] = useState(userName);
  const [navUserAvatar, setNavUserAvatar] = useState(userAvatar);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch('/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data?.data || []);
        setUnreadCount(data.unread_count || 0);
        setHasUnreadNotifications(data.unread_count > 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const resCount = await apiFetch('/conversations/unread-count');
      if (resCount.ok) {
        const dataCount = await resCount.json();
        setUnreadMessagesCount(dataCount.unread_count || 0);
      }
      
      const resList = await apiFetch('/messages/unread');
      if (resList.ok) {
        const dataList = await resList.json();
        setUnreadMessagesList(dataList.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await apiFetch('/profil');
      if (res.ok) {
        const data = await res.json();
        const user = data.data;
        if (user) {
          setNavUserName(user.nom || userName);
          if (user.photo) {
            setNavUserAvatar(getAvatarUrl(user.nom, user.photo));
          } else {
            setNavUserAvatar(getAvatarUrl(user.nom || userName));
          }
        }
      }
    } catch (e) {
      console.error('Error fetching profile for navbar', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadMessages();
    fetchUserProfile();
    // Options: set interval for real-time polling
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadMessages();
    }, 30000); // 30 sec
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch(`/notifications/read-all`, { method: 'PATCH' });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      // Obtenir le token des cookies
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      if (token) {
        await apiFetch(`/logout`, {
          method: 'POST'
        });
      }
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      // Effacer les cookies et rediriger quoi qu'il arrive
      document.cookie = 'token=; Max-Age=0; path=/';
      document.cookie = 'userRole=; Max-Age=0; path=/';
      document.cookie = 'userName=; Max-Age=0; path=/';
      window.location.href = '/login';
    }
  };

  const basePath = role === 'student' ? 'etudiant' : role;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-white/70 backdrop-blur-2xl border-b border-outline-variant/20 shadow-[0_4px_24px_rgba(0,0,0,0.04)] py-2 md:py-3' 
          : 'bg-transparent py-4 md:py-6'
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-8 max-w-7xl mx-auto gap-2">
        
        {/* Left Side: Mobile Menu Button & Page Title */}
        <div className="flex items-center gap-3 md:gap-4 flex-1">
          {onOpenMobileSidebar && (
            <button 
              onClick={onOpenMobileSidebar}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          {pageTitle && (
            <h1 className="font-heading text-lg md:text-2xl font-extrabold text-on-surface tracking-tight truncate max-w-[200px] md:max-w-none block">
              {pageTitle}
            </h1>
          )}
        </div>

        {/* Center: Search Bar */}
        <div className="hidden lg:flex flex-1 justify-center px-4">
          <NavbarSearch basePath={basePath} scrolled={scrolled} />
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-4 justify-end flex-1">
          
          {/* Mobile Search Icon */}
          <Link href={`/${basePath}/offres`} passHref>
            <button className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </Link>

          {/* Theme Toggle */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors overflow-hidden group"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.div key="moon" initial={{ y: -20, opacity: 0, rotate: -90 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ y: 20, opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
                  <Moon className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="sun" initial={{ y: -20, opacity: 0, rotate: -90 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ y: 20, opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
                  <Sun className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Messages */}
          <div className="relative">
            <motion.button 
              onClick={() => {
                setIsMessagesOpen(!isMessagesOpen);
                if (isNotificationsOpen) setIsNotificationsOpen(false);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${isMessagesOpen ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}`}
            >
              <MessageSquare className="w-5 h-5" />
              {unreadMessagesCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="absolute top-2 right-2 flex items-center justify-center w-3.5 h-3.5 bg-error text-[9px] text-white font-bold rounded-full border border-white"
                >
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {isMessagesOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMessagesOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-[calc(100%+8px)] w-80 md:w-96 bg-white backdrop-blur-3xl border border-outline-variant/20 shadow-[0_16px_40px_rgba(0,0,0,0.1)] rounded-2xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center justify-between">
                      <h3 className="font-bold text-on-surface flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Messages non lus
                      </h3>
                      {unreadMessagesCount > 0 && (
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                          {unreadMessagesCount} nouveau{unreadMessagesCount > 1 ? 'x' : ''}
                        </span>
                      )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                      {unreadMessagesList.length > 0 ? (
                        unreadMessagesList.map((msg) => (
                          <div 
                            key={msg.id}
                            onClick={() => {
                              setIsMessagesOpen(false);
                              router.push(`/${basePath}/messages?conv=${msg.conversation_id}`);
                            }}
                            className="px-4 py-3 border-b border-outline-variant/5 hover:bg-surface-container-lowest transition-colors cursor-pointer flex gap-3 relative overflow-hidden group"
                          >
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                               <img src={getAvatarUrl(msg.expediteur?.nom || 'Contact')} alt={msg.expediteur?.nom} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-on-surface mb-0.5 flex justify-between">
                                {msg.expediteur?.nom}
                                <span className="text-xs font-normal text-on-surface-variant">
                                  {new Date(msg.created_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </p>
                              <p className="text-sm text-on-surface-variant truncate font-medium text-primary">
                                {msg.content}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
                            <CheckCircle2 className="w-6 h-6 text-on-surface-variant" />
                          </div>
                          <p className="text-sm text-on-surface-variant font-medium">Vous êtes à jour !</p>
                          <p className="text-xs text-on-surface-variant/70 mt-1">Aucun nouveau message.</p>
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-3 border-t border-outline-variant/10 text-center">
                      <Link 
                        href={`/${basePath}/messages`}
                        onClick={() => setIsMessagesOpen(false)}
                        className="text-sm font-bold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                      >
                        Voir tous les messages
                      </Link>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative">
            <motion.button 
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                if (isMessagesOpen) setIsMessagesOpen(false);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${isNotificationsOpen ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}`}
            >
              <Bell className="w-5 h-5" />
              {hasUnreadNotifications && (
                <motion.span 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="absolute top-2 right-2 flex h-2.5 w-2.5"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error border-2 border-white"></span>
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-[calc(100%+8px)] w-80 md:w-96 bg-white backdrop-blur-3xl border border-outline-variant/20 shadow-[0_16px_40px_rgba(0,0,0,0.1)] rounded-2xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center justify-between">
                      <h3 className="font-bold text-on-surface flex items-center gap-2">
                        Notifications
                        {unreadCount > 0 && (
                          <span className="bg-error/10 text-error text-xs px-2 py-0.5 rounded-full font-semibold">
                            {unreadCount}
                          </span>
                        )}
                      </h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Tout marquer comme lu
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-[350px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center flex flex-col items-center justify-center">
                          <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-3">
                            <Bell className="w-5 h-5 text-on-surface-variant/50" />
                          </div>
                          <p className="text-sm font-medium text-on-surface-variant">Aucune notification</p>
                          <p className="text-xs text-on-surface-variant/70 mt-1">Vous êtes à jour !</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-outline-variant/5">
                          {notifications.map(notif => (
                            <div 
                              key={notif.id} 
                              className={`p-4 flex gap-3 hover:bg-surface-container-lowest transition-colors relative group ${!notif.read_at ? 'bg-primary/5' : ''}`}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                notif.data.type === 'candidature_accepted' ? 'bg-success/10 text-success' :
                                notif.data.type === 'candidature_rejected' ? 'bg-error/10 text-error' :
                                'bg-primary/10 text-primary'
                              }`}>
                                <Bell className="w-5 h-5" />
                              </div>
                              <div className="flex-1 pr-6">
                                <p className="text-sm font-bold text-on-surface leading-tight mb-1">{notif.data.titre}</p>
                                <p className="text-xs text-on-surface-variant line-clamp-2">{notif.data.message}</p>
                                <p className="text-[10px] text-on-surface-variant/60 mt-2 font-medium">
                                  {new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              
                              {!notif.read_at && (
                                <button 
                                  onClick={() => markAsRead(notif.id)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-sm border border-outline-variant/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
                                  title="Marquer comme lu"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {!notif.read_at && (
                                <span className="absolute right-4 top-4 w-2 h-2 rounded-full bg-primary group-hover:opacity-0 transition-opacity" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="p-2 border-t border-outline-variant/10 bg-surface-container-lowest/50 text-center">
                        <Link href={`/${basePath}/notifications`} className="text-xs font-semibold text-primary hover:underline">
                          Voir toutes les notifications
                        </Link>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-6 bg-outline-variant/30 hidden md:block mx-1"></div>

          {/* Profile Dropdown */}
          <div className="relative">
            <motion.button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/20"
            >
              <img src={navUserAvatar} alt={navUserName} className="w-9 h-9 rounded-xl object-cover shadow-sm border border-outline-variant/20" />
              <div className="hidden md:flex flex-col items-start text-left">
                <span className="text-sm font-bold text-on-surface leading-none">{navUserName}</span>
                <span className="text-[10px] font-medium text-on-surface-variant mt-1">{userRole}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-on-surface-variant hidden md:block transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  
                  {/* Menu */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white backdrop-blur-3xl border border-outline-variant/20 shadow-[0_16px_40px_rgba(0,0,0,0.1)] rounded-2xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-outline-variant/10 md:hidden">
                      <p className="font-bold text-sm text-on-surface">{navUserName}</p>
                      <p className="text-xs text-on-surface-variant">{userRole}</p>
                    </div>

                    <div className="p-2 space-y-1">
                      <Link href={`/${basePath}/profile`} onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors group">
                        <User className="w-4 h-4 group-hover:scale-110 transition-transform" /> Mon Profil
                      </Link>
                      <Link href={`/${basePath}/profile`} onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors group">
                        <Settings className="w-4 h-4 group-hover:scale-110 transition-transform" /> Paramètres
                      </Link>
                    </div>
                    
                    <div className="p-2 border-t border-outline-variant/10 mt-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-error hover:bg-error-container/50 transition-colors group"
                      >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Déconnexion
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
