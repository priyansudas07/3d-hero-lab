'use client';

import React, { useRef } from 'react';
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
  
  const currentPointer = useRef(new THREE.Vector2(0, 0));

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Smooth dampening mouse tilt target
    const targetX = state.pointer.x * 0.35;
    const targetY = state.pointer.y * 0.35;

    currentPointer.current.x = THREE.MathUtils.damp(currentPointer.current.x, targetX, 4, delta);
    currentPointer.current.y = THREE.MathUtils.damp(currentPointer.current.y, targetY, 4, delta);

    if (outerWireRef.current) {
      outerWireRef.current.rotation.y = time * 0.18 * rotationSpeed + currentPointer.current.x;
      outerWireRef.current.rotation.x = Math.sin(time * 0.08) * 0.15 - currentPointer.current.y;
    }

    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y = -time * 0.35 * rotationSpeed - currentPointer.current.x * 0.5;
      const pulse = 1.0 + Math.sin(time * 2.5) * 0.06;
      innerCoreRef.current.scale.set(pulse, pulse, pulse);
    }

    if (glowRef.current) {
      const glowPulse = 1.0 + Math.sin(time * 2.0) * 0.12;
      glowRef.current.scale.set(glowPulse, glowPulse, glowPulse);
    }
  });

  return (
    <group scale={[1.15, 1.15, 1.15]}>
      {/* Outer Geodesic Wireframe Shell */}
      <mesh ref={outerWireRef}>
        <icosahedronGeometry args={[1.6, 2]} />
        <meshStandardMaterial
          color="#00F0FF"
          emissive="#00F0FF"
          emissiveIntensity={1.2}
          wireframe
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Inner Nested Polyhedron Shell */}
      <mesh ref={innerCoreRef}>
        <dodecahedronGeometry args={[0.95, 1]} />
        <meshStandardMaterial
          color="#A040FF"
          emissive="#A040FF"
          emissiveIntensity={1.5}
          wireframe
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Central Singularity Soft Glowing Core */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.48, 32, 32]} />
        <meshStandardMaterial
          color="#00F0FF"
          emissive="#A040FF"
          emissiveIntensity={2.0}
          transparent
          opacity={0.85}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
