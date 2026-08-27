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
    float pulse = sin((vProgress * 12.0) - (uTime * 2.5)) * 0.5 + 0.5;
    pulse = pow(pulse, 5.0);

    vec3 finalColor = mix(uColor * 0.25, uColor * 1.6, pulse);
    float alpha = mix(0.05, 0.6, pulse);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export function ConnectionLines({
  nodeCount = 200,
  maxConnections = 300,
  maxDistance = 2.0,
  color = '#A040FF',
}: ConnectionLinesProps) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const { lineGeometry, uniforms } = useMemo(() => {
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 3.2 + Math.cbrt(Math.random()) * 3.2;

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
    const connectionCounts = new Uint8Array(nodes.length);
    let totalConnections = 0;

    for (let i = 0; i < nodes.length; i++) {
      if (connectionCounts[i] >= 3) continue; // Cap max 3 connections per node to prevent starbursts

      for (let j = i + 1; j < nodes.length; j++) {
        if (totalConnections >= maxConnections) break;
        if (connectionCounts[j] >= 3) continue;

        const dist = nodes[i].distanceTo(nodes[j]);
        if (dist < maxDistance) {
          linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z);
          linePositions.push(nodes[j].x, nodes[j].y, nodes[j].z);

          lineProgress.push(0.0, 1.0);
          connectionCounts[i]++;
          connectionCounts[j]++;
          totalConnections++;
        }
      }
      if (totalConnections >= maxConnections) break;
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
      lineRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      lineRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.015) * 0.05;
    }
  });

  return (
    <lineSegments ref={lineRef} geometry={lineGeometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}
