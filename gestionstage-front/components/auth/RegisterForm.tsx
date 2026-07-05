'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Mail, Lock, School, Building2, Briefcase, Eye, EyeOff, ArrowRight, Check, Rocket, Globe, Shield, Star, Award, Zap, User, Target } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, initCsrfCookie } from '@/lib/api';
import { toast } from 'react-hot-toast';

type UserRole = 'student' | 'company';

export default function RegisterForm() {
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    school: '',
    companyName: '',
    website: '',
    sector: '',
    password: '',
    terms: false,
    document: null as File | null,
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
    
    if (!formData.terms) return toast.error('Veuillez accepter les conditions générales');
    if (!formData.password || formData.password.length < 8) return toast.error('Le mot de passe doit contenir au moins 8 caractères');
    if (!formData.email) return toast.error('Veuillez entrer votre email');
    if (role === 'student' && (!formData.firstName || !formData.lastName || !formData.school)) return toast.error('Veuillez remplir tous les champs obligatoires');
    if (role === 'company' && (!formData.companyName || !formData.sector)) return toast.error('Veuillez remplir tous les champs obligatoires');
    if (role === 'company' && !formData.document) return toast.error('Veuillez uploader votre document juridique (RC, ICE, etc.)');
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = new FormData();
      dataToSend.append('nom', role === 'student' ? `${formData.firstName} ${formData.lastName}` : formData.companyName);
      dataToSend.append('email', formData.email);
      dataToSend.append('password', formData.password);
      dataToSend.append('password_confirmation', formData.password);
      dataToSend.append('role', role === 'student' ? 'etudiant' : 'entreprise');

      if (role === 'student') {
        dataToSend.append('filiere', formData.school);
        dataToSend.append('niveau_etude', 'Non spécifié');
      } else {
        dataToSend.append('description', `Secteur: ${formData.sector}`);
        if (formData.website) dataToSend.append('site_web', formData.website);
        if (formData.document) dataToSend.append('document_juridique', formData.document);
      }

      // Initialiser le CSRF token pour Laravel Sanctum SPA avant la requête POST
      await initCsrfCookie();

      const response = await apiFetch('/register', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: dataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        if (data.access_token) {
          document.cookie = `token=${data.access_token}; path=/`;
          document.cookie = `userRole=${role === 'student' ? 'etudiant' : 'entreprise'}; path=/`;
          document.cookie = `userName=${role === 'student' ? `${formData.firstName} ${formData.lastName}` : formData.companyName}; path=/`;
        }
        if (role === 'company') {
          toast.success("Compte créé avec succès. Votre compte est en attente de validation par l'administration.");
          router.push('/entreprise/dashboard');
        } else {
          router.push('/etudiant/dashboard');
        }
      } else {
        toast.error(data.message || 'Erreur lors de l\'inscription');
        console.error('Validation errors:', data.errors);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Erreur de connexion au serveur backend (Assure-toi que Laravel tourne sur le port 8000)');
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

      {/* LEFT SIDE - SCROLLABLE FORM */}
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
                      <path d="M6 4V20" stroke="url(#primaryGradientReg2)" strokeWidth="3" strokeLinecap="round" />
                      <path d="M18 10V20" stroke="url(#secondaryGradientReg2)" strokeWidth="3" strokeLinecap="round" />
                      <path d="M6 7L18 17" stroke="url(#tertiaryGradientReg2)" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="18" cy="5" r="3" fill="#5644d0" className="animate-pulse" />
                      <defs>
                        <linearGradient id="primaryGradientReg2" x1="6" y1="4" x2="6" y2="20" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#ff7e5f" />
                          <stop offset="1" stopColor="#ffb4a3" />
                        </linearGradient>
                        <linearGradient id="secondaryGradientReg2" x1="18" y1="10" x2="18" y2="20" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#5644d0" />
                          <stop offset="1" stopColor="#6f5fea" />
                        </linearGradient>
                        <linearGradient id="tertiaryGradientReg2" x1="6" y1="7" x2="18" y2="17" gradientUnits="userSpaceOnUse">
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
            <h2 className="text-4xl font-bold text-on-background mb-2 tracking-tight">Créer un compte</h2>
            <p className="text-on-surface-variant text-base">
              Rejoignez l'élite du recrutement dès aujourd'hui.
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
            <AnimatePresence mode="wait">
              {role === 'student' ? (
                <motion.div
                  key="student"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Prénom"
                      placeholder="Jean"
                      value={formData.firstName}
                      onChange={(v) => setFormData({ ...formData, firstName: v })}
                      onBlur={(v) => handleBlur('firstName', v)}
                      isValid={validFields.has('firstName')}
                      accentColor="primary"
                    />
                    <InputField
                      label="Nom"
                      placeholder="Dupont"
                      value={formData.lastName}
                      onChange={(v) => setFormData({ ...formData, lastName: v })}
                      onBlur={(v) => handleBlur('lastName', v)}
                      isValid={validFields.has('lastName')}
                      accentColor="primary"
                    />
                  </div>
                  
                  <InputField
                    label="Email Étudiant"
                    type="email"
                    placeholder="jean.dupont@ecole.edu"
                    icon={<Mail className="w-5 h-5" />}
                    value={formData.email}
                    onChange={(v) => setFormData({ ...formData, email: v })}
                    onBlur={(v) => handleBlur('email', v)}
                    isValid={validFields.has('email')}
                    accentColor="primary"
                  />
                  
                  <InputField
                    label="École / Université"
                    placeholder="Université de Paris"
                    icon={<School className="w-5 h-5" />}
                    value={formData.school}
                    onChange={(v) => setFormData({ ...formData, school: v })}
                    onBlur={(v) => handleBlur('school', v)}
                    isValid={validFields.has('school')}
                    accentColor="primary"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="company"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-5"
                >
                  <InputField
                    label="Nom de l'entreprise"
                    placeholder="Tech Innovate SAS"
                    icon={<Building2 className="w-5 h-5" />}
                    value={formData.companyName}
                    onChange={(v) => setFormData({ ...formData, companyName: v })}
                    onBlur={(v) => handleBlur('companyName', v)}
                    isValid={validFields.has('companyName')}
                    accentColor="secondary"
                  />
                  
                  <InputField
                    label="Email Professionnel"
                    type="email"
                    placeholder="contact@techinnovate.fr"
                    icon={<Briefcase className="w-5 h-5" />}
                    value={formData.email}
                    onChange={(v) => setFormData({ ...formData, email: v })}
                    onBlur={(v) => handleBlur('email', v)}
                    isValid={validFields.has('email')}
                    accentColor="secondary"
                  />
                  
                  <InputField
                    label="Site Web (Optionnel)"
                    type="url"
                    placeholder="https://www.techinnovate.fr"
                    icon={<Globe className="w-5 h-5" />}
                    value={formData.website}
                    onChange={(v) => setFormData({ ...formData, website: v })}
                    onBlur={(v) => handleBlur('website', v)}
                    isValid={validFields.has('website')}
                    accentColor="secondary"
                  />
                  
                  <SelectField
                    label="Secteur d'activité"
                    value={formData.sector}
                    onChange={(v) => { setFormData({ ...formData, sector: v }); handleBlur('sector', v); }}
                    isValid={validFields.has('sector')}
                    accentColor="secondary"
                    options={[
                      { value: '', label: 'Sélectionnez un secteur' },
                      { value: 'it', label: "Technologies de l'Information" },
                      { value: 'finance', label: 'Banque & Finance' },
                      { value: 'health', label: 'Santé & Pharmacie' },
                      { value: 'retail', label: 'Commerce & Distribution' },
                      { value: 'other', label: 'Autre' },
                    ]}
                  />

                  {/* Document Upload */}
                  <div className="relative group">
                    <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                      Document Juridique <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files ? e.target.files[0] : null;
                          setFormData({ ...formData, document: file });
                        }}
                        className="w-full bg-surface-container-lowest border border-outline-variant/40 hover:border-outline-variant rounded-xl px-4 py-3 text-on-background file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-secondary/10 file:text-secondary hover:file:bg-secondary/20 transition-all focus:outline-none focus:ring-2 focus:ring-secondary/30"
                      />
                      {formData.document && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring" }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary"
                        >
                          <Check className="w-5 h-5" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-2">Max 5MB. Sera vérifié par l'administration.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Field */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative group"
            >
              <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                Mot de passe
              </label>
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
                {validFields.has('password') && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className={`absolute right-12 top-1/2 -translate-y-1/2 ${role === 'student' ? 'text-primary' : 'text-secondary'}`}
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Terms Checkbox */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex items-start gap-3 pt-2"
            >
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                  className={`w-4 h-4 rounded border-outline-variant/40 bg-surface-container-lowest cursor-pointer transition-all duration-300 ${
                    role === 'student' ? 'text-primary focus:ring-primary/30' : 'text-secondary focus:ring-secondary/30'
                  }`}
                />
              </div>
              <label htmlFor="terms" className="text-sm text-on-surface-variant cursor-pointer leading-tight font-medium">
                J'accepte les{' '}
                <Link href="#" className={`font-bold hover:underline transition-colors ${role === 'student' ? 'text-primary hover:text-primary-container' : 'text-secondary hover:text-secondary-container'}`}>
                  Conditions Générales
                </Link>{' '}
                et la{' '}
                <Link href="#" className={`font-bold hover:underline transition-colors ${role === 'student' ? 'text-primary hover:text-primary-container' : 'text-secondary hover:text-secondary-container'}`}>
                  Politique de Confidentialité
                </Link>
                .
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
                disabled={isSubmitting || !formData.terms || !formData.password || !formData.email}
                whileHover={{ scale: (isSubmitting || !formData.terms || !formData.password || !formData.email) ? 1 : 1.02, y: (isSubmitting || !formData.terms || !formData.password || !formData.email) ? 0 : -2 }}
                whileTap={{ scale: (isSubmitting || !formData.terms || !formData.password || !formData.email) ? 1 : 0.98 }}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white relative overflow-hidden group shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  (isSubmitting || !formData.terms || !formData.password || !formData.email)
                    ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed shadow-none' 
                    : role === 'student' 
                      ? 'bg-gradient-to-r from-primary to-tertiary shadow-primary/30 hover:shadow-primary/50' 
                      : 'bg-gradient-to-r from-secondary to-tertiary shadow-secondary/30 hover:shadow-secondary/50'
                }`}
              >
                {!(isSubmitting || !formData.terms || !formData.password || !formData.email) && (
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                )}
                {isSubmitting ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    <span>Création du compte...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Créer mon compte gratuit</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Login Link */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 pb-8 text-center text-sm text-on-surface-variant font-medium"
          >
            Déjà un compte ?{' '}
            <Link href="/login" className={`font-bold hover:underline transition-colors ${role === 'student' ? 'text-primary' : 'text-secondary'}`}>
              Connectez-vous
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
                Inscription Sécurisée
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-outline-variant/30" />
                <div className="w-3 h-3 rounded-full bg-outline-variant/30" />
                <div className="w-3 h-3 rounded-full bg-outline-variant/30" />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-4xl font-heading font-extrabold text-on-surface leading-tight">
                Commencez votre <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-tertiary">
                  ascension.
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

// Sub-components

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

function InputField({
  label,
  type = 'text',
  placeholder,
  icon,
  value,
  onChange,
  onBlur,
  isValid,
  accentColor
}: any) {
  const [isFocused, setIsFocused] = useState(false);
  const colorMap = {
    primary: 'text-primary ring-primary/30 border-primary/50 shadow-[0_0_0_1px_rgba(165,59,34,0.2)]',
    secondary: 'text-secondary ring-secondary/30 border-secondary/50 shadow-[0_0_0_1px_rgba(86,68,208,0.2)]'
  };
  const activeColor = colorMap[accentColor as keyof typeof colorMap];

  return (
    <div className="relative group">
      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50 transition-colors duration-300 ${isFocused ? `text-${accentColor}` : ''}`}>
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => { onBlur(e.target.value); setIsFocused(false); }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className={`w-full bg-surface-container-lowest border rounded-xl ${icon ? 'pl-12' : 'pl-4'} pr-12 py-3.5 text-on-background placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 transition-all duration-300 ${
            isValid 
              ? activeColor
              : `border-outline-variant/40 hover:border-outline-variant focus:ring-${accentColor}/30`
          }`}
        />
        {isValid && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-${accentColor}`}
          >
            <Check className="w-5 h-5" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  isValid,
  options,
  accentColor
}: any) {
  const [isFocused, setIsFocused] = useState(false);
  const colorMap = {
    primary: 'text-primary ring-primary/30 border-primary/50 shadow-[0_0_0_1px_rgba(165,59,34,0.2)]',
    secondary: 'text-secondary ring-secondary/30 border-secondary/50 shadow-[0_0_0_1px_rgba(86,68,208,0.2)]'
  };
  const activeColor = colorMap[accentColor as keyof typeof colorMap];

  return (
    <div className="relative group">
      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3.5 text-on-background focus:outline-none focus:ring-2 appearance-none transition-all duration-300 ${
            isValid 
              ? activeColor
              : `border-outline-variant/40 hover:border-outline-variant focus:ring-${accentColor}/30`
          }`}
        >
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 ${isFocused ? `text-${accentColor}` : 'text-on-surface-variant/50'}`}>
          <motion.svg 
            animate={{ rotate: isFocused ? 180 : 0 }} 
            className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
        {isValid && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className={`absolute right-12 top-1/2 -translate-y-1/2 text-${accentColor}`}
          >
            <Check className="w-5 h-5" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
