'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  unread: boolean;
  initials?: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: string;
  onSelectConversation: (id: string) => void;
}

export default function ConversationList({
  conversations,
  activeConversation,
  onSelectConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
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
      {/* Header */}
      <div className="p-4 border-b border-[#8b716b]/20">
        <h2 className="text-[24px] font-[700] leading-[1.3] text-[#131b2e] mb-4">
          Messagerie
        </h2>

        {/* Search Bar */}
        <div className="relative group">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57423d] transition-colors group-focus-within:text-[#a53b22]"
          />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f2f3ff] border-none rounded-lg text-[14px] leading-[1.5] focus:ring-2 focus:ring-[#a53b22] focus:bg-white transition-all placeholder:text-[#57423d]/70"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredConversations.map((conversation, index) => (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              ease: [0.16, 1, 0.3, 1],
            }}
            onClick={() => onSelectConversation(conversation.id)}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
              activeConversation === conversation.id
                ? 'bg-[#e2e7ff] border-l-2 border-[#a53b22]'
                : 'hover:bg-[#f2f3ff]'
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {conversation.avatar ? (
                <img
                  src={conversation.avatar}
                  alt={conversation.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#6f5fea] text-white flex items-center justify-center text-[18px] font-[700]">
                  {conversation.initials}
                </div>
              )}
              {/* Online Status */}
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                  conversation.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3
                  className={`text-[16px] leading-[1.6] truncate ${
                    activeConversation === conversation.id || conversation.unread
                      ? 'font-[600] text-[#131b2e]'
                      : 'font-[400] text-[#131b2e]'
                  }`}
                >
                  {conversation.name}
                </h3>
                <span className="text-[10px] text-[#57423d] ml-2 flex-shrink-0">
                  {conversation.timestamp}
                </span>
              </div>
              <p
                className={`text-[14px] leading-[1.5] truncate ${
                  conversation.unread
                    ? 'font-[500] text-[#a53b22]'
                    : 'text-[#57423d]'
                }`}
              >
                {conversation.lastMessage}
              </p>
            </div>

            {/* Unread Indicator */}
            {conversation.unread && (
              <div className="w-2 h-2 bg-[#a53b22] rounded-full flex-shrink-0" />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
