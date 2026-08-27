'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PhysicsRenderer } from './PhysicsRenderer';
import { PhysicsMode } from '../../core/3d/physics/PhysicsSimulation';

export interface PhysicsPlaygroundProps {
  particleCount?: number;
  initialMode?: PhysicsMode;
  gravityStrength?: number;
  forceStrength?: number;
  damping?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

export function PhysicsPlaygroundCanvas({
  particleCount = 12000,
  initialMode = 'ATTRACT',
  gravityStrength = 0.5,
  forceStrength = 3.0,
  damping = 0.95,
  color = '#00F0FF',
  backgroundColor = '#030308',
  className = '',
}: PhysicsPlaygroundProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<PhysicsMode>(initialMode);
  const [isMouseDown, setIsMouseDown] = useState(false);

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
          <p className="text-sm tracking-widest uppercase text-cyan-400 font-mono">Loading Physics Engine...</p>
        </div>
      </div>
    );
  }

  const modes: PhysicsMode[] = ['GRAVITY', 'ATTRACT', 'REPEL', 'VORTEX', 'SPRING'];

  return (
    <div
      className={`relative w-full h-screen overflow-hidden bg-[#030308] ${className}`}
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
      onTouchStart={() => setIsMouseDown(true)}
      onTouchEnd={() => setIsMouseDown(false)}
    >
      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 7.5], fov: 45 }}
          dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={[backgroundColor]} />
          
          {/* Component #4: Interactive Physics Playground */}
          <PhysicsRenderer
            count={particleCount}
            mode={mode}
            isMouseDown={isMouseDown}
            gravityStrength={gravityStrength}
            forceStrength={forceStrength}
            damping={damping}
            color={color}
          />

          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
        </Canvas>
      </div>

      {/* Physics Mode Switcher Controls */}
      <div className="absolute top-6 left-6 z-10 flex flex-wrap gap-2 pointer-events-auto font-mono text-xs">
        {modes.map((m) => {
          const isActive = m === mode;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                isActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Interactive Guidance Tag */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none font-mono text-[11px] text-cyan-400/80 bg-slate-950/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/20">
        COMPONENT #4: PHYSICS PLAYGROUND // CLICK & DRAG MOUSE TO APPLY {mode} FORCE
      </div>
    </div>
  );
}
