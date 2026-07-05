'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import { CheckCircle, LayoutDashboard, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ConfirmationContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const springConfig = { damping: 50, stiffness: 300 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden bg-[#faf8ff]">
      {/* Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,126,95,0.1), transparent 40%)`,
        }}
      />

      {/* Zellige Pattern */}
      <div className="fixed inset-0 opacity-100 z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z' fill='%23a53b22' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      }} />

      {/* Radial Glow */}
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(165,59,34, 0.15) 0%, rgba(250, 248, 255, 0) 70%)',
      }} />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-10 w-full max-w-[1440px] mx-auto relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
          className="glass-card rounded-2xl w-full max-w-2xl p-8 md:p-12 text-center flex flex-col items-center gap-8"
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 8px 32px 0 rgba(165,59,34, 0.05)',
          }}
        >
          {/* Success Icon */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-32 h-32 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-[#a53b22]/20 rounded-full blur-xl" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#a53b22] to-[#7f5600] rounded-full flex items-center justify-center text-white shadow-lg">
              <CheckCircle size={64} className="fill-current" />
            </div>
          </motion.div>

          {/* Typography */}
          <div className="flex flex-col gap-4">
            <h1 className="text-[32px] md:text-[48px] font-[800] leading-[1.2] md:leading-[1.1] tracking-[-0.02em] text-[#a53b22]">
              Candidature envoyée !
            </h1>
            <p className="text-[16px] leading-[1.6] text-[#57423d] max-w-lg mx-auto">
              Votre candidature pour{' '}
              <span className="font-bold text-[#131b2e]">Data Scientist Intern</span> a été
              transmise avec succès à{' '}
              <span className="font-bold text-[#131b2e]">TechCorp Inc.</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
            <Link
              href="/etudiant/dashboard"
              className="group px-6 py-3 rounded-lg bg-gradient-to-r from-[#a53b22] to-[#7f5600] text-white font-[600] text-[12px] uppercase tracking-[0.05em] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={18} className="group-hover:rotate-12 transition-transform duration-300" />
              Retour au Dashboard
            </Link>
            <Link
              href="/etudiant/applications"
              className="group px-6 py-3 rounded-lg bg-[#faf8ff] border border-[#8b716b]/30 text-[#a53b22] font-[600] text-[12px] uppercase tracking-[0.05em] hover:bg-[#eaedff] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FileText size={18} className="group-hover:scale-110 transition-transform duration-300" />
              Voir mes candidatures
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-white border-t border-[#8b716b]/30 flex flex-col md:flex-row justify-between items-center px-10 md:px-10 py-8 max-w-[1440px] mx-auto z-10 relative">
        <div className="text-[24px] font-[700] leading-[1.3] text-[#131b2e] mb-4 md:mb-0">
          Â© 2026 NexusIntern. Built for the future of work.
        </div>
        <div className="flex gap-6">
          <Link href="#" className="text-[#57423d] hover:text-[#a53b22] text-[14px] leading-[1.5] transition-opacity duration-200 hover:opacity-80">
            Privacy Policy
          </Link>
          <Link href="#" className="text-[#57423d] hover:text-[#a53b22] text-[14px] leading-[1.5] transition-opacity duration-200 hover:opacity-80">
            Terms of Service
          </Link>
          <Link href="#" className="text-[#57423d] hover:text-[#a53b22] text-[14px] leading-[1.5] transition-opacity duration-200 hover:opacity-80">
            Cookie Policy
          </Link>
          <Link href="#" className="text-[#57423d] hover:text-[#a53b22] text-[14px] leading-[1.5] transition-opacity duration-200 hover:opacity-80">
            Global Careers
          </Link>
        </div>
      </footer>
    </div>
  );
}

