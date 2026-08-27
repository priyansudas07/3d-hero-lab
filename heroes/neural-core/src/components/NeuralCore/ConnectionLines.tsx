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
  uniform vec2 uPointer;
  attribute float aProgress;
  varying float vProgress;
  varying float vPointerDist;

  void main() {
    vProgress = aProgress;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vPointerDist = distance(worldPosition.xy, uPointer * 5.0);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  varying float vProgress;
  varying float vPointerDist;

  void main() {
    // Wave pulse
    float pulse = sin((vProgress * 10.0) - (uTime * 2.0)) * 0.5 + 0.5;
    pulse = pow(pulse, 5.0);

    // Cursor proximity flare within 3.0 units radius
    float cursorFlare = smoothstep(3.5, 0.5, vPointerDist);

    vec3 finalColor = mix(uColor * 0.2, uColor * (1.5 + cursorFlare * 1.5), pulse + cursorFlare * 0.4);
    float alpha = mix(0.04, 0.7, pulse + cursorFlare * 0.3);

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
  const currentPointer = useRef(new THREE.Vector2(0, 0));

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
      uPointer: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color(color) },
    };

    return { lineGeometry: geometry, uniforms: shaderUniforms };
  }, [nodeCount, maxConnections, maxDistance, color]);

  useFrame((state, delta) => {
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = state.clock.elapsedTime;

      // Dampened cursor position for smooth GLSL flare
      currentPointer.current.x = THREE.MathUtils.damp(currentPointer.current.x, state.pointer.x, 5, delta);
      currentPointer.current.y = THREE.MathUtils.damp(currentPointer.current.y, state.pointer.y, 5, delta);
      mat.uniforms.uPointer.value.copy(currentPointer.current);

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
