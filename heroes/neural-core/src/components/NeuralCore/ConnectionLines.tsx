'use client';

import React, {
  useMemo,
  useRef,
} from 'react';

import {
  useFrame,
} from '@react-three/fiber';

import * as THREE from 'three';

import {
  SynapticNetworkRef,
} from '../../core/3d/synaptic/SynapticNetwork';

interface ConnectionLinesProps {
  networkRef: SynapticNetworkRef;
  color?: string;
}

const vertexShader = `
  uniform float uTime;

  attribute float aProgress;

  varying float vProgress;

  void main() {

    vProgress = aProgress;

    vec4 worldPosition =
      modelMatrix *
      vec4(position, 1.0);

    gl_Position =
      projectionMatrix *
      viewMatrix *
      worldPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;

  varying float vProgress;

  void main() {

    /*
     * Continuous traveling pulse.
     */

    float wave =
      sin(
        vProgress * 12.0 -
        uTime * 2.0
      );

    wave =
      wave * 0.5 + 0.5;

    wave =
      pow(wave, 7.0);

    float intensity =
      0.10 +
      wave * 0.55;

    vec3 finalColor =
      uColor * intensity;

    float alpha =
      0.08 +
      wave * 0.30;

    gl_FragColor =
      vec4(
        finalColor,
        alpha
      );
  }
`;

export function ConnectionLines({
  networkRef,
  color = '#A040FF',
}: ConnectionLinesProps) {

  const lineRef =
    useRef<THREE.LineSegments>(null);

  /*
   * Maximum number of edges.
   *
   * This prevents accidental
   * massive GPU buffers.
   */

  const MAX_EDGES = 5000;

  const geometry = useMemo(() => {

    const positions =
      new Float32Array(
        MAX_EDGES * 6
      );

    const progress =
      new Float32Array(
        MAX_EDGES * 2
      );

    /*
     * Each edge has:
     *
     * endpoint A = 0
     * endpoint B = 1
     */

    for (
      let i = 0;
      i < MAX_EDGES;
      i++
    ) {

      progress[i * 2] = 0;
      progress[i * 2 + 1] = 1;
    }

    const geo =
      new THREE.BufferGeometry();

    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    geo.setAttribute(
      'aProgress',
      new THREE.BufferAttribute(
        progress,
        1
      )
    );

    geo.setDrawRange(
      0,
      0
    );

    return geo;

  }, []);

  const uniforms = useMemo(() => ({
    uTime: {
      value: 0,
    },

    uColor: {
      value: new THREE.Color(
        color
      ),
    },
  }), [color]);

  useFrame((state) => {

    const line =
      lineRef.current;

    if (!line) return;

    const network =
      networkRef.current;

    if (
      !network.positions ||
      network.edges.length === 0
    ) {
      return;
    }

    const positionAttribute =
      geometry.getAttribute(
        'position'
      ) as THREE.BufferAttribute;

    const positions =
      network.positions;

    const edges =
      network.edges;

    const edgeCount =
      Math.min(
        edges.length,
        MAX_EDGES
      );

    /*
     * Update line endpoints
     * using the ACTUAL node positions.
     */

    for (
      let i = 0;
      i < edgeCount;
      i++
    ) {

      const [
        a,
        b,
      ] = edges[i];

      const aIndex =
        a * 3;

      const bIndex =
        b * 3;

      positionAttribute.setXYZ(
        i * 2,
        positions[aIndex],
        positions[aIndex + 1],
        positions[aIndex + 2]
      );

      positionAttribute.setXYZ(
        i * 2 + 1,
        positions[bIndex],
        positions[bIndex + 1],
        positions[bIndex + 2]
      );
    }

    positionAttribute.needsUpdate =
      true;

    geometry.setDrawRange(
      0,
      edgeCount * 2
    );

    /*
     * Shader animation.
     */

    const material =
      line.material as THREE.ShaderMaterial;

    material.uniforms.uTime.value =
      state.clock.elapsedTime;

  });

  return (
    <lineSegments
      ref={lineRef}
      geometry={geometry}
    >

      <shaderMaterial
        vertexShader={
          vertexShader
        }

        fragmentShader={
          fragmentShader
        }

        uniforms={
          uniforms
        }

        transparent
        blending={
          THREE.AdditiveBlending
        }

        depthWrite={false}
      />

    </lineSegments>
  );
}
