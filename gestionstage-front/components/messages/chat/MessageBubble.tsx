'use client';

import { motion } from 'framer-motion';
import { Download, CheckCheck } from 'lucide-react';

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

interface MessageBubbleProps {
  message: Message;
  avatar?: string;
  delay?: number;
}

export default function MessageBubble({ message, avatar, delay = 0 }: MessageBubbleProps) {
  const isMe = message.sender === 'me';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`flex gap-3 max-w-[80%] ${isMe ? 'self-end flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      {!isMe && avatar && (
        <img
          src={avatar}
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover self-end flex-shrink-0"
        />
      )}

      {/* Message Content */}
      <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
        {/* Message Bubble */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className={`p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 ${
            isMe
              ? 'bg-gradient-to-br from-[#a53b22] to-[#84240d] text-white rounded-br-none'
              : 'bg-white border border-[#8b716b]/20 text-[#131b2e] rounded-bl-none'
          }`}
        >
          <p className="text-[16px] leading-[1.6] break-words">{message.text}</p>
        </motion.div>

        {/* Attachment */}
        {message.attachment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.2 }}
            className="bg-[#f2f3ff] border border-[#8b716b]/20 p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[#e2e7ff] transition-all duration-300 hover:shadow-md group"
          >
            <div className="w-10 h-10 bg-[#a53b22]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-[#a53b22]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-[600] tracking-[0.05em] text-[#131b2e] truncate">
                {message.attachment.name}
              </p>
              <p className="text-[10px] text-[#57423d]">{message.attachment.size}</p>
            </div>
            <Download
              size={18}
              className="text-[#57423d] group-hover:text-[#a53b22] transition-colors flex-shrink-0"
            />
          </motion.div>
        )}

        {/* Timestamp and Read Status */}
        <div className={`flex items-center gap-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-[#57423d]">{message.timestamp}</span>
          {isMe && (
            <CheckCheck size={14} className="text-[#a53b22]" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
