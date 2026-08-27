'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FluidSimulation } from '../../core/3d/fluid/FluidSimulation';

interface FluidParticleRendererProps {
  count?: number;
  forceRadius?: number;
  forceStrength?: number;
  vortexStrength?: number;
  damping?: number;
  turbulence?: number;
  color?: string;
}

const vertexShader = `
  uniform float uTime;
  attribute vec3 aVelocity;
  varying vec3 vVelocity;
  varying float vSpeed;

  void main() {
    vVelocity = aVelocity;
    vSpeed = length(aVelocity);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (1.5 + vSpeed * 8.0) * (20.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  varying vec3 vVelocity;
  varying float vSpeed;

  void main() {
    // Soft circular particle disc
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, dist) * 0.75;
    vec3 finalColor = mix(uColor * 0.5, vec3(1.0, 1.0, 1.0), min(vSpeed * 2.0, 1.0));

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export function FluidParticleRenderer({
  count = 25000,
  forceRadius = 3.0,
  forceStrength = 2.5,
  vortexStrength = 1.8,
  damping = 0.96,
  turbulence = 0.4,
  color = '#00F0FF',
}: FluidParticleRendererProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const simulation = useMemo(() => new FluidSimulation(count), [count]);
  const pointerWorld = useRef(new THREE.Vector3(0, 0, 0));

  const { geometry, uniforms } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(simulation.positions, 3));
    geom.setAttribute('aVelocity', new THREE.BufferAttribute(simulation.velocities, 3));

    const shaderUniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    };

    return { geometry: geom, uniforms: shaderUniforms };
  }, [simulation, color]);

  useEffect(() => {
    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.aVelocity.needsUpdate = true;
    }
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    // Dampened cursor position target
    const targetX = state.pointer.x * 6.0;
    const targetY = state.pointer.y * 4.0;

    pointerWorld.current.x = THREE.MathUtils.damp(pointerWorld.current.x, targetX, 5, delta);
    pointerWorld.current.y = THREE.MathUtils.damp(pointerWorld.current.y, targetY, 5, delta);

    // Update Fluid Physics Simulation
    simulation.update(
      delta,
      pointerWorld.current,
      forceRadius,
      forceStrength,
      vortexStrength,
      damping,
      turbulence
    );

    // Update GPU Buffer Attributes directly without re-allocations
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const velAttr = pointsRef.current.geometry.attributes.aVelocity as THREE.BufferAttribute;

    posAttr.needsUpdate = true;
    velAttr.needsUpdate = true;

    (pointsRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
