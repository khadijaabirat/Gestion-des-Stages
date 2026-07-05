'use client';

import { useEffect, useRef } from 'react';

const WORDS = [
  'Internship', 'Paris', 'New York', 'Google', 'Microsoft', 'Remote', 
  'Students', 'Data Science', 'Software', 'London', 'Talent', 'Innovation', 
  'Startups', 'Global', 'Tech', 'Finance', 'Design', 'Marketing',
  'Networking', 'Success', 'Opportunities', 'Growth', 'Berlin', 'Tokyo'
];

export default function WordSphere() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Constants for sphere
    const radius = 180;
    const size = WORDS.length;
    let items: { el: HTMLSpanElement; x: number; y: number; z: number }[] = [];

    // Initialize words
    WORDS.forEach((word, i) => {
      const span = document.createElement('span');
      span.innerText = word;
      span.className = 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-on-background whitespace-nowrap transition-colors duration-300 hover:text-primary cursor-pointer';
      
      // Fibonacci sphere distribution
      const phi = Math.acos(-1 + (2 * i) / size);
      const theta = Math.sqrt(size * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      items.push({ el: span, x, y, z });
      container.appendChild(span);
    });

    let animationFrameId: number;
    let angleX = 0.002;
    let angleY = 0.002;

    const updatePositions = () => {
      const sinX = Math.sin(angleX);
      const cosX = Math.cos(angleX);
      const sinY = Math.sin(angleY);
      const cosY = Math.cos(angleY);

      items.forEach(item => {
        // Rotate around X axis
        let y1 = item.y * cosX - item.z * sinX;
        let z1 = item.z * cosX + item.y * sinX;

        // Rotate around Y axis
        let x1 = item.x * cosY + z1 * sinY;
        let z2 = z1 * cosY - item.x * sinY;

        item.x = x1;
        item.y = y1;
        item.z = z2;

        // Projection
        const scale = 300 / (300 - item.z);
        const alpha = (item.z + radius) / (2 * radius);
        
        item.el.style.transform = `translate3d(-50%, -50%, 0) translate3d(${item.x}px, ${item.y}px, 0) scale(${scale})`;
        item.el.style.opacity = Math.max(0.1, alpha).toString();
        item.el.style.zIndex = Math.floor(scale * 100).toString();
        // Dynamic blur based on depth
        const blur = Math.max(0, (1 - alpha) * 4);
        item.el.style.filter = `blur(${blur}px)`;
        
        // Highlight front words
        if (alpha > 0.8) {
          item.el.style.color = 'var(--primary)';
        } else if (alpha > 0.5) {
          item.el.style.color = 'var(--on-surface)';
        } else {
          item.el.style.color = 'var(--on-surface-variant)';
        }
      });

      animationFrameId = requestAnimationFrame(updatePositions);
    };

    updatePositions();

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      angleY = (x / rect.width) * 0.02;
      angleX = -(y / rect.height) * 0.02;
    };

    container.addEventListener('mousemove', handleMouseMove);
    const handleMouseLeave = () => {
      angleX = 0.002;
      angleY = 0.002;
    };
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      // Cleanup DOM
      items.forEach(item => {
        if (container.contains(item.el)) {
          container.removeChild(item.el);
        }
      });
    };
  }, []);

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center perspective-1000">
      {/* Background ambient glow */}
      <div className="absolute w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
      
      {/* Container for the 3D sphere */}
      <div 
        ref={containerRef} 
        className="relative w-full h-full transform-style-3d cursor-crosshair"
      />
    </div>
  );
}
