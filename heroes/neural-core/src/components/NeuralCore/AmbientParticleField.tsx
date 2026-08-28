'use client';

import React, {
  useMemo,
  useRef,
} from 'react';

import {
  useFrame,
} from '@react-three/fiber';

import * as THREE from 'three';


/* =========================================================
   PROPS
   ========================================================= */

export interface AmbientParticleFieldProps {

  count?: number;

  spread?: number;

  primaryColor?: string;

  secondaryColor?: string;
}


/* =========================================================
   COMPONENT
   ========================================================= */

export function AmbientParticleField({
  count = 180,

  spread = 15.0,

  primaryColor = '#00F0FF',

  secondaryColor = '#A040FF',
}: AmbientParticleFieldProps) {

  const pointsRef =
    useRef<THREE.Points>(null);


  /* =======================================================
     GEOMETRY & INITIAL BUFFERS
     ======================================================= */

  const {
    geometry,
    initialPositions,
  } = useMemo(() => {

    const pos =
      new Float32Array(count * 3);

    const initPos =
      new Float32Array(count * 3);

    const cols =
      new Float32Array(count * 3);

    const c1 =
      new THREE.Color(primaryColor);

    const c2 =
      new THREE.Color(secondaryColor);

    const tempColor =
      new THREE.Color();


    for (let i = 0; i < count; i++) {
      const idx = i * 3;

      // Distribute particles through a wide 3D computational volume
      const x = (Math.random() - 0.5) * spread;
      const y = (Math.random() - 0.5) * spread;
      const z = (Math.random() - 0.5) * (spread * 0.85);

      pos[idx] = x;
      pos[idx + 1] = y;
      pos[idx + 2] = z;

      initPos[idx] = x;
      initPos[idx + 1] = y;
      initPos[idx + 2] = z;

      // Subtle cyan/purple palette variations
      tempColor.copy(c1).lerp(c2, Math.random());

      cols[idx] = tempColor.r;
      cols[idx + 1] = tempColor.g;
      cols[idx + 2] = tempColor.b;
    }

    const geo = new THREE.BufferGeometry();

    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(pos, 3)
    );

    geo.setAttribute(
      'color',
      new THREE.BufferAttribute(cols, 3)
    );

    return {
      geometry: geo,
      initialPositions: initPos,
    };

  }, [count, spread, primaryColor, secondaryColor]);


  /* =======================================================
     FRAME LOOP (SUBTLE COMPUTATIONAL DUST DRIFT)
     ======================================================= */

  useFrame((state) => {

    const points = pointsRef.current;

    if (!points) {
      return;
    }

    const time = state.clock.elapsedTime;

    const posAttribute =
      geometry.getAttribute('position') as THREE.BufferAttribute;

    const array = posAttribute.array as Float32Array;


    for (let i = 0; i < count; i++) {
      const idx = i * 3;

      const initX = initialPositions[idx];
      const initY = initialPositions[idx + 1];
      const initZ = initialPositions[idx + 2];

      // Ultra-slow harmonic floating drift
      const offsetX = Math.sin(time * 0.10 + i * 0.1) * 0.18;
      const offsetY = Math.cos(time * 0.08 + i * 0.15) * 0.18;
      const offsetZ = Math.sin(time * 0.07 + i * 0.2) * 0.14;

      array[idx] = initX + offsetX;
      array[idx + 1] = initY + offsetY;
      array[idx + 2] = initZ + offsetZ;
    }

    posAttribute.needsUpdate = true;

  });


  /* =======================================================
     RENDER
     ========================================================= */

  return (

    <points
      ref={pointsRef}
      geometry={geometry}
    >

      <pointsMaterial
        size={0.025}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.22}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />

    </points>

  );

}
