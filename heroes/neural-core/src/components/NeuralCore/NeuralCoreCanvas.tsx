'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CoreMesh } from './CoreMesh';
import { SynapticNodes } from './SynapticNodes';
import { ConnectionLines } from './ConnectionLines';

export interface SynapticNodeCloudProps {
  nodeCount?: number;
  interactionRadius?: number;
  attractionStrength?: number;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  className?: string;
}

export function NeuralCoreCanvas({
  nodeCount = 3500,
  interactionRadius = 2.5,
  attractionStrength = 0.25,
  primaryColor = '#00F0FF',
  secondaryColor = '#A040FF',
  backgroundColor = '#030308',
  className = '',
}: SynapticNodeCloudProps) {
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
          <p className="text-sm tracking-widest uppercase text-cyan-400 font-mono">Loading Synaptic Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-[#030308] ${className}`}>
      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 8.5], fov: 45 }}
          dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={[backgroundColor]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.8} color={primaryColor} />
          <pointLight position={[-10, -10, -5]} intensity={1.2} color={secondaryColor} />
          
          {/* Central Neural Structure */}
          <CoreMesh
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />

          {/* Interactive Synaptic Node Cloud */}
          <SynapticNodes
            count={nodeCount}
            interactionRadius={interactionRadius}
            attractionStrength={attractionStrength}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />

          {/* Dynamic Connection Lines */}
          <ConnectionLines
            nodeCount={250}
            maxConnections={250}
            maxDistance={2.2}
            color={secondaryColor}
          />

          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
        </Canvas>
      </div>

      {/* Minimal Floating Tech Indicator */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none font-mono text-[11px] text-cyan-400/80 bg-slate-950/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/20">
        SYNAPTIC NODE CLOUD // CLICK NODE TO TRIGGER IMPULSE
      </div>
    </div>
  );
}
