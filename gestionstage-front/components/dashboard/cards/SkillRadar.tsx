'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function SkillRadar({ skills = [] }: { skills?: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Display actual student skills only
  const allSkills = skills && skills.length > 0 
    ? skills.map(s => s.nom)
    : [];

  // Limit to 11 to prevent overcrowding but allow more skills
  const displaySkills = allSkills.slice(0, 11);
  const extraCount = allSkills.length > 11 ? allSkills.length - 11 : 0;

  // Nicely distributed positions (center, corners, edges)
  const POSITIONS = [
    { x: 0, y: 0 },         // Center
    { x: -90, y: -45 },     // Top-left
    { x: 90, y: 35 },       // Bottom-right
    { x: -60, y: 50 },      // Bottom-left
    { x: 70, y: -50 },      // Top-right
    { x: -110, y: 10 },     // Far-left
    { x: 110, y: -15 },     // Far-right
    { x: -30, y: -70 },     // Top-mid-left
    { x: 30, y: 70 },       // Bottom-mid-right
    { x: 130, y: 40 },      // Far-bottom-right
    { x: -130, y: -30 },    // Far-top-left
  ];

  // 3D Mouse tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="col-span-1 md:col-span-4"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="glass-panel rounded-3xl p-6 h-full flex flex-col items-center justify-center relative shadow-xl hover:shadow-[0_20px_50px_rgba(165,59,34,0.2)] transition-shadow duration-500 bg-gradient-to-br from-white/60 to-white/30 border border-white/60"
      >
        <motion.div
          style={{ transform: "translateZ(30px)" }}
          className="absolute top-6 left-6"
        >
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">psychology</span>
            Mes Compétences
          </h3>
        </motion.div>

        <div 
          className="relative w-full h-64 flex items-center justify-center mt-4"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Animated Glowing Orb in the center */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-32 h-32 rounded-full bg-primary/20 blur-2xl pointer-events-none"
            style={{ transform: "translateZ(-20px)" }}
          />

          {displaySkills.map((skill, i) => {
            const pos = POSITIONS[i % POSITIONS.length];
            
            // Spread positions across the container space
            const baseX = pos.x; 
            const baseY = pos.y;  
            const baseZ = (i % 2 === 0 ? 1 : -1) * (10 + i * 15); // Staggered depth
            
            // Movement amplitudes for "swimming" effect
            const floatX = (i % 3 === 0 ? 1 : -1) * 15;
            const floatY = (i % 2 === 0 ? 1 : -1) * 15;
            const floatZ = (i % 2 === 0 ? -1 : 1) * 20;
            const floatRotate = (i % 2 === 0 ? 1 : -1) * 8;
            
            const duration = 5 + (i % 3) * 2; // Different speeds (5s, 7s, 9s)

            return (
              <motion.div
                key={`${skill}-${i}`}
                className="absolute flex items-center justify-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: [baseX, baseX + floatX, baseX],
                  y: [baseY, baseY + floatY, baseY],
                  z: [baseZ, baseZ + floatZ, baseZ],
                  rotate: [0, floatRotate, 0],
                }}
                transition={{ 
                  opacity: { duration: 0.8, delay: i * 0.1 },
                  scale: { duration: 0.8, delay: i * 0.1, type: 'spring' },
                  x: { duration, repeat: Infinity, ease: 'easeInOut' },
                  y: { duration: duration * 1.2, repeat: Infinity, ease: 'easeInOut' },
                  z: { duration: duration * 1.1, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: duration * 1.3, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <motion.div
                  className="px-4 py-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 shadow-xl text-sm font-extrabold text-primary whitespace-nowrap cursor-pointer transition-colors"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                  whileHover={{ scale: 1.15, backgroundColor: '#a53b22', color: 'white', borderColor: '#a53b22' }}
                >
                  {skill}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {displaySkills.length === 0 && (
          <motion.div 
            style={{ transform: "translateZ(20px)" }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
          >
            <span className="material-symbols-outlined text-4xl text-outline/30 mb-2">psychology_alt</span>
            <p className="text-sm font-medium text-on-surface-variant">Aucune compétence ajoutée.</p>
            <p className="text-xs text-outline mt-1">Allez dans votre profil pour ajouter vos véritables compétences.</p>
          </motion.div>
        )}

        {extraCount > 0 && (
          <motion.p 
            style={{ transform: "translateZ(30px)" }}
            className="absolute bottom-6 right-6 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full"
          >
            +{extraCount} autres compétences
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
