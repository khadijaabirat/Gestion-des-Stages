'use client';

import { motion } from 'framer-motion';
import { FileText, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ApplicationCardProps {
  application: {
    id: string;
    name: string;
    position: string;
    school: string;
    year: string;
    avatar?: string;
    timeAgo: string;
    hasInterview?: boolean;
    interviewTime?: string;
  };
  columnId: string;
  index: number;
  onDragStart: (columnId: string, applicationId: string) => void;
  onDragEnd: () => void;
  isInProgress: boolean;
}

export default function ApplicationCard({
  application,
  columnId,
  index,
  onDragStart,
  onDragEnd,
  isInProgress,
}: ApplicationCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(columnId, application.id);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    onDragEnd();
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleViewCV = () => {
    toast.success(`CV de ${application.name} ouvert`, {
      duration: 2000,
      icon: '📄',
    });
  };

  const handleSendMessage = () => {
    toast.success(`Message envoyé à ${application.name}`, {
      duration: 2000,
      icon: '💬',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      draggable
      onDragStart={handleDragStart as any}
      onDragEnd={handleDragEnd as any}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 }
      }}
      className={`bg-surface-container-lowest p-4 rounded-lg shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
        isInProgress ? 'border-secondary/30 border-l-4' : 'border-outline-variant/20'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-medium px-2 py-1 bg-surface-container text-on-surface-variant rounded-md">
          {application.position}
        </span>
        {application.hasInterview && application.interviewTime ? (
          <span className="text-[10px] text-secondary font-medium">
            {application.interviewTime}
          </span>
        ) : (
          application.timeAgo && (
            <span className="text-[10px] text-outline">{application.timeAgo}</span>
          )
        )}
      </div>

      {/* Profile */}
      <div className="flex items-center gap-3 mb-3">
        {application.avatar ? (
          <motion.img
            whileHover={{ scale: 1.1 }}
            alt={application.name}
            className="w-10 h-10 rounded-full object-cover"
            src={application.avatar}
          />
        ) : (
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container font-bold text-sm"
          >
            {getInitials(application.name)}
          </motion.div>
        )}
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-on-surface">{application.name}</h4>
          <p className="text-xs text-on-surface-variant">
            {application.school}
            {application.year && ` • ${application.year}`}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          onClick={handleViewCV}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-1.5 border border-outline-variant/30 rounded text-xs font-medium text-secondary hover:bg-secondary/5 transition-colors flex justify-center items-center gap-1"
        >
          <FileText className="w-3.5 h-3.5" />
          CV
        </motion.button>
        <motion.button
          onClick={handleSendMessage}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="py-1.5 px-3 bg-surface-container-low rounded text-xs text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
