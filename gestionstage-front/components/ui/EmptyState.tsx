import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col items-center justify-center p-12 text-center bg-white/60 backdrop-blur-xl rounded-3xl border border-outline-variant/30 shadow-sm"
    >
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Icon className="w-10 h-10 text-primary opacity-80" />
      </div>
      <h3 className="text-2xl font-bold font-heading text-on-surface mb-2">{title}</h3>
      <p className="text-on-surface-variant max-w-md mx-auto mb-8">{description}</p>
      
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(165,59,34,0.39)] hover:shadow-[0_6px_20px_rgba(165,59,34,0.23)] hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
