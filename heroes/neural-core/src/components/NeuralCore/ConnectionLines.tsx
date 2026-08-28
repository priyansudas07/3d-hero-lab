'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SynapticNetworkRef } from '../../core/3d/synaptic/SynapticNetwork';

interface ConnectionLinesProps {
  networkRef?: SynapticNetworkRef;
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
    float pulse = sin((vProgress * 10.0) - (uTime * 2.0)) * 0.5 + 0.5;
    pulse = pow(pulse, 5.0);

    float cursorFlare = smoothstep(3.5, 0.5, vPointerDist);

    vec3 finalColor = mix(uColor * 0.2, uColor * (1.5 + cursorFlare * 1.5), pulse + cursorFlare * 0.4);
    float alpha = mix(0.04, 0.7, pulse + cursorFlare * 0.3);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export function ConnectionLines({
  networkRef,
  color = '#A040FF',
}: ConnectionLinesProps) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const currentPointer = useRef(new THREE.Vector2(0, 0));

  const { lineGeometry, uniforms } = useMemo(() => {
    const edgePairs = networkRef?.current?.edges || [];
    const positions = new Float32Array(Math.max(edgePairs.length * 6, 6));
    const progress = new Float32Array(Math.max(edgePairs.length * 2, 2));

    for (let e = 0; e < edgePairs.length; e++) {
      progress[e * 2] = 0.0;
      progress[e * 2 + 1] = 1.0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aProgress', new THREE.Float32BufferAttribute(progress, 1));

    const shaderUniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color(color) },
    };

    return { lineGeometry: geometry, uniforms: shaderUniforms };
  }, [networkRef, color]);

  useFrame((state, delta) => {
    if (!lineRef.current) return;
    const mat = lineRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = state.clock.elapsedTime;

    currentPointer.current.x = THREE.MathUtils.damp(currentPointer.current.x, state.pointer.x, 5, delta);
    currentPointer.current.y = THREE.MathUtils.damp(currentPointer.current.y, state.pointer.y, 5, delta);
    mat.uniforms.uPointer.value.copy(currentPointer.current);

    const positionsAttr = lineRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const stateNet = networkRef?.current;

    if (stateNet && stateNet.positions && stateNet.edges.length > 0) {
      const pos = stateNet.positions;
      const edges = stateNet.edges;

      for (let e = 0; e < edges.length; e++) {
        const [a, b] = edges[e];
        const aIndex = a * 3;
        const bIndex = b * 3;

        positionsAttr.setXYZ(e * 2, pos[aIndex], pos[aIndex + 1], pos[aIndex + 2]);
        positionsAttr.setXYZ(e * 2 + 1, pos[bIndex], pos[bIndex + 1], pos[bIndex + 2]);
      }
      positionsAttr.needsUpdate = true;
    }

    lineRef.current.rotation.y = state.clock.elapsedTime * 0.025;
    lineRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.04;
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
