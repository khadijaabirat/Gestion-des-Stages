'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import Link from 'next/link';

export default function ForgotPasswordContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Form State
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Basic Validation
    if (!email) {
      setErrorMsg('Veuillez entrer votre adresse email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Format d\'email invalide.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API Call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="h-full w-full relative flex items-center justify-center overflow-hidden bg-background text-on-background p-4">
      {/* Background Pattern */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(165,59,34, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(165,59,34, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: `${mousePosition.x / 10}px ${mousePosition.y / 10}px`,
          transition: 'background-position 0.2s ease-out'
        }}
      />
      <div 
        className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.05]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 100% 0%, var(--tw-colors-primary-container) 24%, transparent 24%),
            radial-gradient(circle at 0% 100%, var(--tw-colors-secondary-container) 24%, transparent 24%)
          `,
          backgroundSize: '80px 80px',
          backgroundPosition: '0 0, 40px 40px'
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

      {/* Auth Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_16px_64px_rgba(165,59,34,0.08)] rounded-3xl p-8 md:p-10"
      >
        <Link href="/login" className="absolute top-6 left-6 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        
        <div className="flex flex-col items-center text-center mb-8 pt-6">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary overflow-hidden shadow-xl transform group-hover:scale-105 transition-all duration-500 shadow-[0_12px_24px_rgba(86,68,208,0.3)] mb-6">
            <div className="absolute inset-[1.5px] bg-white/90 backdrop-blur rounded-[14px] flex items-center justify-center z-10">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4V20" stroke="url(#primaryGradientForgot)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M18 10V20" stroke="url(#secondaryGradientForgot)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M6 7L18 17" stroke="url(#tertiaryGradientForgot)" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="18" cy="5" r="3" fill="#5644d0" className="animate-pulse" />
                  <defs>
                    <linearGradient id="primaryGradientForgot" x1="6" y1="4" x2="6" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ff7e5f" />
                      <stop offset="1" stopColor="#ffb4a3" />
                    </linearGradient>
                    <linearGradient id="secondaryGradientForgot" x1="18" y1="10" x2="18" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#5644d0" />
                      <stop offset="1" stopColor="#6f5fea" />
                    </linearGradient>
                    <linearGradient id="tertiaryGradientForgot" x1="6" y1="7" x2="18" y2="17" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ff7e5f" />
                      <stop offset="1" stopColor="#5644d0" />
                    </linearGradient>
                  </defs>
               </svg>
            </div>
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-on-surface mb-2 tracking-tight">Mot de passe oublié ?</h1>
          <p className="text-on-surface-variant text-sm max-w-xs">
            {isSuccess 
              ? "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe." 
              : "Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-full bg-green-50/50 border border-green-200 rounded-2xl p-6 mb-8 text-center flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-4xl text-green-500">mark_email_read</span>
                <p className="font-bold text-green-800 text-sm">
                  Email de récupération envoyé à <br/><span className="text-on-surface">{email}</span>
                </p>
              </div>
              <Link href="/login" className="w-full">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-white/80 hover:bg-surface-dim transition-all shadow-sm text-center"
                >
                  Retour à la connexion
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-6"
            >
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {errorMsg}
                </motion.div>
              )}

              <div className="group">
                <label htmlFor="email" className="block text-xs font-bold text-on-surface mb-2 font-label-caps tracking-wider">Adresse Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">mail</span>
                  <input 
                    id="email"
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
                  />
                </div>
              </div>

              <motion.button 
                type="submit"
                disabled={isSubmitting || !email}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-2 py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-tertiary hover:shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none relative overflow-hidden group"
              >
                {/* Button shine effect */}
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
                />
                
                {isSubmitting ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="material-symbols-outlined text-[18px]">
                      sync
                    </motion.span>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Réinitialiser le mot de passe</span>
                    <span className="material-symbols-outlined text-[18px] relative z-10 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </motion.button>

              <div className="mt-4 text-center">
                <p className="text-sm text-on-surface-variant">
                  Vous vous souvenez de votre mot de passe ?{' '}
                  <Link href="/login" className="font-bold text-primary hover:underline transition-all">
                    Connectez-vous
                  </Link>
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

