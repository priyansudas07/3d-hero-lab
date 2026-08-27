'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CoreMesh } from './CoreMesh';
import { SynapticNodes } from './SynapticNodes';
import { ConnectionLines } from './ConnectionLines';
import { HeroOverlay } from './HeroOverlay';
import { NeuralCoreProps } from '@/types/neuralCore';

export function NeuralCoreCanvas({
  primaryColor = '#00F0FF',
  secondaryColor = '#A040FF',
  backgroundColor = '#030308',
  rotationSpeed = 1.0,
  nodeCount = 3500,
  className = '',
}: NeuralCoreProps) {
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
          <p className="text-sm tracking-widest uppercase text-cyan-400 font-mono">Loading Neural Core...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-[#030308] ${className}`}>
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 8.5], fov: 45 }}
          dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={['#030308']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.8} color={primaryColor} />
          <pointLight position={[-10, -10, -5]} intensity={1.2} color={secondaryColor} />
          
          {/* Central Neural Core Structure */}
          <CoreMesh
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            rotationSpeed={rotationSpeed}
          />

          {/* Phase 3A: Organic Branching Axon Node Network */}
          <SynapticNodes
            count={nodeCount}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />

          {/* Phase 3A: Targeted Neural Axon Connection Lines */}
          <ConnectionLines
            nodeCount={250}
            maxConnections={250}
            maxDistance={2.2}
            color={secondaryColor}
          />

          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
        </Canvas>
      </div>

      {/* Clean Cybernetic Hero UI Overlay */}
      <HeroOverlay />
    </div>
  );
}
