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

  const groupRef =
    useRef<THREE.Group>(null);

  const outerWireRef =
    useRef<THREE.Mesh>(null);

  const innerCoreRef =
    useRef<THREE.Mesh>(null);

  const glowRef =
    useRef<THREE.Mesh>(null);

  const outerMaterialRef =
    useRef<THREE.MeshStandardMaterial>(null);

  const innerMaterialRef =
    useRef<THREE.MeshStandardMaterial>(null);

  const glowMaterialRef =
    useRef<THREE.MeshStandardMaterial>(null);

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
       1. REAL NETWORK ACTIVITY CALCULATION & COUPLING
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

        // Normalize aggregate activity smoothly
        targetActivity = Math.min(1.0, totalIntensity / 2.8);
      }
    }

    /*
     * Extremely subtle hover anticipation (0.03 boost)
     * Hovering never overpowers real propagated signals
     */
    if (networkRef?.current?.hoveredNode !== null && networkRef?.current?.hoveredNode !== undefined) {
      targetActivity = Math.max(targetActivity, 0.03);
    }

    /*
     * Asymmetric damping: fast attack on signal arrival (6.0), smooth decaying release (2.8)
     */
    const dampRate =
      targetActivity > smoothedActivity.current ? 6.0 : 2.8;

    smoothedActivity.current = THREE.MathUtils.damp(
      smoothedActivity.current,
      targetActivity,
      dampRate,
      delta
    );

    const activity = smoothedActivity.current;


    /* =====================================================
       2. GLOBAL CORE SCALE RESPONSE (1.00x -> 1.05x)
       ===================================================== */

    if (groupRef.current) {
      const coreBaseScale =
        1.0 + activity * 0.05;

      groupRef.current.scale.setScalar(coreBaseScale);
    }


    /* =====================================================
       3. OUTER GEODESIC SHELL (Stage 1: Subtle boundary containment)
       ===================================================== */

    if (outerMaterialRef.current) {
      outerMaterialRef.current.emissiveIntensity =
        1.2 + activity * 0.7;
    }


    /* =====================================================
       4. INNER POLYHEDRON (Stage 2: Computational acceleration)
       ===================================================== */

    if (
      innerCoreRef.current
    ) {

      // Subtle rotational-energy modulation driven by network activity
      innerCoreRef.current.rotation.x =
        time *
        (0.20 + activity * 0.07) *
        rotationSpeed;

      innerCoreRef.current.rotation.y =
        -time *
        (0.31 + activity * 0.09) *
        rotationSpeed;

      innerCoreRef.current.rotation.z =
        time *
        0.12 *
        rotationSpeed;


      const pulse =
        1.0 +
        Math.sin(
          time *
          (2.5 + activity * 0.9)
        ) *
        (0.055 + activity * 0.022);


      innerCoreRef.current
        .scale
        .setScalar(
          pulse
        );

      if (innerMaterialRef.current) {
        innerMaterialRef.current.emissiveIntensity =
          1.5 + activity * 1.1;
      }
    }


    /* =====================================================
       5. CENTRAL SINGULARITY (Stage 3: Energy processing & release)
       ===================================================== */

    if (
      glowRef.current
    ) {

      const glowPulse =
        (1.0 + activity * 0.08) +
        Math.sin(
          time *
          (2.0 + activity * 0.7)
        ) *
        (0.10 + activity * 0.04);


      glowRef.current
        .scale
        .setScalar(
          glowPulse
        );

      if (glowMaterialRef.current) {
        glowMaterialRef.current.emissiveIntensity =
          2.0 + activity * 1.6;
      }
    }

  });


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <group ref={groupRef}>

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
          ref={
            outerMaterialRef
          }

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
          ref={
            innerMaterialRef
          }

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
          ref={
            glowMaterialRef
          }

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
