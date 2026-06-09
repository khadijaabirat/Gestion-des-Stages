'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-xl overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3 spring-interactive w-fit">
              <div className="relative w-8 h-8">
                <Image src="https://lh3.googleusercontent.com/aida/AP1WRLtoBe83MV4uPcTC700HqsMPCobUTtsEIGLRFp7N5U7oiDduHSH0rWXB_pRwZ2iEXRspGxF4NDN4IbMicMBcq5ikn0mbHNS_2wGFc_XawQVPwT6COKCS2mAupV8zkG65BxTkzkXQ82cGKd5aWcF6B_Iss6pLB0z7WN273P3NwldH5PvHi4dcqIxmh6wV09iMDdhY-gSH9EWhMcWsC2p1eIPHjWPbwF3W_R_AVzGnyQRDb_OXt_rRAFRLsg" alt="NexusIntern" fill className="object-contain" />
              </div>
              <span className="font-heading text-xl tracking-tight text-primary font-bold">NexusIntern</span>
            </Link>
            <p className="text-sm text-on-surface-variant max-w-xs">
              Propulsez votre carrière vers de nouveaux sommets grâce à l&apos;IA. La plateforme mondiale de stages nouvelle génération.
            </p>
          </div>

          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-xs text-on-surface uppercase tracking-widest">Plateforme</h4>
              <ul className="flex flex-col gap-2">
                <li><Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Explorer</Link></li>
                <li><Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Entreprises</Link></li>
                <li><Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Mentors</Link></li>
                <li><Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Tarifs</Link></li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-xs text-on-surface uppercase tracking-widest">Ressources</h4>
              <ul className="flex flex-col gap-2">
                <li><Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Centre d&apos;aide</Link></li>
                <li><Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Guides Carrière</Link></li>
                <li><Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Success Stories</Link></li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-xs text-on-surface uppercase tracking-widest">Légal</h4>
              <ul className="flex flex-col gap-2">
                <li><Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Confidentialité</Link></li>
                <li><Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Conditions</Link></li>
                <li><Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-on-surface-variant/60">
            © 2026 NexusIntern. Tous droits réservés.
          </p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 text-xs font-mono text-primary hover:text-secondary transition-colors group">
            RETOUR EN HAUT <span className="group-hover:-translate-y-1 transition-transform">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
