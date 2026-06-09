'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, School, Building2, Briefcase, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

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
    sector: '',
    password: '',
    terms: false,
  });
  const [validFields, setValidFields] = useState<Set<string>>(new Set());

  const handleBlur = (field: string, value: string) => {
    if (value.trim()) {
      setValidFields(prev => new Set(prev).add(field));
    } else {
      setValidFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { role, ...formData });
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2.5L22.5 16 25 13.5V0h2v13.5L29.5 16l2.5-2.5V0h2v11.5l2.5-2.5 2.5-2.5h1V8h-1l-2.5 2.5L34 13l-2.5 2.5v2.5H40v2h-8.5v2.5L29 25l-2.5 2.5V40h-2V27.5L22 25l-2.5 2.5V40h-2V29.5L15 32l-2.5 2.5v2.5H0v-2h10v-2.5L12.5 30 15 27.5V14h2v13.5L19.5 29l2.5-2.5v-2.5L20 20.5z' fill='%23a53b22' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />
      
      {/* Gradient Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-3xl"
      />
      
      {/* Floating Shapes */}
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute top-20 left-[10%] w-24 h-24 bg-gradient-to-br from-primary/10 to-tertiary/10 rounded-2xl backdrop-blur-sm border border-white/20"
      />
      <motion.div
        animate={{ y: [0, -40, 0], rotate: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, delay: -5 }}
        className="absolute bottom-32 right-[8%] w-32 h-32 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-full backdrop-blur-sm border border-white/20"
      />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[500px] relative z-10"
      >
        {/* Logo & Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-primary tracking-tight mb-2">
            NexusIntern
          </h1>
          <p className="text-on-surface-variant">Propulsez votre avenir professionnel.</p>
        </motion.div>

        {/* Glass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass-panel rounded-2xl p-8 relative overflow-hidden shadow-2xl"
        >
          {/* Corner Accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-[60px] pointer-events-none" />

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-on-background mb-1">Créer un compte</h2>
            <p className="text-sm text-on-surface-variant">
              Rejoignez la plateforme qui connecte talents et opportunités.
            </p>
          </motion.div>

          {/* Role Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-surface-container-high p-1 rounded-xl flex mb-8 shadow-inner"
          >
            <motion.div
              animate={{ x: role === 'company' ? '100%' : '0%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-md"
            />
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase z-10 rounded-lg transition-colors ${
                role === 'student' ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              Étudiant
            </button>
            <button
              type="button"
              onClick={() => setRole('company')}
              className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase z-10 rounded-lg transition-colors ${
                role === 'company' ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              Entreprise
            </button>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {role === 'student' ? (
                <motion.div
                  key="student"
                  initial={{ opacity: 0, rotateX: 15, y: -20 }}
                  animate={{ opacity: 1, rotateX: 0, y: 0 }}
                  exit={{ opacity: 0, rotateX: -15, y: 20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-5"
                >
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Prénom"
                      placeholder="Jean"
                      value={formData.firstName}
                      onChange={(v) => setFormData({ ...formData, firstName: v })}
                      onBlur={(v) => handleBlur('firstName', v)}
                      isValid={validFields.has('firstName')}
                    />
                    <InputField
                      label="Nom"
                      placeholder="Dupont"
                      value={formData.lastName}
                      onChange={(v) => setFormData({ ...formData, lastName: v })}
                      onBlur={(v) => handleBlur('lastName', v)}
                      isValid={validFields.has('lastName')}
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
                  />
                  
                  <InputField
                    label="École / Université"
                    placeholder="Université de Paris"
                    icon={<School className="w-5 h-5" />}
                    value={formData.school}
                    onChange={(v) => setFormData({ ...formData, school: v })}
                    onBlur={(v) => handleBlur('school', v)}
                    isValid={validFields.has('school')}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="company"
                  initial={{ opacity: 0, rotateX: 15, y: -20 }}
                  animate={{ opacity: 1, rotateX: 0, y: 0 }}
                  exit={{ opacity: 0, rotateX: -15, y: 20 }}
                  transition={{ duration: 0.4 }}
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
                  />
                  
                  <SelectField
                    label="Secteur d'activité"
                    value={formData.sector}
                    onChange={(v) => {
                      setFormData({ ...formData, sector: v });
                      handleBlur('sector', v);
                    }}
                    isValid={validFields.has('sector')}
                    options={[
                      { value: '', label: 'Sélectionnez un secteur' },
                      { value: 'it', label: "Technologies de l'Information" },
                      { value: 'finance', label: 'Banque & Finance' },
                      { value: 'health', label: 'Santé & Pharmacie' },
                      { value: 'retail', label: 'Commerce & Distribution' },
                      { value: 'other', label: 'Autre' },
                    ]}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <div className="relative pt-2">
              <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                Mot de passe
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50 transition-colors group-focus-within:text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onBlur={(e) => handleBlur('password', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-surface-container-lowest border rounded-lg pl-11 pr-11 py-3.5 text-on-background placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all ${
                    validFields.has('password') ? 'border-secondary' : 'border-outline-variant'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-variant"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {validFields.has('password') && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-12 top-1/2 -translate-y-1/2"
                  >
                    <Check className="w-5 h-5 text-secondary" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-start gap-3 pt-2"
            >
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest cursor-pointer transition-transform hover:scale-110"
                />
              </div>
              <label htmlFor="terms" className="text-sm text-on-surface-variant cursor-pointer leading-tight">
                J'accepte les{' '}
                <Link href="#" className="text-secondary font-semibold hover:underline">
                  Conditions Générales
                </Link>{' '}
                et la{' '}
                <Link href="#" className="text-secondary font-semibold hover:underline">
                  Politique de Confidentialité
                </Link>
                .
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary via-tertiary to-secondary text-white font-semibold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group mt-6 hover:shadow-xl hover:shadow-primary/40 transition-shadow"
            >
              Rejoindre NexusIntern
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center border-t border-outline-variant/30 pt-6"
          >
            <p className="text-sm text-on-surface-variant">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline transition-colors">
                Se connecter
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Input Field Component
function InputField({
  label,
  type = 'text',
  placeholder,
  icon,
  value,
  onChange,
  onBlur,
  isValid,
}: {
  label: string;
  type?: string;
  placeholder: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  onBlur: (value: string) => void;
  isValid: boolean;
}) {
  return (
    <div className="relative">
      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 transition-colors group-focus-within:text-secondary">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-surface-container-lowest border rounded-lg ${
            icon ? 'pl-11' : 'pl-4'
          } pr-11 py-3.5 text-on-background placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all ${
            isValid ? 'border-secondary' : 'border-outline-variant'
          }`}
        />
        {isValid && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <Check className="w-5 h-5 text-secondary" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Select Field Component
function SelectField({
  label,
  value,
  onChange,
  isValid,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-surface-container-lowest border rounded-lg px-4 py-3.5 text-on-background focus:outline-none focus:ring-2 focus:ring-secondary/50 appearance-none transition-all ${
            isValid ? 'border-secondary' : 'border-outline-variant'
          }`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {isValid && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-10 top-1/2 -translate-y-1/2"
          >
            <Check className="w-5 h-5 text-secondary" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
