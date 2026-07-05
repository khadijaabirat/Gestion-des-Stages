'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface Skill {
  id: number;
  nom: string;
}

interface Experience {
  id: number;
  titre: string;
  entreprise: string;
  date_debut: string;
  date_fin?: string;
  description?: string;
}

interface StudentProfile {
  id: number;
  nom: string;
  role: string;
  filiere?: string;
  niveau_etude?: string;
  bio?: string;
  description?: string;
  telephone?: string;
  adresse?: string;
  photo?: string;
  site_web?: string;
  skills?: Skill[];
  experiences?: Experience[];
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const heroRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const heroMouseXSpring = useSpring(mouseX, { stiffness: 200, damping: 30 });
  const heroMouseYSpring = useSpring(mouseY, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch(`/users/${params.id}`);
        if (res.ok) {
          const json = await res.json();
          setProfile(json.data);
        } else {
          setError('Profil introuvable');
        }
      } catch (e) {
        setError('Erreur de connexion');
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) fetchProfile();

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [params.id, mouseX, mouseY]);

  const photoUrl = profile?.photo
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${profile.photo}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.nom || 'U')}&background=6366f1&color=fff&bold=true&size=200`;

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
        />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-background min-h-screen gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-5xl text-red-400">person_off</span>
        </motion.div>
        <h2 className="text-2xl font-bold font-heading text-on-surface">{error || 'Profil introuvable'}</h2>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-background text-on-background pb-24 md:pb-10">
      {/* Background Grid */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: `${mousePosition.x / 12}px ${mousePosition.y / 12}px`,
          transition: 'background-position 0.3s ease-out'
        }}
      />

      {/* Dynamic Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 mix-blend-multiply"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99,102,241, 0.06) 0%, transparent 60%)`
        }}
      />

      <main className="w-full p-4 md:p-10 relative z-10 flex flex-col max-w-[1000px] mx-auto gap-8">

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm group"
          >
            <motion.span
              className="material-symbols-outlined text-[20px]"
              whileHover={{ x: -5 }}
            >
              arrow_back
            </motion.span>
            <span className="group-hover:underline">Retour aux candidatures</span>
          </button>
        </motion.div>

        {/* Hero Profile Card */}
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_20px_60px_rgba(99,102,241,0.1)] rounded-3xl overflow-hidden relative"
        >
          {/* Hero Banner */}
          <div className="h-40 md:h-52 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 30%, white 1px, transparent 1px)',
              backgroundSize: '30px 30px, 20px 20px'
            }} />
            <motion.div
              className="absolute inset-0"
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                backgroundSize: '200% 200%'
              }}
            />
          </div>

          {/* Profile Info */}
          <div className="px-6 md:px-10 pb-8 -mt-16 md:-mt-20 relative z-10">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Photo */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
                className="w-28 h-28 md:w-36 md:h-36 rounded-3xl overflow-hidden border-4 border-white shadow-xl shrink-0 relative"
              >
                <img src={photoUrl} alt={profile.nom} className="w-full h-full object-cover" />
                {profile.photo && (
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-sm" />
                )}
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 pt-4 md:pt-8"
              >
                <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
                  {profile.nom}
                </h1>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">school</span>
                    {profile.role === 'etudiant' ? 'Étudiant' : profile.role}
                  </span>
                  {profile.filiere && (
                    <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-200 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">book</span>
                      {profile.filiere}
                    </span>
                  )}
                  {profile.niveau_etude && (
                    <span className="px-3 py-1.5 bg-pink-50 text-pink-700 rounded-full text-xs font-bold border border-pink-200 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span>
                      {profile.niveau_etude}
                    </span>
                  )}
                </div>
                {(profile.bio || profile.description) && (
                  <p className="mt-4 text-on-surface-variant leading-relaxed max-w-xl">
                    {profile.bio || profile.description}
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Contact Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm rounded-3xl p-6 hover:shadow-[0_10px_30px_rgba(99,102,241,0.08)] transition-shadow"
          >
            <h2 className="font-heading text-lg font-bold text-on-surface flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">contact_mail</span>
              </div>
              Informations de Contact
            </h2>
            <div className="space-y-4">
              {profile.telephone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined text-[18px]">phone</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Téléphone</p>
                    <p className="text-sm font-semibold text-on-surface">{profile.telephone}</p>
                  </div>
                </div>
              )}
              {profile.adresse && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Adresse</p>
                    <p className="text-sm font-semibold text-on-surface">{profile.adresse}</p>
                  </div>
                </div>
              )}
              {profile.site_web && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined text-[18px]">language</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Site Web</p>
                    <a href={profile.site_web} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">
                      {profile.site_web}
                    </a>
                  </div>
                </div>
              )}
              {!profile.telephone && !profile.adresse && !profile.site_web && (
                <div className="text-center py-6 text-on-surface-variant">
                  <span className="material-symbols-outlined text-3xl opacity-30 mb-2 block">info</span>
                  <p className="text-sm">Aucune information de contact disponible</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Skills Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm rounded-3xl p-6 hover:shadow-[0_10px_30px_rgba(99,102,241,0.08)] transition-shadow"
          >
            <h2 className="font-heading text-lg font-bold text-on-surface flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-[18px]">psychology</span>
              </div>
              Compétences
            </h2>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <motion.span
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-100 hover:border-indigo-300 hover:shadow-sm transition-all cursor-default"
                  >
                    {skill.nom}
                  </motion.span>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl opacity-30 mb-2 block">lightbulb</span>
                <p className="text-sm">Aucune compétence renseignée</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Experiences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm rounded-3xl p-6 hover:shadow-[0_10px_30px_rgba(99,102,241,0.08)] transition-shadow"
        >
          <h2 className="font-heading text-lg font-bold text-on-surface flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">work_history</span>
            </div>
            Expériences
          </h2>
          {profile.experiences && profile.experiences.length > 0 ? (
            <div className="space-y-4">
              {profile.experiences.map((exp, i) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex gap-4 group"
                >
                  {/* Timeline */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-3 h-3 rounded-full bg-indigo-400 border-2 border-indigo-200 shadow-sm group-hover:scale-125 transition-transform" />
                    {i < profile.experiences!.length - 1 && (
                      <div className="w-0.5 flex-1 bg-indigo-100 mt-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="bg-surface-container-lowest/50 border border-outline-variant/20 rounded-2xl p-4 flex-1 group-hover:border-indigo-200 transition-colors mb-2">
                    <h3 className="font-bold text-on-surface">{exp.titre}</h3>
                    <p className="text-sm text-indigo-600 font-medium">{exp.entreprise}</p>
                    <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">date_range</span>
                      {new Date(exp.date_debut).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                      {' — '}
                      {exp.date_fin
                        ? new Date(exp.date_fin).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                        : "En cours"}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl opacity-20 mb-2 block">work_off</span>
              <p className="text-sm font-medium">Aucune expérience renseignée</p>
            </div>
          )}
        </motion.div>

      </main>
    </div>
  );
}
