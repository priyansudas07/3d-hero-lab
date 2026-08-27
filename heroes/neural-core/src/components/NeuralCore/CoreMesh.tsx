'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CoreMeshProps {
  primaryColor?: string;
  secondaryColor?: string;
  rotationSpeed?: number;
}

export function CoreMesh({
  primaryColor = '#00F0FF',
  secondaryColor = '#A040FF',
  rotationSpeed = 1.0,
}: CoreMeshProps) {
  const outerWireRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    if (outerWireRef.current) {
      outerWireRef.current.rotation.y = time * 0.2 * rotationSpeed;
      outerWireRef.current.rotation.x = Math.sin(time * 0.1) * 0.2;
    }

    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y = -time * 0.4 * rotationSpeed;
      const pulse = 1.0 + Math.sin(time * 3.0) * 0.08;
      innerCoreRef.current.scale.set(pulse, pulse, pulse);
    }

    if (glowRef.current) {
      const glowPulse = 1.0 + Math.sin(time * 2.5) * 0.15;
      glowRef.current.scale.set(glowPulse, glowPulse, glowPulse);
    }
  });

  return (
    <group>
      {/* Outer Geodesic Wireframe Shell */}
      <mesh ref={outerWireRef}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshStandardMaterial
          color="#00F0FF"
          emissive="#00F0FF"
          emissiveIntensity={0.6}
          wireframe
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Inner Nested Polyhedron Shell */}
      <mesh ref={innerCoreRef}>
        <dodecahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial
          color="#A040FF"
          emissive="#A040FF"
          emissiveIntensity={1.2}
          wireframe
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Central Singularity Glow Core */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0.95}
        />
      </mesh>
    </group>
  );
}
