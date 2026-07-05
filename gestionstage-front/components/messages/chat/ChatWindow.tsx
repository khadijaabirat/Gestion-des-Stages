'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Phone, Video, Info, Paperclip, Smile, Send } from 'lucide-react';
import MessageBubble from './MessageBubble';

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  attachment?: {
    name: string;
    size: string;
    url: string;
  };
}

interface ChatWindowProps {
  conversation?: Conversation;
  onBack?: () => void;
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Bonjour ! Suite à notre échange téléphonique, je vous confirme que votre profil correspond parfaitement à nos attentes pour le stage en développement front-end.',
    sender: 'them',
    timestamp: '10:40',
  },
  {
    id: '2',
    text: 'Votre entretien est confirmé pour demain à 14h dans nos locaux.',
    sender: 'them',
    timestamp: '10:42',
    attachment: {
      name: 'Plan_Acces_TechCorp.pdf',
      size: '1.2 MB',
      url: '#',
    },
  },
  {
    id: '3',
    text: 'C\'est une excellente nouvelle ! Merci beaucoup. Je serai présent demain à 14h avec mon ordinateur portable.',
    sender: 'me',
    timestamp: '10:45',
  },
];

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setInputValue('');

      // Simulate typing response
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center rounded-2xl" style={{
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
      }}>
        <p className="text-[#57423d] text-[16px]">Sélectionnez une conversation</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-full flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px 0 rgba(165,59,34, 0.05)',
      }}
    >
      {/* Chat Header */}
      <div className="p-4 border-b border-[#8b716b]/20 flex justify-between items-center bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 hover:bg-[#f2f3ff] rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-[#131b2e]" />
            </button>
          )}
          {conversation.avatar ? (
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#6f5fea] text-white flex items-center justify-center text-[16px] font-[700]">
              {conversation.name.substring(0, 2)}
            </div>
          )}
          <div>
            <h2 className="text-[16px] font-[600] text-[#131b2e]">
              {conversation.name}
            </h2>
            <p className="text-[12px] text-[#57423d]">
              {conversation.isOnline ? 'En ligne' : 'Hors ligne'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="p-2 text-[#57423d] hover:text-[#a53b22] hover:bg-[#f2f3ff] rounded-full transition-all duration-300">
            <Phone size={20} />
          </button>
          <button className="p-2 text-[#57423d] hover:text-[#a53b22] hover:bg-[#f2f3ff] rounded-full transition-all duration-300">
            <Video size={20} />
          </button>
          <button className="p-2 text-[#57423d] hover:text-[#a53b22] hover:bg-[#f2f3ff] rounded-full transition-all duration-300">
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: 'rgba(250, 248, 255, 0.5)' }}>
        {/* Date Separator */}
        <div className="flex justify-center my-2">
          <span className="text-[10px] font-[600] tracking-[0.05em] text-[#57423d] bg-[#e2e7ff] px-3 py-1 rounded-full uppercase">
            Aujourd'hui
          </span>
        </div>

        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            avatar={message.sender === 'them' ? conversation.avatar : undefined}
            delay={index * 0.1}
          />
        ))}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3 max-w-[80%]"
            >
              {conversation.avatar && (
                <img
                  src={conversation.avatar}
                  alt={conversation.name}
                  className="w-8 h-8 rounded-full object-cover self-end"
                />
              )}
              <div className="bg-white border border-[#8b716b]/20 p-3 rounded-2xl rounded-bl-none flex gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-[#57423d] rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-[#57423d] rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-[#57423d] rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/60 backdrop-blur-md border-t border-[#8b716b]/20">
        <div className="flex items-end gap-2 bg-white border border-[#8b716b]/30 rounded-2xl p-2 focus-within:border-[#a53b22] focus-within:ring-1 focus-within:ring-[#a53b22] transition-all duration-300">
          <button className="p-2 text-[#57423d] hover:text-[#a53b22] rounded-full shrink-0 transition-colors">
            <Paperclip size={20} />
          </button>

          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-[16px] leading-[1.6] py-2 max-h-[120px] overflow-y-auto placeholder:text-[#57423d]/70"
            rows={1}
            style={{ minHeight: '40px' }}
          />

          <div className="flex gap-1 shrink-0 pb-1">
            <button className="p-2 text-[#57423d] hover:text-[#a53b22] rounded-full transition-colors">
              <Smile size={20} />
            </button>
            <button
              onClick={handleSendMessage}
              className="p-2 bg-[#a53b22] text-white hover:bg-[#84240d] rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
