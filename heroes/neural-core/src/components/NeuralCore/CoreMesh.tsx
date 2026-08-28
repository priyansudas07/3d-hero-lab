'use client';

import React, {
  useRef,
} from 'react';

import {
  useFrame,
} from '@react-three/fiber';

import * as THREE from 'three';

import type {
  SynapticNetworkRef,
} from './SynapticNodes';


/* =========================================================
   PROPS
   ========================================================= */

interface CoreMeshProps {

  primaryColor?: string;

  secondaryColor?: string;

  rotationSpeed?: number;

  networkRef?: SynapticNetworkRef;
}


/* =========================================================
   COMPONENT
   ========================================================= */

export function CoreMesh({
  primaryColor = '#00F0FF',

  secondaryColor = '#A040FF',

  rotationSpeed = 1.0,

  networkRef,
}: CoreMeshProps) {

  const outerWireRef =
    useRef<THREE.Mesh>(null);

  const innerCoreRef =
    useRef<THREE.Mesh>(null);

  const glowRef =
    useRef<THREE.Mesh>(null);

  /*
   * Damped network activity level (0.0 -> 1.0)
   */
  const smoothedActivity =
    useRef(0.0);


  /* =======================================================
     LOCAL CORE ANIMATION
     ======================================================= */

  useFrame((state, delta) => {

    const time =
      state.clock.elapsedTime;


    /* =====================================================
       CALCULATE REAL NETWORK ACTIVITY
       ===================================================== */

    let targetActivity = 0.0;

    if (networkRef?.current?.signalPropagator) {
      const activeSignals =
        networkRef.current.signalPropagator.getActiveSignals();

      if (activeSignals.length > 0) {
        let totalIntensity = 0;

        for (let i = 0; i < activeSignals.length; i++) {
          totalIntensity += activeSignals[i].intensity;
        }

        // Normalize activity level smoothly
        targetActivity = Math.min(1.0, totalIntensity / 4.0);
      }
    }

    // Damped interpolation to prevent strobing or sudden changes
    smoothedActivity.current = THREE.MathUtils.damp(
      smoothedActivity.current,
      targetActivity,
      3.5,
      delta
    );

    const activity = smoothedActivity.current;


    /* =====================================================
       OUTER GEODESIC SHELL
       ===================================================== */

    if (
      outerWireRef.current
    ) {

      const outerMat =
        outerWireRef.current.material as THREE.MeshStandardMaterial;

      if (outerMat) {
        outerMat.emissiveIntensity =
          1.2 + activity * 0.8;
      }
    }


    /* =====================================================
       INNER POLYHEDRON
       ===================================================== */

    if (
      innerCoreRef.current
    ) {

      innerCoreRef.current.rotation.x =
        time *
        (0.20 + activity * 0.08) *
        rotationSpeed;

      innerCoreRef.current.rotation.y =
        -time *
        (0.31 + activity * 0.10) *
        rotationSpeed;

      innerCoreRef.current.rotation.z =
        time *
        0.12 *
        rotationSpeed;


      const pulse =
        1.0 +
        Math.sin(
          time *
          (2.5 + activity * 1.2)
        ) *
        (0.055 + activity * 0.035);


      innerCoreRef.current
        .scale
        .setScalar(
          pulse
        );


      const innerMat =
        innerCoreRef.current.material as THREE.MeshStandardMaterial;

      if (innerMat) {
        innerMat.emissiveIntensity =
          1.5 + activity * 1.2;
      }
    }


    /* =====================================================
       CENTRAL SINGULARITY
       ===================================================== */

    if (
      glowRef.current
    ) {

      const glowPulse =
        (1.0 + activity * 0.12) +
        Math.sin(
          time *
          (2.0 + activity * 1.0)
        ) *
        (0.10 + activity * 0.05);


      glowRef.current
        .scale
        .setScalar(
          glowPulse
        );


      const glowMat =
        glowRef.current.material as THREE.MeshStandardMaterial;

      if (glowMat) {
        glowMat.emissiveIntensity =
          2.0 + activity * 1.8;
      }
    }

  });


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <group>

      {/* =================================================
          OUTER GEODESIC SHELL
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

          emissiveIntensity={
            1.2
          }

          wireframe

          metalness={
            0.9
          }

          roughness={
            0.1
          }

        />

      </mesh>


      {/* =================================================
          INNER POLYHEDRON
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

          emissiveIntensity={
            1.5
          }

          wireframe

          metalness={
            0.95
          }

          roughness={
            0.05
          }

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

          emissiveIntensity={
            2.0
          }

          transparent

          opacity={
            0.85
          }

          roughness={
            0.2
          }

        />

      </mesh>

    </group>
  );
}
