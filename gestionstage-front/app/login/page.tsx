'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, Rocket, Zap, Award, User, Briefcase, Target, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, initCsrfCookie } from '@/lib/api';
import { toast } from 'react-hot-toast';

type UserRole = 'student' | 'company';

export default function AuthPage() {
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [validFields, setValidFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Mouse tracking for effects
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);

  // Parallax effect for right side
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });
  const parallaxX = useTransform(smoothX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [-30, 30]);
  const parallaxY = useTransform(smoothY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [-30, 30]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setCursorGlowOpacity(1);
    };
    const handleMouseLeave = () => setCursorGlowOpacity(0);
    
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  const handleBlur = (field: string, value: string) => {
    if (value.trim()) setValidFields(prev => new Set(prev).add(field));
    else setValidFields(prev => { const newSet = new Set(prev); newSet.delete(field); return newSet; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return toast.error('Veuillez remplir tous les champs obligatoires');
    
    setIsSubmitting(true);
    
    try {
      await initCsrfCookie();

      const response = await apiFetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          remember: formData.remember,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const backendRole = data.user?.role || (role === 'student' ? 'etudiant' : 'entreprise');

        if (data.access_token) {
          document.cookie = `token=${data.access_token}; path=/`;
          document.cookie = `userRole=${backendRole}; path=/`;
          document.cookie = `userName=${data.user?.nom || data.user?.prenom || formData.email}; path=/`;
        } else {
          document.cookie = `userRole=${backendRole}; path=/`;
          document.cookie = `userName=${data.user?.nom || data.user?.prenom || formData.email}; path=/`;
        }

        if (backendRole === 'entreprise') {
          router.push('/entreprise/dashboard');
        } else if (backendRole === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/etudiant/dashboard');
        }
      } else {
        toast.error(data.message || 'Identifiants incorrects');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Impossible de se connecter au serveur');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex relative bg-background overflow-hidden selection:bg-primary/30 selection:text-primary">
      {/* Global Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300 mix-blend-multiply"
        style={{
          opacity: cursorGlowOpacity,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(86,68,208, 0.05), transparent 40%)`
        }}
      />

      {/* LEFT SIDE - FORM */}
      <div className="w-full lg:w-[45%] h-screen overflow-y-auto flex flex-col px-8 sm:px-16 lg:px-24 py-12 relative z-10 bg-white/40 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-white/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        
        {/* Subtle Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 w-full lg:w-[45%]">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(86,68,208,0.03)_0%,transparent_50%)]" />
          <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_100%,rgba(165,59,34,0.03)_0%,transparent_50%)]" />
        </div>

        <div className="w-full max-w-sm mx-auto relative z-10 flex-1 flex flex-col justify-center my-auto min-h-max">
          
          {/* Logo & Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 pt-8"
          >
            <Link href="/" className="inline-flex flex-col items-start group">
              <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary overflow-hidden shadow-lg transform group-hover:scale-105 transition-all duration-500 group-hover:shadow-[0_12px_24px_rgba(86,68,208,0.3)] mb-4 group-hover:-rotate-3">
                <div className="absolute inset-[1.5px] bg-white/90 backdrop-blur rounded-[14px] flex items-center justify-center z-10 transition-colors duration-300">
                   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform duration-500">
                      <path d="M6 4V20" stroke="url(#primaryGradientLogin2)" strokeWidth="3" strokeLinecap="round" />
                      <path d="M18 10V20" stroke="url(#secondaryGradientLogin2)" strokeWidth="3" strokeLinecap="round" />
                      <path d="M6 7L18 17" stroke="url(#tertiaryGradientLogin2)" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="18" cy="5" r="3" fill="#5644d0" className="animate-pulse" />
                      <defs>
                        <linearGradient id="primaryGradientLogin2" x1="6" y1="4" x2="6" y2="20" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#ff7e5f" />
                          <stop offset="1" stopColor="#ffb4a3" />
                        </linearGradient>
                        <linearGradient id="secondaryGradientLogin2" x1="18" y1="10" x2="18" y2="20" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#5644d0" />
                          <stop offset="1" stopColor="#6f5fea" />
                        </linearGradient>
                        <linearGradient id="tertiaryGradientLogin2" x1="6" y1="7" x2="18" y2="17" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#ff7e5f" />
                          <stop offset="1" stopColor="#5644d0" />
                        </linearGradient>
                      </defs>
                   </svg>
                </div>
              </div>
              <h1 className="text-3xl font-heading font-extrabold text-on-surface tracking-tight group-hover:text-primary transition-colors duration-300">
                NexusIntern
              </h1>
            </Link>
          </motion.div>

          {/* Welcome Text */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-4xl font-bold text-on-background mb-2 tracking-tight">Bienvenue</h2>
            <p className="text-on-surface-variant text-base">
              Connectez-vous pour accéder à votre espace
            </p>
          </motion.div>

          {/* Role Switcher */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative bg-surface-container-high p-1 rounded-xl flex mb-8 shadow-inner"
          >
            <motion.div
              animate={{ x: role === 'company' ? '100%' : '0%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-md border border-outline-variant/10"
            />
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase z-10 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 ${
                role === 'student' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <User size={16} className={role === 'student' ? 'text-primary' : 'text-on-surface-variant'} />
              Étudiant
            </button>
            <button
              type="button"
              onClick={() => setRole('company')}
              className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase z-10 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 ${
                role === 'company' ? 'text-secondary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Briefcase size={16} className={role === 'company' ? 'text-secondary' : 'text-on-surface-variant'} />
              Entreprise
            </button>
          </motion.div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-5 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-5"
            >
              <div className="relative group">
                <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                  Email {role === 'student' ? 'Étudiant' : 'Professionnel'}
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50 transition-colors duration-300 ${role === 'student' ? 'group-focus-within:text-primary' : 'group-focus-within:text-secondary'}`} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onBlur={(e) => handleBlur('email', e.target.value)}
                    required
                    placeholder={role === 'student' ? "jean.dupont@ecole.edu" : "contact@entreprise.fr"}
                    className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-12 py-3.5 text-on-background placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      validFields.has('email') 
                        ? (role === 'student' ? 'border-primary/50 shadow-[0_0_0_1px_rgba(165,59,34,0.2)] focus:ring-primary/30' : 'border-secondary/50 shadow-[0_0_0_1px_rgba(86,68,208,0.2)] focus:ring-secondary/30') 
                        : (role === 'student' ? 'border-outline-variant/40 hover:border-outline-variant focus:ring-primary/30' : 'border-outline-variant/40 hover:border-outline-variant focus:ring-secondary/30')
                    }`}
                  />
                  {validFields.has('email') && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${role === 'student' ? 'text-primary' : 'text-secondary'}`}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="relative group">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Mot de passe
                  </label>
                  <Link href="/forgot-password" className={`text-xs font-bold hover:underline transition-colors ${role === 'student' ? 'text-primary hover:text-primary-container' : 'text-secondary hover:text-secondary-container'}`}>
                    Oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50 transition-colors duration-300 ${role === 'student' ? 'group-focus-within:text-primary' : 'group-focus-within:text-secondary'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onBlur={(e) => handleBlur('password', e.target.value)}
                    required
                    placeholder="••••••••"
                    className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-12 py-3.5 text-on-background placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      validFields.has('password') 
                        ? (role === 'student' ? 'border-primary/50 shadow-[0_0_0_1px_rgba(165,59,34,0.2)] focus:ring-primary/30' : 'border-secondary/50 shadow-[0_0_0_1px_rgba(86,68,208,0.2)] focus:ring-secondary/30') 
                        : (role === 'student' ? 'border-outline-variant/40 hover:border-outline-variant focus:ring-primary/30' : 'border-outline-variant/40 hover:border-outline-variant focus:ring-secondary/30')
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Remember Checkbox */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex items-start gap-3 pt-2"
            >
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="remember"
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                  className={`w-4 h-4 rounded border-outline-variant/40 bg-surface-container-lowest cursor-pointer transition-all duration-300 ${
                    role === 'student' ? 'text-primary focus:ring-primary/30' : 'text-secondary focus:ring-secondary/30'
                  }`}
                />
              </div>
              <label htmlFor="remember" className="text-sm text-on-surface-variant cursor-pointer leading-tight font-medium">
                Se souvenir de moi pendant 30 jours
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="pt-4"
            >
              <motion.button
                type="submit"
                disabled={isSubmitting || !formData.email || !formData.password}
                whileHover={{ scale: (isSubmitting || !formData.email || !formData.password) ? 1 : 1.02, y: (isSubmitting || !formData.email || !formData.password) ? 0 : -2 }}
                whileTap={{ scale: (isSubmitting || !formData.email || !formData.password) ? 1 : 0.98 }}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white relative overflow-hidden group shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  (isSubmitting || !formData.email || !formData.password)
                    ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed shadow-none' 
                    : role === 'student' 
                      ? 'bg-gradient-to-r from-primary to-tertiary shadow-primary/30 hover:shadow-primary/50' 
                      : 'bg-gradient-to-r from-secondary to-tertiary shadow-secondary/30 hover:shadow-secondary/50'
                }`}
              >
                {!(isSubmitting || !formData.email || !formData.password) && (
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                )}
                {isSubmitting ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Se connecter</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Social Login (LinkedIn) */}
          <AnimatePresence mode="wait">
            {role === 'student' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <div className="relative flex items-center justify-center my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/30"></div>
                  </div>
                  <div className="relative px-4 bg-[#f8f9fa] lg:bg-white/40 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Ou
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <motion.a
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/google/redirect`}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-on-surface relative overflow-hidden group shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-outline-variant/30 hover:border-outline-variant transition-all duration-300 flex items-center justify-center gap-3 bg-white hover:bg-surface-container-lowest hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continuer avec Google
                  </motion.a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Register Link */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 pb-8 text-center text-sm text-on-surface-variant font-medium"
          >
            Pas encore de compte ?{' '}
            <Link href="/register" className={`font-bold hover:underline transition-colors ${role === 'student' ? 'text-primary' : 'text-secondary'}`}>
              Créer un compte gratuitement
            </Link>
          </motion.p>
        </div>
      </div>

      {/* RIGHT SIDE - VISUAL SECTION (Parallax & Premium Design) */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-surface-container-lowest items-center justify-center h-screen">
        
        {/* Premium Luxury Background 2026 (Aurora Mesh + Noise + Orbital Rings) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-surface-container-lowest">
          {/* Animated Mesh Gradients */}
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1] 
            }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] rounded-[100%] blur-[140px] opacity-[0.25] bg-gradient-to-bl from-secondary to-tertiary"
          />
          <motion.div 
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.3, 1],
              x: [0, -100, 0]
            }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] rounded-[100%] blur-[120px] opacity-30 bg-gradient-to-tr from-primary to-secondary"
          />
          <motion.div 
            animate={{ 
              y: [0, 50, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[30%] right-[20%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-20 bg-tertiary"
          />
          
          {/* Subtle noise texture overlay for a frosted glass/premium feel */}
          <div className="absolute inset-0 opacity-[0.5] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

          {/* Glowing orbital lines (Subtle vector rings) */}
          <motion.div 
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-[0.03] border-[1px] border-on-surface rounded-full border-dashed"
          />
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] opacity-[0.04] border-[1px] border-on-surface rounded-full"
          />
        </div>

        {/* Floating UI Elements with Parallax */}
        <motion.div 
          style={{ x: parallaxX, y: parallaxY }}
          className="relative z-10 w-full max-w-lg perspective-1000"
        >
          {/* Main Visual Card */}
          <motion.div
            initial={{ opacity: 0, rotateY: -15, rotateX: -10, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: 5, rotateX: 5, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="bg-white/60 backdrop-blur-3xl border border-white/80 p-8 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.05),0_0_0_1px_rgba(255,255,255,0.4)_inset] relative"
          >
            {/* Top Bar of the Card */}
            <div className="flex items-center justify-between mb-8">
              <div className="px-3 py-1 bg-surface-container-low rounded-full text-[10px] font-bold text-on-surface-variant font-label-caps uppercase tracking-widest border border-outline-variant/20 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Accès Sécurisé
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-outline-variant/30" />
                <div className="w-3 h-3 rounded-full bg-outline-variant/30" />
                <div className="w-3 h-3 rounded-full bg-outline-variant/30" />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-4xl font-heading font-extrabold text-on-surface leading-tight">
                Accédez à votre <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-tertiary">
                  espace.
                </span>
              </h3>
              <p className="text-on-surface-variant leading-relaxed text-lg">
                Rejoignez le réseau le plus performant au Maroc. Plus de 2500 entreprises recrutent activement les meilleurs talents de demain.
              </p>

              {/* Dynamic Feature List depending on role */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={role}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 pt-6 border-t border-outline-variant/30"
                >
                  {role === 'student' ? (
                    <>
                      <FeatureRow icon={Rocket} title="Boost de visibilité" desc="Votre profil mis en avant auprès des recruteurs." color="text-primary" bg="bg-primary/10" delay={0.2} />
                      <FeatureRow icon={Zap} title="Matching Instantané" desc="Algorithme intelligent basé sur vos compétences." color="text-tertiary" bg="bg-tertiary/10" delay={0.3} />
                      <FeatureRow icon={Award} title="Accès Exclusif" desc="Opportunités premium réservées à nos membres." color="text-secondary" bg="bg-secondary/10" delay={0.4} />
                    </>
                  ) : (
                    <>
                      <FeatureRow icon={Target} title="Ciblage Chirurgical" desc="Atteignez exactement les profils dont vous avez besoin." color="text-secondary" bg="bg-secondary/10" delay={0.2} />
                      <FeatureRow icon={Shield} title="Profils Vérifiés" desc="Tous les étudiants sont certifiés par leurs écoles." color="text-primary" bg="bg-primary/10" delay={0.3} />
                      <FeatureRow icon={Zap} title="Recrutement Éclair" desc="Processus automatisé pour gagner un temps précieux." color="text-tertiary" bg="bg-tertiary/10" delay={0.4} />
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Decorative Floating Elements */}
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-8 -bottom-8 w-24 h-24 bg-gradient-to-tl from-secondary to-primary rounded-2xl shadow-xl shadow-secondary/20 backdrop-blur-md flex items-center justify-center p-4"
            >
               <div className="text-center">
                 <div className="text-white font-bold text-2xl">98%</div>
                 <div className="text-white/80 text-[10px] font-label-caps uppercase tracking-wider">Succès</div>
               </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom copyright */}
        <div className="absolute bottom-8 left-8 text-on-surface-variant text-xs font-medium opacity-50">
          © 2026 NexusIntern. Tous droits réservés.
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon: Icon, title, desc, color, bg, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-start gap-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}>
        <Icon size={24} strokeWidth={2} />
      </div>
      <div>
        <h4 className="font-bold text-on-surface mb-0.5">{title}</h4>
        <p className="text-sm text-on-surface-variant">{desc}</p>
      </div>
    </motion.div>
  );
}
