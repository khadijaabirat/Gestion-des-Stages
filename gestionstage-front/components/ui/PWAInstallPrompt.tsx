'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isAppStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(isAppStandalone);

    if (isAppStandalone) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show prompt for iOS after a slight delay
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
       setShowPrompt(false);
       return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface-container-highest shadow-2xl rounded-2xl p-4 flex flex-col items-center gap-4 w-[90%] max-w-md border border-outline-variant/30"
      >
        <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            </div>
            <div className="flex-1">
            <h4 className="font-bold text-on-surface text-sm">Installer NexusIntern</h4>
            <p className="text-xs text-on-surface-variant">
                {isIOS 
                ? "Touchez l'icône Partager puis 'Sur l'écran d'accueil' pour l'installer." 
                : "Pour une expérience plus rapide et hors ligne"}
            </p>
            </div>
            {!isIOS && (
                <div className="flex flex-col gap-2 shrink-0">
                <button 
                    onClick={handleInstallClick}
                    className="bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Installer
                </button>
                <button 
                    onClick={() => setShowPrompt(false)}
                    className="text-on-surface-variant text-xs hover:text-on-surface transition-colors"
                >
                    Plus tard
                </button>
                </div>
            )}
            {isIOS && (
                 <button 
                 onClick={() => setShowPrompt(false)}
                 className="p-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-variant transition-colors"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
            )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
