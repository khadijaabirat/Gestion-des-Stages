'use client';

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { motion } from 'framer-motion';

export default function PushNotificationManager() {
  const { isSupported, permission, subscription, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) return null;

  return (
    <button
      onClick={subscription ? unsubscribe : subscribe}
      className={`p-2 rounded-full transition-all duration-300 relative ${
        subscription 
          ? 'bg-primary/10 text-primary hover:bg-error/10 hover:text-error' 
          : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'
      }`}
      title={subscription ? 'Désactiver les notifications' : 'Activer les notifications push'}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {subscription && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-surface" />
      )}
    </button>
  );
}
