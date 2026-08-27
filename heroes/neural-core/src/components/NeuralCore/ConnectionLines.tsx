'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ConnectionLinesProps {
  nodeCount?: number;
  maxConnections?: number;
  maxDistance?: number;
  color?: string;
}

const vertexShader = `
  uniform float uTime;
  attribute float aProgress;
  varying float vProgress;

  void main() {
    vProgress = aProgress;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  varying float vProgress;

  void main() {
    // Wave pulse moving along line segment progress
    float pulse = sin((vProgress * 10.0) - (uTime * 3.0)) * 0.5 + 0.5;
    pulse = pow(pulse, 4.0); // Sharpen wave pulse peak

    vec3 finalColor = mix(uColor * 0.3, uColor * 1.5, pulse);
    float alpha = mix(0.15, 0.75, pulse);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export function ConnectionLines({
  nodeCount = 300,
  maxConnections = 450,
  maxDistance = 2.2,
  color = '#7000FF',
}: ConnectionLinesProps) {
  const lineRef = useRef<THREE.LineSegments>(null);

  // Compute node positions and line pairs based on spatial proximity
  const { lineGeometry, uniforms } = useMemo(() => {
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.2 + Math.cbrt(Math.random()) * 3.5;

      nodes.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )
      );
    }

    const linePositions: number[] = [];
    const lineProgress: number[] = [];
    let connectionCount = 0;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (connectionCount >= maxConnections) break;

        const dist = nodes[i].distanceTo(nodes[j]);
        if (dist < maxDistance) {
          linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z);
          linePositions.push(nodes[j].x, nodes[j].y, nodes[j].z);

          lineProgress.push(0.0, 1.0);
          connectionCount++;
        }
      }
      if (connectionCount >= maxConnections) break;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    geometry.setAttribute('aProgress', new THREE.Float32BufferAttribute(lineProgress, 1));

    const shaderUniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    };

    return { lineGeometry: geometry, uniforms: shaderUniforms };
  }, [nodeCount, maxConnections, maxDistance, color]);

  useFrame((state) => {
    if (lineRef.current) {
      (lineRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value =
        state.clock.elapsedTime;
      lineRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      lineRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
    }
  });

  return (
    <lineSegments ref={lineRef} geometry={lineGeometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </lineSegments>
  );
}
