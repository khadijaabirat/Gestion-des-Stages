'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Briefcase, Mail, Key, Eye, EyeOff, Target, Rocket, Star } from 'lucide-react';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'etudiant' | 'entreprise'>('etudiant');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login:', { email, password, type: activeTab });
    }, 2000);
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Left Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white relative overflow-hidden">
        {/* Subtle Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tl from-secondary/5 to-transparent rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-tertiary/3 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Form Container */}
        <div className={`w-full max-w-md relative z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Logo & Back */}
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-3 group mb-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-primary via-primary-container to-secondary rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-2xl">N</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 tracking-tight">NexusIntern</div>
                <div className="text-xs text-gray-500">Votre avenir commence ici</div>
              </div>
            </Link>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
              Bienvenue!
            </motion.h1>
            <p className="text-gray-600 text-lg">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="relative bg-gray-50 rounded-2xl p-1.5 mb-8 border border-gray-100">
            <div 
              className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-lg shadow-gray-200/50 transition-all duration-500 ease-out"
              style={{
                transform: activeTab === 'entreprise' ? 'translateX(calc(100% + 12px))' : 'translateX(0)'
              }}
            />
            <div className="relative flex gap-2">
              <button
                onClick={() => setActiveTab('etudiant')}
                className={`flex-1 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === 'etudiant' 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  Étudiant
                </span>
              </button>
              <button
                onClick={() => setActiveTab('entreprise')}
                className={`flex-1 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === 'entreprise' 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Entreprise
                </span>
              </button>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-8">
            <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 group">
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-semibold text-gray-700 group-hover:text-gray-900">Continuer avec Google</span>
            </button>
            
            <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gray-900 border-2 border-gray-900 rounded-xl hover:bg-gray-800 hover:border-gray-800 transition-all duration-200 group">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="font-semibold text-white">Continuer avec GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Ou avec votre email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Mot de passe
                </label>
                <Link 
                  href="#" 
                  className="text-sm font-semibold text-primary hover:text-primary-container transition-colors"
                >
                  Mot de passe oublié?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary/20 transition-all"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 font-medium">
                Se souvenir de moi pendant 30 jours
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary via-primary-container to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connexion en cours...</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Se connecter
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link href="/signup" className="font-bold text-primary hover:text-primary-container transition-colors">
              Créer un compte gratuitement
            </Link>
          </p>

          {/* Footer Links */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">Confidentialité</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-gray-700 transition-colors">Conditions</Link>
            <span>•</span>
            <Link href="/help" className="hover:text-gray-700 transition-colors">Aide</Link>
          </div>
        </div>
      </div>

      {/* Right Side - Visual Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary-container to-secondary overflow-hidden">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(white 1px, transparent 1px),
              linear-gradient(90deg, white 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Floating Shapes */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-[float_20s_ease-in-out_infinite]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center w-full p-16 text-white">
          <div className="max-w-xl space-y-10">
            {/* Main Heading */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-semibold">Plus de 15K stages disponibles</span>
              </div>
              <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Trouvez le stage de vos rêves
                </h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Connectez-vous avec les meilleures entreprises tech et accélérez votre carrière grâce à notre plateforme alimentée par l'IA.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
              {[
                { Icon: Target, title: 'Matching Intelligent', desc: 'Notre IA analyse vos compétences et trouve les opportunités parfaites' },
                { Icon: Rocket, title: "Mentors d'Elite", desc: "Bénéficiez de l'accompagnement d'experts reconnus dans l'industrie" },
                { Icon: Star, title: 'Suivi en Temps Réel', desc: 'Suivez votre progression et recevez des feedbacks personnalisés' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ translateY: -6 }}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 cursor-pointer group"
                >
                  <div className="text-white/90 p-2 rounded-lg bg-white/5 group-hover:bg-white/8 transition-colors">
                    <feature.Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/20">
              <div>
                <div className="text-4xl font-bold mb-1">15K+</div>
                <div className="text-sm text-white/80">Stages actifs</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">2.4K+</div>
                <div className="text-sm text-white/80">Entreprises</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">98%</div>
                <div className="text-sm text-white/80">Satisfaction</div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-10 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-white/90" />
                </div>
                <div className="flex-1">
                  <p className="text-white/90 italic mb-3">
                    "NexusIntern m'a aidé à décrocher un stage chez Google en moins de 2 semaines. L'interface est intuitive et le matching par IA est impressionnant!"
                  </p>
                  <div>
                    <div className="font-semibold">Sarah M.</div>
                    <div className="text-sm text-white/70">Étudiante en Informatique, Paris</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="absolute bottom-8 left-16 text-white/60 text-sm">
          © 2026 NexusIntern. Tous droits réservés.
        </div>
      </div>
    </div>
  );
}
