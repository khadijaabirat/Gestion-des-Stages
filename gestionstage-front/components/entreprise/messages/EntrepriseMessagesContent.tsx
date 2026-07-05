'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, extractArray } from '@/lib/api';
import { getEcho } from '@/lib/echo';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar: string;
  offerTitle: string;
  unreadCount: number;
  lastMessageAt: string;
  messages: Message[];
  isTyping?: boolean;
}

export default function EntrepriseMessagesContent() {
  const searchParams = useSearchParams();
  const convParam = searchParams.get('conv');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mobile handling
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);

  // Fetch current user ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiFetch('/profil');
        if (res.ok) {
          const json = await res.json();
          const user = json.data || json;
          setCurrentUserId(String(user.id));
        }
      } catch (e) {
        console.error('Failed to fetch user:', e);
      }
    };
    fetchUser();
  }, []);

  // Fetch real conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoadingConversations(true);
      try {
        const res = await apiFetch('/conversations');
        if (res.ok) {
          const json = await res.json();
          const apiConvs = extractArray(json);
          const mapped: Conversation[] = apiConvs.map((conv: any) => {
            const otherUser = conv.users?.[0];
            const lastMsg = conv.messages?.[0];
            return {
              id: String(conv.id),
              candidateId: String(otherUser?.id || ''),
              candidateName: otherUser?.nom || 'Utilisateur',
              candidateAvatar: otherUser?.photo 
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${otherUser.photo}` 
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.nom || 'U')}&background=6366f1&color=fff&bold=true`,
              offerTitle: otherUser?.role === 'etudiant' ? 'Étudiant' : otherUser?.role === 'entreprise' ? 'Entreprise' : '',
              unreadCount: 0,
              lastMessageAt: lastMsg?.created_at || conv.created_at || new Date().toISOString(),
              messages: [],
            };
          });
          setConversations(mapped);

          // Auto-select conversation from URL param
          if (convParam) {
            const found = mapped.find(c => c.id === convParam);
            if (found) {
              setActiveConvId(convParam);
              setIsMobileListVisible(false);
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch conversations:', e);
        // Fallback to empty
        setConversations([]);
      } finally {
        setIsLoadingConversations(false);
      }
    };
    fetchConversations();
  }, [convParam]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const res = await apiFetch(`/conversations/${activeConvId}`);
        if (res.ok) {
          const json = await res.json();
          const apiMessages = json.data?.data || json.data || [];
          const mapped: Message[] = apiMessages.map((m: any) => ({
            id: String(m.id),
            senderId: String(m.user_id),
            text: m.content,
            timestamp: m.created_at,
            status: m.is_read ? 'read' as const : 'sent' as const,
          })).reverse(); // API returns latest first, we want oldest first
          setConversations(prev => prev.map(conv =>
            conv.id === activeConvId ? { ...conv, messages: mapped, unreadCount: 0 } : conv
          ));
        }
      } catch (e) {
        console.error('Failed to fetch messages:', e);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [activeConvId]);

  // Real-time messages listener
  useEffect(() => {
    if (!activeConvId) return;

    const echo = getEcho();
    if (!echo) return;

    const channelName = `conversation.${activeConvId}`;
    echo.private(channelName)
      .listen('MessageSent', (e: any) => {
        setConversations((prev) => prev.map((conv) => {
          if (conv.id === activeConvId) {
            // Check if message already exists (e.g. sent by us)
            if (conv.messages.find(m => m.id === String(e.id))) return conv;
            
            const mappedMsg: Message = {
              id: String(e.id),
              senderId: String(e.user_id),
              text: e.content,
              timestamp: e.created_at,
              status: e.is_read ? 'read' : 'delivered'
            };
            
            return {
              ...conv,
              messages: [...conv.messages, mappedMsg],
              lastMessageAt: mappedMsg.timestamp
            };
          }
          return conv;
        }));
      })
      .listen('MessageUpdated', (e: any) => {
        setConversations(prev => prev.map(conv => {
          if (conv.id === activeConvId) {
            return {
              ...conv,
              messages: conv.messages.map(m => m.id === String(e.message.id) ? { ...m, text: e.message.content } : m)
            };
          }
          return conv;
        }));
      })
      .listen('MessageDeleted', (e: any) => {
        setConversations(prev => prev.map(conv => {
          if (conv.id === activeConvId) {
            return {
              ...conv,
              messages: conv.messages.filter(m => m.id !== String(e.messageId))
            };
          }
          return conv;
        }));
      })
      .listen('MessageRead', (e: any) => {
        setConversations(prev => prev.map(conv => {
          if (conv.id === activeConvId) {
            return {
              ...conv,
              messages: conv.messages.map(m => m.id === String(e.message.id) ? { ...m, status: 'read' as const } : m)
            };
          }
          return conv;
        }));
      });

    return () => {
      echo.leave(channelName);
    };
  }, [activeConvId]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setMousePosition({ x: e.clientX, y: e.clientY });
      setCursorGlowOpacity(1);
    };
    const handleMouseLeave = () => setCursorGlowOpacity(0);

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (activeConvId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      
      // Mark as read
      setConversations(prev => prev.map(conv => 
        conv.id === activeConvId ? { ...conv, unreadCount: 0 } : conv
      ));
    }
  }, [activeConvId, conversations.find(c => c.id === activeConvId)?.messages.length]);

  // Mark unread messages as read automatically
  useEffect(() => {
    if (!activeConvId || !currentUserId) return;
    const activeConversation = conversations.find(c => c.id === activeConvId);
    if (!activeConversation) return;

    const unreadMessagesToMark = activeConversation.messages.filter(m => m.senderId !== currentUserId && m.status !== 'read');
    if (unreadMessagesToMark.length > 0) {
      unreadMessagesToMark.forEach(m => {
        apiFetch(`/messages/${m.id}/read`, { method: 'PATCH' }).catch(console.error);
      });
      setConversations(prev => prev.map(conv => conv.id === activeConvId ? {
        ...conv,
        messages: conv.messages.map(m => m.senderId !== currentUserId ? { ...m, status: 'read' as const } : m)
      } : conv));
    }
  }, [activeConvId, currentUserId, conversations]);

  const activeConversation = conversations.find(c => c.id === activeConvId);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => 
      c.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.offerTitle.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }, [conversations, searchQuery]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!newMessage.trim() && !editingMessageId) || !activeConvId) return;

    if (editingMessageId) {
      // Handle Edit
      const textToUpdate = editingMessageText.trim();
      if (!textToUpdate) return;
      try {
        const res = await apiFetch(`/messages/${editingMessageId}`, {
          method: 'PUT',
          body: JSON.stringify({ content: textToUpdate })
        });
        if (res.ok) {
          setConversations(prev => prev.map(conv => conv.id === activeConvId ? {
            ...conv,
            messages: conv.messages.map(m => m.id === editingMessageId ? { ...m, text: textToUpdate } : m)
          } : conv));
          setEditingMessageId(null);
          setEditingMessageText('');
        } else {
          const err = await res.json();
          toast.error(err.message || 'Erreur lors de la modification');
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      senderId: currentUserId,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    // Optimistic update
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConvId) {
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessageAt: newMsg.timestamp
        };
      }
      return conv;
    }));

    setNewMessage('');

    // Send to API
    try {
      const res = await apiFetch(`/conversations/${activeConvId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: newMsg.text })
      });
      if (res.ok) {
        const json = await res.json();
        const sentMsg = json.data;
        // Replace temp message with real one, or remove it if Echo already added the real one
        setConversations(prev => prev.map(conv => {
          if (conv.id === activeConvId) {
            // Did Echo already add this exact message?
            const alreadyAddedByEcho = conv.messages.some(m => m.id === String(sentMsg.id));
            if (alreadyAddedByEcho) {
              // Just remove the optimistic temp message
              return { ...conv, messages: conv.messages.filter(m => m.id !== tempId) };
            } else {
              // Update the temp message with real ID
              const updatedMessages = conv.messages.map(m =>
                m.id === tempId ? { ...m, id: String(sentMsg.id), status: 'delivered' as const } : m
              );
              return { ...conv, messages: updatedMessages };
            }
          }
          return conv;
        }));
      }
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce message ?')) return;
    try {
      const res = await apiFetch(`/messages/${msgId}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations(prev => prev.map(conv => conv.id === activeConvId ? {
          ...conv,
          messages: conv.messages.filter(m => m.id !== msgId)
        } : conv));
      } else {
        const err = await res.json();
        toast.error(err.message || 'Erreur lors de la suppression');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    setIsMobileListVisible(false);
  };

  return (
    <div className="h-screen w-full flex relative overflow-hidden bg-background text-on-background">
      {/* Background Pattern */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(165,59,34, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(165,59,34, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: `${mousePosition.x / 10}px ${mousePosition.y / 10}px`,
          transition: 'background-position 0.2s ease-out'
        }}
      />
      
      {/* Dynamic Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-500 mix-blend-multiply"
        style={{
          opacity: cursorGlowOpacity,
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,126,95, 0.08) 0%, transparent 60%)`
        }}
      />

      {/* 3D Floating Ambient Orbs */}
      <motion.div 
        animate={{ y: [0, -30, 0], x: [0, 20, 0], rotate: [0, 5, -5, 0] }} 
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[5%] left-[20%] w-72 h-72 bg-primary/10 rounded-full blur-[80px] -z-10 mix-blend-multiply pointer-events-none"
      />
      <motion.div 
        animate={{ y: [0, 40, 0], x: [0, -30, 0], scale: [1, 1.1, 1] }} 
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[10%] right-[15%] w-96 h-96 bg-tertiary/10 rounded-full blur-[100px] -z-10 mix-blend-multiply pointer-events-none"
      />

      {/* Exclude Sidebar on mobile completely for a true full-screen chat experience, keep on Desktop */}
      <div className="hidden md:block shrink-0 z-40"></div>

      <main className="flex-1 flex flex-col md:flex-row relative z-10 w-full h-full md:pl-64 overflow-hidden pt-4 md:pt-10 md:pb-10 md:pr-10 px-4">
        
        {/* Main Interface Wrapper (Glassmorphism container) */}
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(165,59,34,0.05)] rounded-3xl overflow-hidden relative pb-16 md:pb-0"
        >
          
          {/* Conversation List Sidebar */}
          <div className={`${!isMobileListVisible ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] lg:w-[400px] flex-col border-r border-outline-variant/30 h-full bg-white/60 shrink-0`}>
            <div className="p-6 border-b border-outline-variant/20">
              <h2 className="font-heading text-2xl font-extrabold text-on-surface mb-4">Messages</h2>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-lg">search</span>
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
              <AnimatePresence>
                {isLoadingConversations ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <motion.div key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full p-4 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface-container-high/50 animate-pulse shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-surface-container-high/50 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-surface-container-high/50 rounded w-1/2 animate-pulse"></div>
                        <div className="h-3 bg-surface-container-high/50 rounded w-full animate-pulse"></div>
                      </div>
                    </motion.div>
                  ))
                ) : filteredConversations.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl opacity-50 mb-2">speaker_notes_off</span>
                    <p className="text-sm">Aucune conversation trouvée.</p>
                  </motion.div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isActive = activeConvId === conv.id;
                    const lastMsg = conv.messages[conv.messages.length - 1];
                    return (
                      <motion.button
                        key={conv.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => handleSelectConversation(conv.id)}
                        className={`w-full text-left p-3 md:p-4 rounded-2xl transition-all relative flex items-center gap-3 md:gap-4 group ${
                          isActive ? 'bg-primary text-white shadow-md' : 'hover:bg-surface-container-low/80 text-on-surface'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <img src={conv.candidateAvatar} alt={conv.candidateName} className="w-12 h-12 rounded-full border border-white/20 object-cover shadow-sm" />
                          {conv.unreadCount > 0 && !isActive && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className={`font-bold truncate text-sm md:text-base ${isActive ? 'text-white' : 'text-on-surface'}`}>{conv.candidateName}</h3>
                            <span className={`text-[10px] whitespace-nowrap ml-2 ${isActive ? 'text-white/80' : 'text-on-surface-variant/80'}`}>
                              {formatTime(conv.lastMessageAt)}
                            </span>
                          </div>
                          <p className={`text-xs truncate font-medium mb-1 ${isActive ? 'text-white/80' : 'text-primary'}`}>
                            {conv.offerTitle}
                          </p>
                          <p className={`text-xs truncate ${isActive ? 'text-white/90' : conv.unreadCount > 0 ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>
                            {conv.isTyping ? <span className="italic text-primary animate-pulse">En train d'écrire...</span> : lastMsg?.text}
                          </p>
                        </div>
                      </motion.button>
                    )
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Chat Window */}
          <div className={`${isMobileListVisible ? 'hidden md:flex' : 'flex'} flex-1 flex-col h-full relative`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 md:p-6 border-b border-outline-variant/20 flex justify-between items-center bg-white/600 backdrop-blur-md z-10 shrink-0">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsMobileListVisible(true)}
                      className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="relative">
                      <img src={activeConversation.candidateAvatar} alt={activeConversation.candidateName} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/80 shadow-sm" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h2 className="font-bold text-on-surface text-lg">{activeConversation.candidateName}</h2>
                      <p className="text-xs text-on-surface-variant font-medium">Candidat pour : <span className="text-primary">{activeConversation.offerTitle}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface-variant">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-black/5">
                  <div className="text-center">
                    <span className="bg-surface-container-low border border-outline-variant/30 text-on-surface-variant text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Aujourd'hui
                    </span>
                  </div>

                  <AnimatePresence initial={false}>
                    {isLoadingMessages ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center p-4">
                        <div className="flex items-center gap-2 text-primary">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                      </motion.div>
                    ) : (
                      activeConversation.messages.map((msg, idx) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                          <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full group relative`}
                            onMouseEnter={() => setHoveredMessageId(msg.id)}
                            onMouseLeave={() => setHoveredMessageId(null)}
                          >
                            {!isMe && (
                              <img src={activeConversation.candidateAvatar} alt="" className="w-8 h-8 rounded-full mr-2 self-end mb-1 shadow-sm" />
                            )}
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                              <div className="flex items-center gap-2">
                                {isMe && hoveredMessageId === msg.id && msg.status !== 'read' && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingMessageId(msg.id); setEditingMessageText(msg.text); setNewMessage(''); }} className="w-7 h-7 flex items-center justify-center rounded-full bg-surface-container hover:bg-primary hover:text-white text-on-surface-variant transition-colors shadow-sm" title="Modifier">
                                      <span className="material-symbols-outlined text-[14px]">edit</span>
                                    </button>
                                    <button onClick={() => handleDeleteMessage(msg.id)} className="w-7 h-7 flex items-center justify-center rounded-full bg-surface-container hover:bg-error hover:text-white text-on-surface-variant transition-colors shadow-sm" title="Supprimer">
                                      <span className="material-symbols-outlined text-[14px]">delete</span>
                                    </button>
                                  </div>
                                )}
                                <div 
                                  className={`p-3.5 rounded-2xl shadow-sm text-sm ${
                                    isMe 
                                      ? 'bg-gradient-to-br from-primary to-primary-container text-white rounded-br-sm' 
                                      : 'bg-white border border-outline-variant/20 text-on-surface rounded-bl-sm'
                                  }`}
                                >
                                  {msg.text}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 mt-1 px-1">
                                <span className="text-[10px] text-on-surface-variant font-medium">{formatTime(msg.timestamp)}</span>
                                {isMe && (
                                  <span className={`material-symbols-outlined text-[14px] ${msg.status === 'read' ? 'text-blue-500' : 'text-on-surface-variant/50'}`}>
                                    done_all
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>

                  {/* Typing Indicator */}
                  {activeConversation.isTyping && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start w-full"
                    >
                      <img src={activeConversation.candidateAvatar} alt="" className="w-8 h-8 rounded-full mr-2 self-end mb-1 shadow-sm" />
                      <div className="bg-white border border-outline-variant/20 p-4 rounded-2xl rounded-bl-sm shadow-sm flex gap-1 items-center h-[46px]">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-on-surface-variant/50 rounded-full" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-on-surface-variant/50 rounded-full" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-on-surface-variant/50 rounded-full" />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-outline-variant/20 shrink-0">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-surface-container-low border border-outline-variant/30 p-2 rounded-2xl shadow-inner focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <button type="button" className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors shrink-0">
                      <span className="material-symbols-outlined">attach_file</span>
                    </button>
                    {editingMessageId && (
                      <div className="flex-1 flex flex-col min-w-0 pr-2">
                        <div className="flex justify-between items-center px-1 mb-1">
                          <span className="text-[10px] font-bold text-primary uppercase">Modification du message</span>
                          <button type="button" onClick={() => { setEditingMessageId(null); setEditingMessageText(''); }} className="text-[10px] font-bold text-on-surface-variant hover:text-error transition-colors">
                            Annuler
                          </button>
                        </div>
                        <textarea 
                          value={editingMessageText}
                          onChange={(e) => setEditingMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="w-full bg-transparent border-none focus:ring-0 resize-none p-1 text-sm outline-none custom-scrollbar min-h-[40px] text-on-surface"
                          rows={1}
                          autoFocus
                        />
                      </div>
                    )}
                    {!editingMessageId && (
                      <textarea 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Écrivez un message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 resize-none p-2 max-h-32 text-sm outline-none placeholder:text-on-surface-variant/50 min-h-[40px] custom-scrollbar"
                        rows={1}
                      />
                    )}
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={editingMessageId ? !editingMessageText.trim() : !newMessage.trim()}
                      className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px] ml-1">send</span>
                    </motion.button>
                  </form>
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.6 }}
                className="flex-1 flex flex-col items-center justify-center text-on-surface-variant p-6 text-center relative overflow-hidden"
              >
                {/* 3D Floating Icon Element */}
                <motion.div 
                  animate={{ y: [-15, 15, -15], rotateZ: [-3, 3, -3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-40 h-40 mb-8 flex items-center justify-center group cursor-default"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"
                  />
                  <div 
                    className="relative w-28 h-28 bg-white/90 backdrop-blur-md rounded-[2rem] flex items-center justify-center shadow-2xl border border-white transition-transform duration-500 group-hover:scale-110"
                    style={{ transformStyle: 'preserve-3d', transform: 'perspective(1000px) rotateX(15deg) rotateY(-15deg)' }}
                  >
                    <span className="material-symbols-outlined text-6xl text-primary drop-shadow-[0_4px_12px_rgba(165,59,34,0.3)]">
                      forum
                    </span>
                    {/* Decorative 3D elements */}
                    <motion.div 
                      animate={{ z: [0, 30, 0], y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-tertiary rounded-full shadow-lg border-2 border-white flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-white text-[14px]">star</span>
                    </motion.div>
                    <motion.div 
                      animate={{ z: [0, 40, 0], x: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="absolute -bottom-4 -left-2 w-10 h-10 bg-secondary rounded-2xl shadow-lg border-2 border-white flex items-center justify-center rotate-12"
                    >
                      <span className="material-symbols-outlined text-white text-[18px]">chat_bubble</span>
                    </motion.div>
                  </div>
                </motion.div>
                
                <h3 className="text-2xl font-extrabold font-heading text-on-surface mb-3 tracking-tight">Espace Messagerie</h3>
                <p className="max-w-sm text-sm leading-relaxed text-on-surface-variant/80 font-medium">
                  Sélectionnez une conversation dans le panneau de gauche pour interagir avec les candidats.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Bottom Mobile Nav */}
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
        <Link href="/entreprise/messages" className="flex flex-col items-center text-primary font-bold relative">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
          <span className="text-[10px] mt-1 font-label-caps">Msg</span>
        </Link>
      </nav>
    </div>
  );
}

