'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';



import WelcomeHero from './cards/WelcomeHero';
import SkillRadar from './cards/SkillRadar';
import UpcomingEvents from './cards/UpcomingEvents';
import MotivationQuote from './cards/MotivationQuote';
import ActivityFeed from './cards/ActivityFeed';
import QuickActions from './cards/QuickActions';
import { apiFetch } from '@/lib/api';

export default function DashboardContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Backend Data State
  const [userData, setUserData] = useState<any>(null);
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Smooth mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 300 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 300 });

  // Fetch Backend Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, candidaturesRes] = await Promise.all([
          apiFetch('/profil'),
          apiFetch('/candidatures')
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserData(profileData.data);
        }
        
        if (candidaturesRes.ok) {
          const candidaturesData = await candidaturesRes.json();
          const candidaturesArray = candidaturesData.data?.data || candidaturesData.data || candidaturesData;
          setCandidatures(Array.isArray(candidaturesArray) ? candidaturesArray : []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mouse follow glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setMousePosition({ x: e.clientX, y: e.clientY });
      setCursorGlowOpacity(1);
    };

    const handleMouseLeave = () => {
      setCursorGlowOpacity(0);
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-background">
      {/* Cursor Follow Glow Effect - Enhanced */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-500 mix-blend-multiply"
        style={{
          opacity: cursorGlowOpacity,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,126,95, 0.1), transparent 70%)`
        }}
      />

      {/* Animated Background Pattern with Parallax */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L100 50L50 100L0 50Z' fill='none' stroke='%23a53b22' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '50px 50px',
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      />

      {/* Floating Ambient Gradients */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(165,59,34, 0.12) 0%, rgba(250, 248, 255, 0) 70%)',
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, delay: 2, ease: 'easeInOut' }}
        className="fixed bottom-0 right-0 w-[700px] h-[700px] rounded-full blur-3xl pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(86, 68, 208, 0.1) 0%, rgba(250, 248, 255, 0) 70%)',
        }}
      />

      {/* Floating Particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 20 - 10, 0],
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: 'easeInOut',
          }}
          className="fixed w-16 h-16 rounded-full pointer-events-none z-0 opacity-20 blur-sm"
          style={{
            background: `linear-gradient(135deg, rgba(165,59,34,0.3), rgba(86,68,208,0.3))`,
            top: `${20 + i * 15}%`,
            left: `${10 + i * 18}%`,
          }}
        />
      ))}

      {/* Navigation */}
      
      
      

      {/* Main Content */}
      <main className="w-full pt-24 md:pt-10 p-4 md:p-10 pb-24 relative z-10">

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {loading ? (
            <div className="col-span-1 md:col-span-12 flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <WelcomeHero user={userData} />
              <SkillRadar skills={userData?.skills || []} />
              <UpcomingEvents candidatures={candidatures} />
              <MotivationQuote />
              <ActivityFeed candidatures={candidatures} />
              <QuickActions />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

