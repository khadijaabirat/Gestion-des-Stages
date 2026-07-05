'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { useTheme } from 'next-themes';
import { GraduationCap } from 'lucide-react';

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

/* ─── Earth with HD texture ──────────────────────────────────────────── */

function Earth({ earthRef, isLight }: { earthRef: React.RefObject<THREE.Mesh>, isLight: boolean }) {
  const glowRef  = useRef<THREE.Mesh>(null!);

  const [colorMap, specularMap, normalMap, nightMap] = useLoader(TextureLoader, [
    '/earth.jpg',
    '/earth_specular.jpg',
    '/earth_normal.jpg',
    '/earth_night.jpg',
  ]);

  useFrame(({ clock }) => {
    // We intentionally do not rotate the earth independently so the texture stays locked with the markers
    // glowRef.current.rotation.y = clock.getElapsedTime() * 0.04;
  });

  return (
    <group>
      {/* Main globe */}
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[2, 128, 128]} />
        {isLight ? (
          <meshPhongMaterial
            map={colorMap}
            specularMap={specularMap}
            normalMap={normalMap}
            normalScale={new THREE.Vector2(0.05, 0.05)}
            specular={new THREE.Color('#4a90d9')}
            shininess={35}
          />
        ) : (
          <meshStandardMaterial
            map={colorMap}
            normalMap={normalMap}
            normalScale={new THREE.Vector2(0.05, 0.05)}
            emissiveMap={nightMap}
            emissive={new THREE.Color('#ffffff')}
            emissiveIntensity={1.8}
            roughness={0.7}
            metalness={0.1}
          />
        )}
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.18, 64, 64]} />
        <meshStandardMaterial
          color="#4a90ff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh>
        <sphereGeometry args={[2.22, 64, 64]} />
        <meshStandardMaterial
          color="#1a6aff"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ─── Animated particle on a Bezier arc ─────────────────────────────── */

function MovingParticle({ curve, color, speed, offset = 0 }: {
  curve: THREE.QuadraticBezierCurve3;
  color: string; speed: number; offset?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t  = ((clock.getElapsedTime() * speed + offset) % 1 + 1) % 1;
    const pt = curve.getPoint(t);
    ref.current.position.copy(pt);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

/* ─── Arc curve between two coords ──────────────────────────────────── */

function Arc({ from, to, color, pColor }: {
  from: [number, number]; to: [number, number];
  color: string; pColor: string;
}) {
  const R   = 2;
  const v0  = latLonToVec3(from[0], from[1], R);
  const v1  = latLonToVec3(to[0],   to[1],   R);
  const mid = new THREE.Vector3()
    .addVectors(v0, v1)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(R + 1.4);

  const curve = useMemo(
    () => new THREE.QuadraticBezierCurve3(v0, mid, v1),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const lineObj = useMemo(() => {
    const pts  = curve.getPoints(100);
    const geo  = new THREE.BufferGeometry().setFromPoints(pts);
    const mat  = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 });
    return new THREE.Line(geo, mat);
  }, [curve, color]);

  return (
    <>
      <primitive object={lineObj} />
      <MovingParticle curve={curve} color={pColor} speed={0.16} offset={0}    />
      <MovingParticle curve={curve} color={pColor} speed={0.16} offset={0.33} />
      <MovingParticle curve={curve} color={pColor} speed={0.16} offset={0.66} />
    </>
  );
}

/* ─── City marker ─────────────────────────────────────────────────────── */

function Marker({ lat, lon, color, label, flag, big = false, isStudent = false, earthRef }: {
  lat: number; lon: number; color: string;
  label: string; flag: string; big?: boolean; isStudent?: boolean;
  earthRef: React.RefObject<THREE.Mesh>;
}) {
  const pos = latLonToVec3(lat, lon, 2.1);
  
  // Transition styles based on occlusion
  const [hidden, setHidden] = useState(false);

  return (
    <group position={pos.toArray()}>
      {isStudent ? (
        <Html 
          center 
          distanceFactor={6} 
          occlude={[earthRef]} 
          onOcclude={setHidden}
          style={{ 
            pointerEvents: 'none', 
            whiteSpace: 'nowrap',
            transition: 'opacity 0.3s ease-in-out',
            opacity: hidden ? 0 : 1
          }}
        >
          <div className="flex flex-col items-center justify-center relative">
            {/* Glowing animated background ring */}
            <div className="absolute w-12 h-12 rounded-full bg-primary/40 animate-ping" />
            
            {/* The icon container */}
            <div 
              style={{
                background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '50%',
                padding: '6px',
                boxShadow: `0 0 25px ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 10
              }}
            >
              <GraduationCap size={18} color="#ffffff" strokeWidth={2.5} />
            </div>

            {/* Label below the icon */}
            <div style={{
              marginTop: '6px',
              background: 'rgba(4,10,30,0.9)',
              border: `1px solid ${color}66`,
              borderRadius: 8,
              padding: '3px 10px',
              fontSize: 11,
              fontFamily: 'monospace',
              fontWeight: 700,
              color: '#f0f4ff',
              boxShadow: `0 0 14px ${color}55`,
              backdropFilter: 'blur(8px)',
            }}>
              {flag} {label}
            </div>
          </div>
        </Html>
      ) : (
        <>
          {/* Glowing dot for normal markers */}
          <mesh>
            <sphereGeometry args={[big ? 0.1 : 0.07, 12, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
          </mesh>
          {/* Pulsing ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[big ? 0.14 : 0.1, big ? 0.18 : 0.13, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>

          <Html 
            center 
            distanceFactor={6} 
            occlude={[earthRef]} 
            onOcclude={setHidden}
            style={{ 
              pointerEvents: 'none', 
              whiteSpace: 'nowrap',
              transition: 'opacity 0.3s ease-in-out',
              opacity: hidden ? 0 : 1
            }}
          >
            <div style={{
              background: 'rgba(4,10,30,0.9)',
              border: `1px solid ${color}66`,
              borderRadius: 8,
              padding: '3px 10px',
              fontSize: 11,
              fontFamily: 'monospace',
              fontWeight: 700,
              color: '#f0f4ff',
              boxShadow: `0 0 14px ${color}55`,
              backdropFilter: 'blur(8px)',
            }}>
              {flag} {label}
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

/* ─── Skills orbiting the Earth ─────────────────────────────────────── */

const SKILLS = [
  { label: 'React',   color: '#61dafb', a: 0   },
  { label: 'Laravel', color: '#ff2d20', a: 72  },
  { label: 'Python',  color: '#3776ab', a: 144 },
  { label: 'Java',    color: '#f89820', a: 216 },
  { label: 'Node.js', color: '#68a063', a: 288 },
];

function SkillsOrbit({ earthRef }: { earthRef: React.RefObject<THREE.Mesh> }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => { ref.current.rotation.y = clock.getElapsedTime() * 0.3; });
  return (
    <group ref={ref}>
      {SKILLS.map(({ label, color, a }) => {
        const r   = 3.4;
        const rad = THREE.MathUtils.degToRad(a);
        return (
          <SkillNode key={label} label={label} color={color} r={r} rad={rad} earthRef={earthRef} />
        );
      })}
    </group>
  );
}

function SkillNode({ label, color, r, rad, earthRef }: { label: string, color: string, r: number, rad: number, earthRef: React.RefObject<THREE.Mesh> }) {
  const [hidden, setHidden] = useState(false);
  return (
    <group position={[r * Math.cos(rad), 0.4, r * Math.sin(rad)]}>
      <mesh>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
      </mesh>
      <Html 
        center 
        distanceFactor={6} 
        occlude={[earthRef]} 
        onOcclude={setHidden}
        style={{ 
          pointerEvents: 'none', 
          whiteSpace: 'nowrap',
          transition: 'opacity 0.3s ease-in-out',
          opacity: hidden ? 0 : 1
        }}
      >
        <div style={{
                background: 'rgba(4,10,30,0.92)',
                border: `1px solid ${color}aa`,
                borderRadius: 7,
                padding: '2px 8px',
                fontSize: 9,
                fontWeight: 800,
                fontFamily: 'monospace',
                color,
                boxShadow: `0 0 12px ${color}66`,
              }}>
                {label}
              </div>
            </Html>
          </group>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────── */

const MOROCCO: [number, number] = [31.79, -7.09];

const ARCS = [
  { to: [48.86,   2.35] as [number, number], color: '#818cf8', pColor: '#c4b5fd' }, // Paris
  { to: [40.71, -74.01] as [number, number], color: '#22d3ee', pColor: '#67e8f9' }, // NYC
  { to: [52.52,  13.41] as [number, number], color: '#86efac', pColor: '#bbf7d0' }, // Berlin
  { to: [35.68, 139.65] as [number, number], color: '#fda4af', pColor: '#fecdd3' }, // Tokyo
  { to: [51.51,  -0.13] as [number, number], color: '#fcd34d', pColor: '#fef08a' }, // London
  { to: [37.34,-121.89] as [number, number], color: '#f9a8d4', pColor: '#fbcfe8' }, // San Jose
];

const MARKERS = [
  { lat: 31.79, lon:  -7.09, color: '#a855f7', label: 'Étudiants Marocains',    flag: '🇲🇦', big: true, isStudent: true },
  { lat: 48.86, lon:   2.35, color: '#818cf8', label: 'Paris',    flag: '🇫🇷' },
  { lat: 40.71, lon: -74.01, color: '#22d3ee', label: 'New York', flag: '🇺🇸' },
  { lat: 52.52, lon:  13.41, color: '#86efac', label: 'Berlin',   flag: '🇩🇪' },
  { lat: 35.68, lon: 139.65, color: '#fda4af', label: 'Tokyo',    flag: '🇯🇵' },
  { lat: 51.51, lon:  -0.13, color: '#fcd34d', label: 'London',   flag: '🇬🇧' },
  { lat: 37.34, lon:-121.89, color: '#f9a8d4', label: 'San Jose', flag: '🇺🇸' },
];

/* ─── Scene ──────────────────────────────────────────────────────────── */

function Scene({ isLight }: { isLight: boolean }) {
  const earthRef = useRef<THREE.Mesh>(null!);

  return (
    <>
      {/* Lighting */}
      {isLight ? (
        <>
          <ambientLight intensity={1.8} />
          <directionalLight position={[5, 3, 5]} intensity={4.0} color="#ffffff" castShadow />
          <pointLight position={[-8, -4, -8]} intensity={2.5} color="#ffffff" />
          <pointLight position={[0, 8, 0]} intensity={1.5} color="#ffffff" />
        </>
      ) : (
        <>
          <ambientLight intensity={0.15} />
          <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" castShadow />
          <pointLight position={[-8, -4, -8]} intensity={2.0} color="#4a90d9" />
          <pointLight position={[0, 8, 0]} intensity={0.4} color="#ffffff" />
        </>
      )}

      {/* Stars background (only in dark mode usually, but we keep them, maybe adjust color/intensity? We'll just hide them in light mode or let them fade) */}
      {!isLight && (
        <Stars radius={90} depth={60} count={7000} factor={3} saturation={0.1} fade speed={0.8} />
      )}

      {/* Earth */}
      <Earth earthRef={earthRef} isLight={isLight} />

      {/* Arcs from Morocco */}
      {ARCS.map((a, i) => (
        <Arc key={i} from={MOROCCO} to={a.to} color={a.color} pColor={a.pColor} />
      ))}

      {/* City Markers */}
      {MARKERS.map((m, i) => (
        <Marker key={i} {...m} earthRef={earthRef} />
      ))}

      {/* Skills in orbit */}
      <SkillsOrbit earthRef={earthRef} />

      {/* Controls */}
      <OrbitControls
        enableZoom
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        minDistance={3.5}
        maxDistance={11}
      />
    </>
  );
}

/* ─── Loading fallback ───────────────────────────────────────────────── */

function GlobeLoader() {
  return (
    <div className="w-full h-[600px] lg:h-[700px] flex flex-col items-center justify-center gap-4">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-t-secondary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="text-on-surface-variant font-mono text-sm animate-pulse">Chargement du Globe 3D…</p>
    </div>
  );
}

/* ─── Legend ─────────────────────────────────────────────────────────── */

const LEGEND = [
  { color: '#a855f7', label: 'Étudiants Maroc'  },
  { color: '#22d3ee', label: 'Entreprises Intl.' },
  { color: '#fcd34d', label: 'Skills en orbite'  },
];

/* ─── Main export ────────────────────────────────────────────────────── */

export default function Globe3D() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === 'light';

  return (
    <div className="relative w-full h-[600px] lg:h-[700px]">
      {/* Ambient purple/blue glow behind the globe */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-0">
        <div className="w-[420px] h-[420px] rounded-full bg-blue-700/10 blur-[100px]" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-purple-600/10 blur-[80px]" />
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 1.5, 7], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        className="relative z-10"
      >
        <Suspense fallback={null}>
          <Scene isLight={isLight} />
        </Suspense>
      </Canvas>

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-3 pointer-events-none z-20">
        {LEGEND.map(({ color, label }) => (
          <div
            key={label}
            style={{
              background: isLight ? 'rgba(255,255,255,0.82)' : 'rgba(4,8,28,0.82)',
              border: `1px solid ${color}${isLight ? '88' : '44'}`,
              borderRadius: 20,
              padding: '4px 14px',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{
              background: color,
              boxShadow: `0 0 8px ${color}`,
              width: 10, height: 10,
              borderRadius: '50%',
              display: 'inline-block',
            }} />
            <span style={{ color: isLight ? '#1e293b' : '#e2eaf8', fontSize: 11, fontFamily: 'monospace', fontWeight: 700 }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
