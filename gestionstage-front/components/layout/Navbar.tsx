'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 glass-navbar transition-all duration-500 ${scrolled ? 'h-16 shadow-lg' : 'h-20 shadow-md'}`}>
      <div className="flex justify-between items-center h-full px-6 lg:px-12 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 spring-interactive">
          <div className="relative w-10 h-10">
            <Image src="https://lh3.googleusercontent.com/aida/AP1WRLtoBe83MV4uPcTC700HqsMPCobUTtsEIGLRFp7N5U7oiDduHSH0rWXB_pRwZ2iEXRspGxF4NDN4IbMicMBcq5ikn0mbHNS_2wGFc_XawQVPwT6COKCS2mAupV8zkG65BxTkzkXQ82cGKd5aWcF6B_Iss6pLB0z7WN273P3NwldH5PvHi4dcqIxmh6wV09iMDdhY-gSH9EWhMcWsC2p1eIPHjWPbwF3W_R_AVzGnyQRDb_OXt_rRAFRLsg" alt="NexusIntern" fill className="object-contain" />
          </div>
          <span className="font-heading text-2xl tracking-tight text-primary font-bold">NexusIntern</span>
        </Link>

        <nav className="hidden md:flex gap-8 items-center">
          <Link href="#" className="text-primary font-bold border-b-2 border-primary pb-1 transition-all hover:-translate-y-0.5">Opportunités</Link>
          <Link href="#" className="text-on-surface-variant/80 hover:text-primary transition-all hover:-translate-y-0.5 pb-1">Candidatures</Link>
          <Link href="#" className="text-on-surface-variant/80 hover:text-primary transition-all hover:-translate-y-0.5 pb-1">Mentors</Link>
          <Link href="#" className="text-on-surface-variant/80 hover:text-primary transition-all hover:-translate-y-0.5 pb-1">Aperçus</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="bg-gradient-to-r from-primary to-tertiary text-on-primary font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-full spring-interactive shadow-lg shadow-primary/30">
            Publier un stage
          </button>
        </div>
      </div>
    </header>
  );
}
