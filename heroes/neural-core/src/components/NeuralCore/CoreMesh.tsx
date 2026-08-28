'use client';

import React, {
  useRef,
} from 'react';

import {
  useFrame,
} from '@react-three/fiber';

import * as THREE from 'three';


/* =========================================================
   PROPS
   ========================================================= */

interface CoreMeshProps {
  primaryColor?: string;

  secondaryColor?: string;

  rotationSpeed?: number;
}


/* =========================================================
   COMPONENT
   ========================================================= */

export function CoreMesh({
  primaryColor = '#00F0FF',

  secondaryColor = '#A040FF',

  rotationSpeed = 1.0,
}: CoreMeshProps) {

  const outerWireRef =
    useRef<THREE.Mesh>(null);

  const innerCoreRef =
    useRef<THREE.Mesh>(null);

  const glowRef =
    useRef<THREE.Mesh>(null);


  /* =======================================================
     ANIMATION
     ======================================================= */

  useFrame((state) => {

    const time =
      state.clock.elapsedTime;


    /* =====================================================
       OUTER GEODESIC SHELL
       ===================================================== */

    if (
      outerWireRef.current
    ) {

      outerWireRef.current.rotation.x =
        Math.sin(
          time * 0.22
        ) * 0.08;

      outerWireRef.current.rotation.y =
        time *
        0.18 *
        rotationSpeed;

      outerWireRef.current.rotation.z =
        Math.sin(
          time * 0.17
        ) * 0.035;
    }


    /* =====================================================
       INNER POLYHEDRON
       ===================================================== */

    if (
      innerCoreRef.current
    ) {

      innerCoreRef.current.rotation.x =
        time *
        0.20 *
        rotationSpeed;

      innerCoreRef.current.rotation.y =
        -time *
        0.31 *
        rotationSpeed;

      innerCoreRef.current.rotation.z =
        time *
        0.12 *
        rotationSpeed;


      const pulse =
        1.0 +
        Math.sin(
          time * 2.5
        ) * 0.055;


      innerCoreRef.current
        .scale
        .setScalar(
          pulse
        );
    }


    /* =====================================================
       CENTRAL SINGULARITY
       ===================================================== */

    if (
      glowRef.current
    ) {

      const glowPulse =
        1.0 +
        Math.sin(
          time * 2.0
        ) * 0.10;


      glowRef.current
        .scale
        .setScalar(
          glowPulse
        );
    }

  });


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <group>

      {/* =================================================
          OUTER GEODESIC WIREFRAME
          ================================================= */}

      <mesh
        ref={
          outerWireRef
        }
      >

        <icosahedronGeometry
          args={[
            1.6,
            2,
          ]}
        />

        <meshStandardMaterial
          color={
            primaryColor
          }

          emissive={
            primaryColor
          }

          emissiveIntensity={1.2}

          wireframe

          metalness={0.9}

          roughness={0.1}
        />

      </mesh>


      {/* =================================================
          INNER NESTED POLYHEDRON
          ================================================= */}

      <mesh
        ref={
          innerCoreRef
        }
      >

        <dodecahedronGeometry
          args={[
            0.95,
            1,
          ]}
        />

        <meshStandardMaterial
          color={
            secondaryColor
          }

          emissive={
            secondaryColor
          }

          emissiveIntensity={1.5}

          wireframe

          metalness={0.95}

          roughness={0.05}
        />

      </mesh>


      {/* =================================================
          CENTRAL SINGULARITY
          ================================================= */}

      <mesh
        ref={
          glowRef
        }
      >

        <sphereGeometry
          args={[
            0.48,
            32,
            32,
          ]}
        />

        <meshStandardMaterial
          color={
            primaryColor
          }

          emissive={
            secondaryColor
          }

          emissiveIntensity={2.0}

          transparent

          opacity={0.85}

          roughness={0.2}
        />

      </mesh>

    </group>
  );
}
