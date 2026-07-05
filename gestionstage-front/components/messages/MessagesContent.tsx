'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Loader2, AlertCircle, ArrowLeft, Search } from 'lucide-react';
import { apiFetch, extractArray, authHeaders, API_BASE, getAvatarUrl } from '@/lib/api';
import { getEcho } from '@/lib/echo';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Message {
  id: number;
  content: string;
  user_id: number;
  created_at: string;
  is_read?: boolean;
  expediteur?: { id: number; nom: string; };
}

interface Conversation {
  id: number;
  created_at: string;
  participants?: Array<{ id: number; nom: string; role: string; photo?: string }>;
  users?: Array<{ id: number; nom: string; role: string; photo?: string }>;
  lastMessage?: Message;
  unread_count?: number;
}

export default function MessagesContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    const handleMouse = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => { window.removeEventListener('resize', handleResize); window.removeEventListener('mousemove', handleMouse); };
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const [convRes, userRes] = await Promise.all([
        apiFetch('/conversations'),
        apiFetch('/profil'),
      ]);
      if (convRes.ok) {
        const data = await convRes.json();
        setConversations(extractArray(data));
      }
      if (userRes.ok) {
        const ud = await userRes.json();
        setCurrentUserId(ud.data?.id || null);
      }
    } catch (e) { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  const fetchMessages = useCallback(async (convId: number) => {
    try {
      setLoadingMessages(true);
      const res = await apiFetch(`/conversations/${convId}`);
      if (res.ok) {
        const json = await res.json();
        const apiMessages = json.data?.data || json.data || [];
        setMessages([...apiMessages].reverse());
      }
    } catch (e) { /* silently fail */ }
    finally { setLoadingMessages(false); }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const handleSelectConv = (id: number) => {
    setActiveConvId(id);
    setShowChat(true);
    fetchMessages(id);
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !editingMessageId) || !activeConvId || sending) return;

    if (editingMessageId) {
      const textToUpdate = editingMessageText.trim();
      if (!textToUpdate) return;
      try {
        setSending(true);
        const res = await apiFetch(`/messages/${editingMessageId}`, {
          method: 'PUT',
          body: JSON.stringify({ content: textToUpdate })
        });
        if (res.ok) {
          setMessages(prev => prev.map(m => m.id === editingMessageId ? { ...m, content: textToUpdate } : m));
          setEditingMessageId(null);
          setEditingMessageText('');
        } else {
          const err = await res.json();
          toast.error(err.message || 'Erreur lors de la modification');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSending(false);
      }
      return;
    }
    try {
      setSending(true);
      const res = await apiFetch(`/conversations/${activeConvId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => {
          if (prev.find(m => m.id === data.data.id)) return prev;
          return [...prev, data.data];
        });
        setNewMessage('');
      }
    } catch (e) { /* silently fail */ }
    finally { setSending(false); }
  };

  const getOtherParticipant = (conv: Conversation) => {
    const participantsList = conv.users || conv.participants;
    if (!participantsList) return null;
    return participantsList.find(p => p.id !== currentUserId);
  };

  useEffect(() => {
    const convId = searchParams.get('conv');
    if (convId && conversations.length > 0) {
      handleSelectConv(parseInt(convId));
      // Remove query param to clean URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [searchParams, conversations]);

  // Real-time messages listener
  useEffect(() => {
    if (!activeConvId) return;

    const echo = getEcho();
    if (!echo) return;

    const channelName = `conversation.${activeConvId}`;
    echo.private(channelName)
      .listen('MessageSent', (e: any) => {
        // Ajouter le message reçu à la liste s'il n'existe pas déjà (au cas où c'est nous qui l'avons envoyé)
        setMessages((prev) => {
          if (prev.find(m => m.id === e.id)) return prev;
          return [...prev, e];
        });
      })
      .listen('MessageUpdated', (e: any) => {
        setMessages(prev => prev.map(m => m.id === e.message.id ? { ...m, content: e.message.content } : m));
      })
      .listen('MessageDeleted', (e: any) => {
        setMessages(prev => prev.filter(m => m.id !== e.messageId));
      })
      .listen('MessageRead', (e: any) => {
        setMessages(prev => prev.map(m => m.id === e.message.id ? { ...m, is_read: true } : m));
      });

    return () => {
      echo.leave(channelName);
    };
  }, [activeConvId]);

  // Mark unread as read when opening conversation or receiving messages
  useEffect(() => {
    if (!activeConvId || !currentUserId) return;
    const unreadMessagesToMark = messages.filter(m => m.user_id !== currentUserId && !m.is_read);
    if (unreadMessagesToMark.length > 0) {
      unreadMessagesToMark.forEach(m => {
        apiFetch(`/messages/${m.id}/read`, { method: 'PATCH' }).catch(console.error);
      });
      setMessages(prev => prev.map(m => m.user_id !== currentUserId ? { ...m, is_read: true } : m));
    }
  }, [activeConvId, messages, currentUserId]);

  const handleDelete = async (msgId: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce message ?')) return;
    try {
      const res = await apiFetch(`/messages/${msgId}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== msgId));
      } else {
        const err = await res.json();
        toast.error(err.message || 'Erreur lors de la suppression');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId);
  const otherParticipant = activeConv ? getOtherParticipant(activeConv) : null;

  return (
    <div className="h-full w-full flex relative overflow-hidden bg-background">
      {/* Cursor Glow */}
      <div className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{ background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,126,95,0.08), transparent 40%)` }}
      />

      <main className="flex-1 w-full relative z-10">
        <div className="h-full flex p-4 md:p-8 gap-5">
          {/* Sidebar - Conversations List */}
          <AnimatePresence mode="wait">
            {(!isMobileView || !showChat) && (
              <motion.div
                key="sidebar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col glass-panel rounded-2xl overflow-hidden shadow-xl"
              >
                <div className="p-5 border-b border-outline-variant/20">
                  <h2 className="text-lg font-bold text-on-surface mb-3">Messagerie</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:border-primary transition-all" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-3">
                      <MessageSquare className="w-12 h-12 text-on-surface-variant" />
                      <p className="text-on-surface-variant text-sm text-center">Aucune conversation pour le moment.</p>
                    </div>
                  ) : (
                    conversations.map((conv) => {
                      const other = getOtherParticipant(conv);
                      const isActive = conv.id === activeConvId;
                      return (
                        <motion.button
                          key={conv.id}
                          onClick={() => handleSelectConv(conv.id)}
                          whileHover={{ backgroundColor: 'rgba(165,59,34,0.05)' }}
                          className={`w-full text-left p-4 border-b border-outline-variant/10 transition-all ${isActive ? 'bg-primary/8' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
                              <img src={other?.photo ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${other.photo}` : getAvatarUrl(other?.nom || 'Contact')} alt={other?.nom} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <p className={`font-semibold text-sm truncate ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                                  {other?.nom || 'Inconnu'}
                                </p>
                                <span className="text-xs text-on-surface-variant ml-2 shrink-0">
                                  {new Date(conv.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                </span>
                              </div>
                              <p className="text-xs text-on-surface-variant truncate mt-0.5">
                                {other?.role === 'entreprise' ? '🏢 Entreprise' : '👤 Étudiant'}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Window */}
          <AnimatePresence mode="wait">
            {(!isMobileView || showChat) && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden shadow-xl"
              >
                {!activeConvId ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                    <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center">
                      <MessageSquare className="w-10 h-10 text-on-surface-variant" />
                    </div>
                    <h3 className="text-xl font-bold text-on-surface">Sélectionnez une conversation</h3>
                    <p className="text-on-surface-variant text-center text-sm max-w-xs">Choisissez une conversation dans la liste pour commencer à échanger.</p>
                  </div>
                ) : (
                  <>
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-outline-variant/20">
                      {isMobileView && (
                        <motion.button whileHover={{ x: -4 }} onClick={() => setShowChat(false)} className="mr-1">
                          <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
                        </motion.button>
                      )}
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img src={otherParticipant?.photo ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${otherParticipant.photo}` : getAvatarUrl(otherParticipant?.nom || 'Contact')} alt={otherParticipant?.nom} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold text-on-surface text-sm">{otherParticipant?.nom || 'Conversation'}</h3>
                        <p className="text-xs text-on-surface-variant">{otherParticipant?.role === 'entreprise' ? 'Entreprise' : 'Étudiant'}</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {loadingMessages ? (
                        <div className="flex justify-center p-8">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                          <p className="text-on-surface-variant text-sm">Commencez la conversation !</p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isMe = msg.user_id === currentUserId;
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'} relative group`}
                              onMouseEnter={() => setHoveredMessageId(msg.id)}
                              onMouseLeave={() => setHoveredMessageId(null)}
                            >
                              <div className="flex items-center gap-2">
                                {isMe && hoveredMessageId === msg.id && !msg.is_read && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingMessageId(msg.id); setEditingMessageText(msg.content); setNewMessage(''); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-surface-container hover:bg-primary hover:text-white text-on-surface-variant transition-colors" title="Modifier">
                                      <span className="material-symbols-outlined text-[12px]">edit</span>
                                    </button>
                                    <button onClick={() => handleDelete(msg.id)} className="w-6 h-6 flex items-center justify-center rounded-full bg-surface-container hover:bg-error hover:text-white text-on-surface-variant transition-colors" title="Supprimer">
                                      <span className="material-symbols-outlined text-[12px]">delete</span>
                                    </button>
                                  </div>
                                )}
                                <div className={`p-4 rounded-3xl ${isMe ? 'bg-primary text-white rounded-br-sm shadow-primary/20 shadow-lg' : 'bg-white border border-outline-variant/30 text-on-surface rounded-bl-sm shadow-sm'}`}>
                                  <p className="text-[15px] leading-relaxed">{msg.content}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 mt-1.5 px-2">
                                <span className="text-[11px] text-on-surface-variant/70 font-medium">
                                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isMe && (
                                  <span className={`material-symbols-outlined text-[14px] ${msg.is_read ? 'text-blue-500' : 'text-on-surface-variant/50'}`}>
                                    done_all
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-outline-variant/20">
                      <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3">
                        {editingMessageId && (
                          <div className="flex-1 flex flex-col min-w-0 pr-2">
                            <div className="flex justify-between items-center px-1 mb-1">
                              <span className="text-[10px] font-bold text-primary uppercase">Modification</span>
                              <button type="button" onClick={() => { setEditingMessageId(null); setEditingMessageText(''); }} className="text-[10px] font-bold text-on-surface-variant hover:text-error transition-colors">
                                Annuler
                              </button>
                            </div>
                            <textarea 
                              value={editingMessageText}
                              onChange={e => setEditingMessageText(e.target.value)}
                              onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                              className="w-full bg-transparent border-none focus:ring-0 text-sm p-1 outline-none custom-scrollbar min-h-[40px] resize-none"
                              rows={1}
                              autoFocus
                            />
                          </div>
                        )}
                        {!editingMessageId && (
                          <textarea
                            placeholder="Écrivez votre message..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                            className="flex-1 w-full bg-transparent border-none focus:ring-0 text-[15px] px-2 py-1 outline-none placeholder:text-on-surface-variant/50 resize-none h-10 min-h-[40px] max-h-32 custom-scrollbar"
                            rows={1}
                          />
                        )}
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={editingMessageId ? !editingMessageText.trim() || sending : !newMessage.trim() || sending}
                          className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/30 disabled:opacity-50 transition-all"
                        >
                          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </motion.button>
                      </form>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
