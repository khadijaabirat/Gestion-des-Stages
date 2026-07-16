import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BackgroundEffects from '@/components/ui/BackgroundEffects';
import ThemeProvider from '@/components/providers/ThemeProvider';
import PWAInstallPrompt from '@/components/ui/PWAInstallPrompt';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: 'NexusIntern | Plateforme mondiale de stages 2026',
  description: 'Accélérez votre ascension professionnelle avec notre plateforme de stages de nouvelle génération',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NexusIntern',
  },
};

export const viewport = {
  themeColor: '#5644d0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="light">
      <body className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable} bg-background text-on-background min-h-screen flex flex-col font-sans antialiased selection:bg-primary-container selection:text-on-primary-container relative`}>
        <ThemeProvider>
          <BackgroundEffects />
          <Navbar />
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'font-sans text-sm rounded-xl border border-outline-variant/30 shadow-lg',
              style: {
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                color: '#1a1a1a',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <PWAInstallPrompt />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
