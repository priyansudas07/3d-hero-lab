'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CoreMesh } from './CoreMesh';
import { NeuralCoreProps } from '@/types/neuralCore';

export function NeuralCoreCanvas({
  primaryColor = '#00F0FF',
  secondaryColor = '#7000FF',
  backgroundColor = '#05050A',
  rotationSpeed = 1.0,
  headline = 'Neural Processing Engine',
  subheadline = 'Next-generation AI core visualization powered by WebGL & GLSL Shaders',
  ctaText = 'Explore Architecture',
  onCtaClick,
  className = '',
}: NeuralCoreProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`relative w-full h-screen flex items-center justify-center bg-[#05050A] text-white ${className}`}
      >
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm tracking-widest uppercase text-cyan-400 font-mono">Loading Neural Core...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-[${backgroundColor}] ${className}`}>
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={[backgroundColor]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color={primaryColor} />
          <pointLight position={[-10, -10, -5]} intensity={1.0} color={secondaryColor} />
          
          {/* Central Neural Core Mesh */}
          <CoreMesh
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            rotationSpeed={rotationSpeed}
          />

          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
        </Canvas>
      </div>

      {/* HTML Hero Overlay Layer */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 text-center pointer-events-none select-none">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 text-xs font-mono tracking-wider uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Phase 1 Prototype Active
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_0_35px_rgba(0,240,255,0.4)]">
            {headline}
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            {subheadline}
          </p>

          <div className="pt-4 pointer-events-auto">
            <button
              onClick={onCtaClick}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#7000FF] text-black font-semibold tracking-wide hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {ctaText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
