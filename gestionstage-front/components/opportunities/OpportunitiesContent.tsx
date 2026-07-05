'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';



import SearchBar from './filters/SearchBar';
import OpportunityCard from './cards/OpportunityCard';
import MapWidget from './cards/MapWidget';
import StatsWidget from './cards/StatsWidget';

// Mock data
const opportunities = [
  {
    id: 1,
    title: 'Product Designer Junior',
    company: 'TechNova Studio',
    location: 'Paris, 75',
    duration: '6 mois',
    salary: '1200â‚¬/mois',
    isNew: true,
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    featured: true,
  },
  {
    id: 2,
    title: 'Développeur Frontend React',
    company: 'EcoFlow Solutions',
    location: 'Lyon / Remote',
    duration: '4-6 mois',
    salary: null,
    isNew: false,
    logo: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100&h=100&fit=crop',
    featured: false,
  },
  {
    id: 3,
    title: 'Data Analyst Stagiaire',
    company: 'FinanceTech Hub',
    location: 'Bordeaux',
    duration: '6 mois',
    salary: null,
    isNew: false,
    logo: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=100&h=100&fit=crop',
    featured: false,
  },
];

export default function OpportunitiesContent() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlowOpacity, setCursorGlowOpacity] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [savedOpportunities, setSavedOpportunities] = useState<Set<number>>(new Set());

  // Smooth mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 300 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 300 });

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

  const toggleSave = (id: number) => {
    setSavedOpportunities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-background">
      {/* Cursor Follow Glow Effect */}
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l20 20-20 20L0 20z' fill='%23a53b22' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
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

      {/* Navigation */}
      
      
      

      {/* Main Content */}
      <main className="w-full pt-24 md:pt-10 p-4 md:p-10 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-background mb-2 font-heading tracking-tight">
              Explorez l&apos;avenir.{' '}
              <span className="text-primary">Trouvez votre stage.</span>
            </h1>
          </motion.header>

          {/* Search Bar */}
          <SearchBar />

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-8">
            {/* Left Column */}
            <div className="md:col-span-4 flex flex-col gap-5">
              <MapWidget />
              <StatsWidget />
            </div>

            {/* Right Column - Results */}
            <div className="md:col-span-8 flex flex-col gap-5">
              {/* Results Header */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-between items-center"
              >
                <h3 className="text-2xl font-bold text-on-surface">
                  Résultats <span className="text-primary">(142)</span>
                </h3>
                
                <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                  <span>Trier par:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 cursor-pointer font-semibold text-primary outline-none"
                  >
                    <option value="relevance">Pertinence</option>
                    <option value="recent">Récent</option>
                    <option value="salary">Salaire</option>
                  </select>
                </div>
              </motion.div>

              {/* Opportunity Cards */}
              <div className="flex flex-col gap-4">
                {opportunities.map((opportunity, index) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    index={index}
                    isSaved={savedOpportunities.has(opportunity.id)}
                    onToggleSave={() => toggleSave(opportunity.id)}
                  />
                ))}
              </div>

              {/* Load More */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center mt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-surface-container-high text-on-surface font-semibold px-8 py-3 rounded-full hover:bg-white/80 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  Charger plus d&apos;offres
                  <motion.svg
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

