'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SynapticNodesProps {
  count?: number;
  radius?: number;
  color?: string;
}

export function SynapticNodes({
  count = 1000,
  radius = 6.0,
  color = '#00F0FF',
}: SynapticNodesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Generate node positions in a spherical shell around core
  const { positions, randomScales, dummy } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const tempDummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + Math.cbrt(Math.random()) * (radius - 2.0); // Keep inner clearance for core

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      scales[i] = 0.5 + Math.random() * 0.8;
    }

    return { positions: pos, randomScales: scales, dummy: tempDummy };
  }, [count, radius]);

  useEffect(() => {
    if (!meshRef.current) return;

    for (let i = 0; i < count; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.scale.setScalar(randomScales[i] * 0.04);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, positions, randomScales, dummy]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    // Subtle ambient breathing float
    meshRef.current.rotation.y = time * 0.05;
    meshRef.current.rotation.x = Math.sin(time * 0.03) * 0.1;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} />
    </instancedMesh>
  );
}
