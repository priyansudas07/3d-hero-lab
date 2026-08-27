'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SynapticNodesProps {
  count?: number;
  radius?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export function SynapticNodes({
  count = 2500,
  radius = 6.5,
  primaryColor = '#00F0FF',
  secondaryColor = '#A040FF',
}: SynapticNodesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { positions, randomScales, dummy, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const cols = new Float32Array(count * 3);
    const tempDummy = new THREE.Object3D();

    const c1 = new THREE.Color(primaryColor);
    const c2 = new THREE.Color(secondaryColor);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      // Increased clearance radius around core: 3.2 to 6.5
      const r = 3.2 + Math.cbrt(Math.random()) * (radius - 3.2);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Precision tiny node scaling (0.012 to 0.025)
      scales[i] = 0.012 + Math.pow(Math.random(), 3.0) * 0.018;

      const mixRatio = Math.random();
      const nodeColor = c1.clone().lerp(c2, mixRatio);
      cols[i * 3] = nodeColor.r;
      cols[i * 3 + 1] = nodeColor.g;
      cols[i * 3 + 2] = nodeColor.b;
    }

    return { positions: pos, randomScales: scales, dummy: tempDummy, colors: cols };
  }, [count, radius, primaryColor, secondaryColor]);

  useEffect(() => {
    if (!meshRef.current) return;

    const colorAttr = new THREE.InstancedBufferAttribute(colors, 3);
    meshRef.current.instanceColor = colorAttr;

    for (let i = 0; i < count; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.scale.setScalar(randomScales[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [count, positions, randomScales, dummy, colors]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    meshRef.current.rotation.y = time * 0.03;
    meshRef.current.rotation.x = Math.sin(time * 0.015) * 0.05;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial transparent opacity={0.65} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}
