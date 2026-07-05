'use client';

import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import ApplicationCard from '../cards/ApplicationCard';
import { useState } from 'react';

interface Application {
  id: string;
  name: string;
  position: string;
  school: string;
  year: string;
  avatar?: string;
  timeAgo: string;
  hasInterview?: boolean;
  interviewTime?: string;
}

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    color: string;
    applications: Application[];
  };
  index: number;
  onDragStart: (columnId: string, applicationId: string) => void;
  onDragEnd: () => void;
  onDrop: (columnId: string) => void;
  isDragging: boolean;
}

export default function KanbanColumn({
  column,
  index,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(column.id);
  };

  const colorMap: Record<string, string> = {
    'primary-container': 'bg-primary-container',
    'tertiary-container': 'bg-tertiary-container',
    'secondary': 'bg-secondary',
    'error': 'bg-error/80',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
      className="flex-none w-80 snap-start"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${colorMap[column.color]}`} />
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
            {column.title}
          </h3>
          <span className="bg-white/80 text-on-surface-variant px-2 py-0.5 rounded-full text-xs font-medium">
            {column.applications.length}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="text-on-surface-variant hover:text-primary transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`glass-panel rounded-2xl p-2 flex flex-col gap-3 min-h-[500px] transition-all duration-300 ${
          isDragOver ? 'bg-surface-container-high/70 border-2 border-dashed border-secondary' : ''
        } ${column.id === 'rejected' ? 'opacity-70' : ''}`}
      >
        {column.applications.map((application, appIndex) => (
          <ApplicationCard
            key={application.id}
            application={application}
            columnId={column.id}
            index={appIndex}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isInProgress={column.id === 'progress'}
          />
        ))}

        {column.applications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-32 text-on-surface-variant/40 text-sm"
          >
            Aucune candidature
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
