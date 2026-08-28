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

export interface AmbientEnergyFieldProps {

  radius?: number;

  primaryColor?: string;

  secondaryColor?: string;

  networkRef?: SynapticNetworkRef;
}


/* =========================================================
   COMPONENT
   ========================================================= */

export function AmbientEnergyField({
  radius = 2.4,

  primaryColor = '#00F0FF',

  secondaryColor = '#A040FF',

  networkRef,
}: AmbientEnergyFieldProps) {

  const meshRef =
    useRef<THREE.Mesh>(null);

  const smoothedActivity =
    useRef(0.0);


  /* =======================================================
     FRAME LOOP (SUBTLE ENERGY BREATHING)
     ======================================================= */

  useFrame((state, delta) => {

    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }

    const time = state.clock.elapsedTime;


    /* -----------------------------------------------------
       REAL NETWORK ACTIVITY RESPONSE
       ----------------------------------------------------- */

    let targetActivity = 0.0;

    if (networkRef?.current?.signalPropagator) {
      const activeSignals =
        networkRef.current.signalPropagator.getActiveSignals();

      if (activeSignals.length > 0) {
        let totalIntensity = 0;

        for (let i = 0; i < activeSignals.length; i++) {
          totalIntensity += activeSignals[i].intensity;
        }

        targetActivity = Math.min(1.0, totalIntensity / 4.0);
      }
    }

    smoothedActivity.current = THREE.MathUtils.damp(
      smoothedActivity.current,
      targetActivity,
      3.0,
      delta
    );

    const activity = smoothedActivity.current;


    /* -----------------------------------------------------
       BREATHING & SCALE PULSE
       ----------------------------------------------------- */

    const pulse =
      (1.0 + activity * 0.06) +
      Math.sin(time * (1.2 + activity * 0.6)) * (0.035 + activity * 0.02);

    mesh.scale.setScalar(pulse);


    /* -----------------------------------------------------
       MATERIAL EMISSIVE & OPACITY MODULATION
       ----------------------------------------------------- */

    const mat = mesh.material as THREE.MeshStandardMaterial;

    if (mat) {
      mat.opacity = 0.08 + activity * 0.10;
      mat.emissiveIntensity = 0.6 + activity * 0.9;
    }

  });


  /* =======================================================
     RENDER
     ========================================================= */

  return (

    <mesh
      ref={meshRef}
      raycast={() => null} // Ignore raycasting to allow node clicking through field
    >

      <sphereGeometry
        args={[
          radius,
          32,
          32,
        ]}
      />

      <meshStandardMaterial
        color={primaryColor}
        emissive={secondaryColor}
        emissiveIntensity={0.6}
        transparent={true}
        opacity={0.08}
        roughness={0.4}
        wireframe={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />

    </mesh>

  );

}
