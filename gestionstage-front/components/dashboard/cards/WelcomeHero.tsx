'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function WelcomeHero({ user }: { user?: any }) {
  const router = useRouter();
  // Calculate profile completion based on available data
  const calculateCompletion = () => {
    if (!user) return 0;
    let score = 0;
    if (user.nom) score += 20;
    if (user.email) score += 20;
    if (user.filiere) score += 20;
    if (user.niveau_etude) score += 20;
    if (user.skills && user.skills.length > 0) score += 10;
    if (user.experiences && user.experiences.length > 0) score += 10;
    return score;
  };

  const completion = calculateCompletion();
  const firstName = user?.nom ? user.nom.split(' ')[0] : 'Étudiant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -4,
        scale: 1.005,
        transition: { duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }
      }}
      className="col-span-1 md:col-span-8 glass-panel rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500"
    >
      {/* Shimmer Effect */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'linear' }}
        className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none transform -skew-x-12"
      />

      <div className="relative z-10">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-2xl font-bold text-on-surface mb-2"
        >
          Bonjour, {firstName} !
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-on-surface-variant max-w-md mb-6"
        >
          {completion === 100 
            ? "Votre profil est complet à 100% ! Vous êtes prêt à postuler." 
            : "Vous faites d'excellents progrès. Complétez votre profil pour débloquer des offres de stage premium."}
        </motion.p>

        <motion.button
          onClick={() => router.push('/etudiant/profile')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-full bg-surface-container text-primary font-semibold hover:bg-primary hover:text-on-primary transition-all relative overflow-hidden group shadow-md hover:shadow-lg"
        >
          <span className="relative z-10">{completion === 100 ? 'Voir mon profil' : 'Compléter le profil'}</span>
          <motion.div
            className="absolute inset-0 bg-primary"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            style={{ originX: 0 }}
          />
        </motion.button>
      </div>

      {/* Progress Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.6, duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-32 h-32 mt-6 md:mt-0 flex items-center justify-center"
      >
        {/* Floating Animation */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-full h-full"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-container to-surface-variant shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.1),_10px_10px_20px_rgba(165,59,34,0.1)] opacity-60" />

          {/* SVG Progress Ring */}
          <svg className="absolute inset-0 w-full h-full drop-shadow-lg z-10 -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-white/40"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <motion.path
              className="text-primary"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2.5"
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: `${completion} 100` }}
              transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-2 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center z-20 shadow-inner">
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.5, type: 'spring', stiffness: 200 }}
              className="text-2xl font-extrabold text-primary"
            >
              {completion}%
            </motion.span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
