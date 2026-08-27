'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FluidParticleRenderer } from './FluidParticleRenderer';

export interface FluidParticleFieldProps {
  particleCount?: number;
  forceRadius?: number;
  forceStrength?: number;
  vortexStrength?: number;
  damping?: number;
  turbulence?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

export function FluidParticleCanvas({
  particleCount = 25000,
  forceRadius = 3.0,
  forceStrength = 2.5,
  vortexStrength = 1.8,
  damping = 0.96,
  turbulence = 0.4,
  color = '#00F0FF',
  backgroundColor = '#030308',
  className = '',
}: FluidParticleFieldProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`relative w-full h-screen flex items-center justify-center bg-[#030308] text-white ${className}`}
      >
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm tracking-widest uppercase text-cyan-400 font-mono">Loading Fluid Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-[#030308] ${className}`}>
      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 7.5], fov: 45 }}
          dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={[backgroundColor]} />
          
          {/* Component #2: Fluid Particle Field */}
          <FluidParticleRenderer
            count={particleCount}
            forceRadius={forceRadius}
            forceStrength={forceStrength}
            vortexStrength={vortexStrength}
            damping={damping}
            turbulence={turbulence}
            color={color}
          />

          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
        </Canvas>
      </div>

      {/* Minimal Tech Tag */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none font-mono text-[11px] text-cyan-400/80 bg-slate-950/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/20">
        COMPONENT #2: FLUID PARTICLE FIELD // MOVE CURSOR TO SWIRL VORTEX
      </div>
    </div>
  );
}
