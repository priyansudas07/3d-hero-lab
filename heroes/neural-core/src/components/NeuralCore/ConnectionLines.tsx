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
    // Pulse waves moving along axon paths
    float pulse = sin((vProgress * 10.0) - (uTime * 2.0)) * 0.5 + 0.5;
    pulse = pow(pulse, 5.0);

    vec3 finalColor = mix(uColor * 0.2, uColor * 1.5, pulse);
    float alpha = mix(0.04, 0.55, pulse);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export function ConnectionLines({
  nodeCount = 200,
  maxConnections = 250,
  maxDistance = 2.2,
  color = '#A040FF',
}: ConnectionLinesProps) {
  const lineRef = useRef<THREE.LineSegments>(null);

  // Generate line connections along axon branch structures
  const { lineGeometry, uniforms } = useMemo(() => {
    const nodes: THREE.Vector3[] = [];
    const numAxons = 6;
    const axonAngles = Array.from({ length: numAxons }, (_, i) => (i / numAxons) * Math.PI * 2.0);

    for (let i = 0; i < nodeCount; i++) {
      const axonIdx = i % numAxons;
      const baseAngle = axonAngles[axonIdx];
      const distAlongAxon = 1.2 + (i / nodeCount) * 5.0;

      const spiralAngle = distAlongAxon * 1.2;
      const dispersionRadius = 0.2 + (distAlongAxon * 0.1);

      nodes.push(
        new THREE.Vector3(
          Math.cos(baseAngle) * distAlongAxon + Math.cos(spiralAngle) * dispersionRadius,
          Math.sin(baseAngle) * distAlongAxon + Math.sin(spiralAngle) * dispersionRadius,
          (Math.random() - 0.5) * (distAlongAxon * 0.3)
        )
      );
    }

    const linePositions: number[] = [];
    const lineProgress: number[] = [];
    const connectionCounts = new Uint8Array(nodes.length);
    let totalConnections = 0;

    for (let i = 0; i < nodes.length; i++) {
      if (connectionCounts[i] >= 2) continue;

      for (let j = i + 1; j < nodes.length; j++) {
        if (totalConnections >= maxConnections) break;
        if (connectionCounts[j] >= 2) continue;

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
      lineRef.current.rotation.y = state.clock.elapsedTime * 0.025;
      lineRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.04;
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
