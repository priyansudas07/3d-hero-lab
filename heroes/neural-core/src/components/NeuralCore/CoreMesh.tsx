'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CoreMeshProps {
  primaryColor?: string;
  secondaryColor?: string;
  rotationSpeed?: number;
}

const fresnelVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fresnelFragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uEmissiveColor;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Fresnel Rim Intensity
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);
    
    // Energy pulse
    float pulse = sin(uTime * 3.0) * 0.25 + 0.75;
    
    vec3 glowColor = mix(uColor, uEmissiveColor, fresnel * pulse);
    float alpha = clamp(0.35 + fresnel * 0.65, 0.0, 1.0);

    gl_FragColor = vec4(glowColor * (1.2 + fresnel * 1.5), alpha);
  }
`;

export function CoreMesh({
  primaryColor = '#00F0FF',
  secondaryColor = '#A040FF',
  rotationSpeed = 1.0,
}: CoreMeshProps) {
  const outerWireRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const fresnelUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(primaryColor) },
      uEmissiveColor: { value: new THREE.Color(secondaryColor) },
    }),
    [primaryColor, secondaryColor]
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    fresnelUniforms.uTime.value = time;

    if (outerWireRef.current) {
      outerWireRef.current.rotation.x =
        Math.sin(time * 0.31) * 0.08;

      outerWireRef.current.rotation.y =
        Math.sin(time * 0.22) * 0.12;
    }

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

    if (glowRef.current) {
      const glowPulse =
        1 +
        Math.sin(time * 2.0) * 0.105;

      glowRef.current.scale.setScalar(glowPulse);
    }
  });

  return (
    <group scale={[1.15, 1.15, 1.15]}>
      {/* Outer Geodesic Shell */}

      <mesh ref={outerWireRef}>
        <icosahedronGeometry args={[1.6, 2]} />

        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={1.8}
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
          emissiveIntensity={2.2}
          wireframe
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Central Singularity with Custom Fresnel Rim Light Shader */}

      <mesh ref={glowRef}>
        <sphereGeometry args={[0.52, 32, 32]} />

        <shaderMaterial
          vertexShader={fresnelVertexShader}
          fragmentShader={fresnelFragmentShader}
          uniforms={fresnelUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
