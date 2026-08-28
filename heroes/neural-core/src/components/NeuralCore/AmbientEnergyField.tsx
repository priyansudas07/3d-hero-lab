'use client';

import React, {
  useRef,
  useMemo,
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
   VOLUMETRIC ATMOSPHERIC GLOW SHADERS
   ========================================================= */

const glowVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const glowFragmentShader = `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Soft rim glow intensity fading inward
    float intensity = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    
    gl_FragColor = vec4(uColor * (intensity * 1.5), intensity * uOpacity);
  }
`;


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

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(secondaryColor) },
      uOpacity: { value: 0.15 },
    }),
    [secondaryColor]
  );


  /* =======================================================
     FRAME LOOP (SOFT VOLUMETRIC ATMOSPHERE)
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
       SOFT BREATHING & SCALE PULSE
       ----------------------------------------------------- */

    const pulse =
      (1.0 + activity * 0.05) +
      Math.sin(time * (1.0 + activity * 0.5)) * (0.025 + activity * 0.015);

    mesh.scale.setScalar(pulse);


    /* -----------------------------------------------------
       MATERIAL SHADER UNIFORMS
       ----------------------------------------------------- */

    const mat = mesh.material as THREE.ShaderMaterial;

    if (mat && mat.uniforms.uOpacity) {
      mat.uniforms.uOpacity.value = 0.12 + activity * 0.15;
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

      <shaderMaterial
        vertexShader={glowVertexShader}
        fragmentShader={glowFragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.BackSide}
      />

    </mesh>

  );

}
