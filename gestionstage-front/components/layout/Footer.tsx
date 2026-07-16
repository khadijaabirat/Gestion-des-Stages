'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function Footer() {
  const pathname = usePathname();
  if (
    pathname === '/login' || 
    pathname === '/register' || 
    pathname.startsWith('/etudiant') || 
    pathname.startsWith('/entreprise') || 
    pathname.startsWith('/admin')
  ) return null;

  return (
    <footer className="relative z-10 mt-24 border-t border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-xl overflow-hidden">
      {/* Dynamic ambient background */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-48 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" 
      />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-12"
        >
          <motion.div variants={itemVariants} className="md:col-span-4 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3 spring-interactive group mb-6 w-fit">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-[14px] bg-gradient-to-br from-primary to-secondary overflow-hidden shadow-[0_8px_16px_rgba(255,126,95,0.2)] group-hover:shadow-[0_12px_24px_rgba(86,68,208,0.3)] transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3">
                <div className="absolute inset-[1.5px] bg-surface rounded-[12px] flex items-center justify-center z-10 transition-colors duration-300 group-hover:bg-surface-container-lowest">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform duration-500">
                      <path d="M6 4V20" stroke="url(#primaryGradientFooter)" strokeWidth="3" strokeLinecap="round" />
                      <path d="M18 10V20" stroke="url(#secondaryGradientFooter)" strokeWidth="3" strokeLinecap="round" />
                      <path d="M6 7L18 17" stroke="url(#tertiaryGradientFooter)" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="18" cy="5" r="3" fill="#5644d0" className="animate-pulse" />
                      <defs>
                        <linearGradient id="primaryGradientFooter" x1="6" y1="4" x2="6" y2="20" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#ff7e5f" />
                          <stop offset="1" stopColor="#ffb4a3" />
                        </linearGradient>
                        <linearGradient id="secondaryGradientFooter" x1="18" y1="10" x2="18" y2="20" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#5644d0" />
                          <stop offset="1" stopColor="#6f5fea" />
                        </linearGradient>
                        <linearGradient id="tertiaryGradientFooter" x1="6" y1="7" x2="18" y2="17" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#ff7e5f" />
                          <stop offset="1" stopColor="#5644d0" />
                        </linearGradient>
                      </defs>
                   </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-3xl tracking-tight text-on-background font-black group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary transition-all duration-300">NexusIntern</span>
              </div>
            </Link>
            <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
              Propulsez votre carrière vers de nouveaux sommets grâce à l&apos;IA. La plateforme mondiale de stages nouvelle génération.
            </p>
          </motion.div>

          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            <motion.div variants={itemVariants} className="flex flex-col gap-5">
              <h4 className="font-mono text-xs text-on-surface uppercase tracking-widest font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm bg-primary" /> Liens rapides
              </h4>
              <ul className="flex flex-col gap-3">
                {['Offres', 'Entreprises', 'À propos', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase().replace(' ', '').replace('à', 'a')}`} className="group flex items-center text-sm text-on-surface-variant hover:text-primary transition-colors">
                      <span className="w-0 h-px bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300 ease-out" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col gap-5">
              <h4 className="font-mono text-xs text-on-surface uppercase tracking-widest font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm bg-secondary" /> Légal
              </h4>
              <ul className="flex flex-col gap-3">
                {['Conditions d\'utilisation', 'Politique de confidentialité', 'Mentions légales'].map((item, i) => (
                  <li key={item}>
                    <Link href={`/legal-${i}`} className="group flex items-center text-sm text-on-surface-variant hover:text-primary transition-colors">
                      <span className="w-0 h-px bg-primary mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300 ease-out" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col gap-5">
              <h4 className="font-mono text-xs text-on-surface uppercase tracking-widest font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm bg-tertiary" /> Réseaux Sociaux
              </h4>
              <div className="flex items-center gap-3">
                <motion.a whileHover={{ y: -5, scale: 1.1 }} whileTap={{ scale: 0.9 }} href="#" className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-colors duration-300 shadow-sm hover:shadow-primary/30">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </motion.a>
                <motion.a whileHover={{ y: -5, scale: 1.1 }} whileTap={{ scale: 0.9 }} href="#" className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-colors duration-300 shadow-sm hover:shadow-primary/30">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </motion.a>
                <motion.a whileHover={{ y: -5, scale: 1.1 }} whileTap={{ scale: 0.9 }} href="#" className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-colors duration-300 shadow-sm hover:shadow-primary/30">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </motion.a>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-16 pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <p className="text-xs text-on-surface-variant/80 font-medium">
            © 2026 NexusIntern. Tous droits réservés.
          </p>
          <motion.button 
            whileHover={{ y: -3 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="flex items-center gap-2 text-xs font-mono font-bold text-primary hover:text-secondary transition-colors group px-4 py-2 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/10"
          >
            RETOUR EN HAUT <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-lg leading-none">→</motion.span>
          </motion.button>
        </motion.div>
      </div>
    </footer>
  );
}
