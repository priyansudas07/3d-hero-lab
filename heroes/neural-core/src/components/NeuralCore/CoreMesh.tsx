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
  const globalGroupRef = useRef<THREE.Group>(null);
  const outerWireRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const pointer = useRef(new THREE.Vector2(0, 0));

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    /*
     * -------------------------------------------------------
     * GLOBAL 3D MOVEMENT
     *
     * This is deliberately applied to the complete core
     * instead of only rotating around Y.
     * -------------------------------------------------------
     */

    const targetX = state.pointer.y * 0.42;
    const targetY = state.pointer.x * 0.42;
    const targetZ = -state.pointer.x * 0.12;

    pointer.current.x = THREE.MathUtils.damp(
      pointer.current.x,
      targetX,
      4.5,
      delta
    );

    pointer.current.y = THREE.MathUtils.damp(
      pointer.current.y,
      targetY,
      4.5,
      delta
    );

    if (globalGroupRef.current) {
      /*
       * Continuous rotation on BOTH X and Y axes.
       *
       * This is the important correction that prevents
       * the object from looking like a flat horizontal disc.
       */
      globalGroupRef.current.rotation.x =
        time * 0.105 * rotationSpeed +
        pointer.current.x;

      globalGroupRef.current.rotation.y =
        time * 0.17 * rotationSpeed +
        pointer.current.y;

      globalGroupRef.current.rotation.z =
        Math.sin(time * 0.11) * 0.055 +
        targetZ;
    }

    /*
     * -------------------------------------------------------
     * OUTER SHELL
     *
     * Small independent movement layered on top of the
     * global rotation.
     * -------------------------------------------------------
     */

    if (outerWireRef.current) {
      outerWireRef.current.rotation.x =
        Math.sin(time * 0.31) * 0.08;

      outerWireRef.current.rotation.y =
        Math.sin(time * 0.22) * 0.12;
    }

    /*
     * -------------------------------------------------------
     * INNER CORE
     * -------------------------------------------------------
     */

    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.x =
        -time * 0.18 * rotationSpeed;

      innerCoreRef.current.rotation.y =
        -time * 0.32 * rotationSpeed;

      innerCoreRef.current.rotation.z =
        time * 0.11 * rotationSpeed;

      const pulse =
        1 +
        Math.sin(time * 2.5) * 0.055;

      innerCoreRef.current.scale.setScalar(pulse);
    }

    /*
     * -------------------------------------------------------
     * CENTRAL SINGULARITY
     * -------------------------------------------------------
     */

    if (glowRef.current) {
      const glowPulse =
        1 +
        Math.sin(time * 2.0) * 0.105;

      glowRef.current.scale.setScalar(glowPulse);
    }
  });

  return (
    <group
      ref={globalGroupRef}
      scale={[1.15, 1.15, 1.15]}
    >
      {/* Outer Geodesic Shell */}

      <mesh ref={outerWireRef}>
        <icosahedronGeometry args={[1.6, 2]} />

        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={1.2}
          wireframe
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Inner Polyhedral Shell */}

      <mesh ref={innerCoreRef}>
        <dodecahedronGeometry args={[0.95, 1]} />

        <meshStandardMaterial
          color={secondaryColor}
          emissive={secondaryColor}
          emissiveIntensity={1.5}
          wireframe
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Central Singularity */}

      <mesh ref={glowRef}>
        <sphereGeometry args={[0.48, 32, 32]} />

        <meshStandardMaterial
          color={primaryColor}
          emissive={secondaryColor}
          emissiveIntensity={2.0}
          transparent
          opacity={0.85}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
