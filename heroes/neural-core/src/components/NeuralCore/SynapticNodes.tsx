'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SynapticNodesProps {
  count?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export function SynapticNodes({
  count = 3500,
  primaryColor = '#00F0FF',
  secondaryColor = '#A040FF',
}: SynapticNodesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const currentPointerWorld = useRef(new THREE.Vector3(0, 0, 0));

  const { positions, randomScales, dummy, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const cols = new Float32Array(count * 3);
    const tempDummy = new THREE.Object3D();

    const c1 = new THREE.Color(primaryColor);
    const c2 = new THREE.Color(secondaryColor);
    const cDeep = new THREE.Color('#301050');

    const numAxons = 6;
    const axonAngles = Array.from({ length: numAxons }, (_, i) => (i / numAxons) * Math.PI * 2.0);

    for (let i = 0; i < count; i++) {
      let x = 0, y = 0, z = 0;
      let scale = 0.015;
      let nodeColor = c1;

      const pType = Math.random();

      if (pType < 0.25) {
        const r = 0.8 + Math.cbrt(Math.random()) * 1.5;
        const theta = Math.random() * Math.PI * 2.0;
        const phi = Math.acos(2.0 * Math.random() - 1.0);

        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);

        scale = 0.018 + Math.random() * 0.02;
        nodeColor = c1.clone().lerp(c2, Math.random() * 0.4);
      } else if (pType < 0.75) {
        const axonIdx = Math.floor(Math.random() * numAxons);
        const baseAngle = axonAngles[axonIdx];
        const distAlongAxon = 1.5 + Math.pow(Math.random(), 1.5) * 5.5;

        const spiralAngle = distAlongAxon * 1.2 + Math.random() * 0.5;
        const dispersionRadius = 0.2 + (distAlongAxon * 0.15) * Math.random();

        x = Math.cos(baseAngle) * distAlongAxon + Math.cos(spiralAngle) * dispersionRadius;
        y = Math.sin(baseAngle) * distAlongAxon + Math.sin(spiralAngle) * dispersionRadius;
        z = (Math.random() - 0.5) * (distAlongAxon * 0.4);

        scale = 0.012 + Math.random() * 0.015;
        nodeColor = c1.clone().lerp(c2, distAlongAxon / 7.0);
      } else {
        x = (Math.random() - 0.5) * 16.0;
        y = (Math.random() - 0.5) * 12.0;
        z = -10.0 + Math.random() * 14.0;

        scale = (z > 2.0) ? 0.025 : 0.01;
        nodeColor = (z < -4.0) ? cDeep : c2;
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      scales[i] = scale;

      cols[i * 3] = nodeColor.r;
      cols[i * 3 + 1] = nodeColor.g;
      cols[i * 3 + 2] = nodeColor.b;
    }

    return { positions: pos, randomScales: scales, dummy: tempDummy, colors: cols };
  }, [count, primaryColor, secondaryColor]);

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

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    // Convert pointer state (-1 to +1) to 3D world target space
    const targetWorldX = state.pointer.x * 6.0;
    const targetWorldY = state.pointer.y * 4.0;

    currentPointerWorld.current.x = THREE.MathUtils.damp(currentPointerWorld.current.x, targetWorldX, 5, delta);
    currentPointerWorld.current.y = THREE.MathUtils.damp(currentPointerWorld.current.y, targetWorldY, 5, delta);

    // Calm ambient background rotation
    meshRef.current.rotation.y = time * 0.025;
    meshRef.current.rotation.x = Math.sin(time * 0.01) * 0.04;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial transparent opacity={0.7} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}
