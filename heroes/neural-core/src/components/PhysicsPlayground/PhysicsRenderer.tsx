'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PhysicsSimulation, PhysicsMode } from '../../core/3d/physics/PhysicsSimulation';

interface PhysicsRendererProps {
  count?: number;
  mode?: PhysicsMode;
  isMouseDown?: boolean;
  gravityStrength?: number;
  forceStrength?: number;
  damping?: number;
  color?: string;
}

const vertexShader = `
  attribute vec3 aVelocity;
  varying float vSpeed;

  void main() {
    vSpeed = length(aVelocity);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (2.0 + vSpeed * 3.5) * (18.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  varying float vSpeed;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, dist) * 0.85;
    vec3 finalColor = mix(uColor, vec3(1.0, 1.0, 1.0), min(vSpeed * 0.25, 1.0));

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export function PhysicsRenderer({
  count = 12000,
  mode = 'ATTRACT',
  isMouseDown = false,
  gravityStrength = 0.5,
  forceStrength = 3.0,
  damping = 0.95,
  color = '#00F0FF',
}: PhysicsRendererProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const simulation = useMemo(() => new PhysicsSimulation(count), [count]);
  const pointerWorld = useRef(new THREE.Vector3(0, 0, 0));

  const { geometry, uniforms } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(simulation.positions, 3));
    geom.setAttribute('aVelocity', new THREE.BufferAttribute(simulation.velocities, 3));

    const shaderUniforms = {
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

    // Smooth pointer target position
    const targetX = state.pointer.x * 6.0;
    const targetY = state.pointer.y * 4.0;

    pointerWorld.current.x = THREE.MathUtils.damp(pointerWorld.current.x, targetX, 5, delta);
    pointerWorld.current.y = THREE.MathUtils.damp(pointerWorld.current.y, targetY, 5, delta);

    // Update Numerical Integration Physics
    simulation.update(
      delta,
      pointerWorld.current,
      isMouseDown,
      mode,
      gravityStrength,
      forceStrength,
      damping
    );

    // Update GPU attributes in-place
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const velAttr = pointsRef.current.geometry.attributes.aVelocity as THREE.BufferAttribute;

    posAttr.needsUpdate = true;
    velAttr.needsUpdate = true;
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
