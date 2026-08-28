'use client';

import React, {
  useMemo,
  useRef,
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

interface ConnectionLinesProps {
  networkRef:
    SynapticNetworkRef;

  color?:
    string;
}


/* =========================================================
   VERTEX SHADER
   ========================================================= */

const vertexShader = `

  attribute float aSignal;

  varying float vSignal;

  void main() {

    vSignal = aSignal;

    vec4 worldPosition =
      modelMatrix *
      vec4(position, 1.0);

    gl_Position =
      projectionMatrix *
      viewMatrix *
      worldPosition;

  }

`;


/* =========================================================
   FRAGMENT SHADER
   ========================================================= */

const fragmentShader = `

  uniform float uTime;

  uniform vec3 uColor;

  varying float vSignal;


  void main() {

    float base = 0.16;

    float pulse =
      sin(uTime * 4.0) *
      0.5 +
      0.5;

    float signal =
      vSignal *
      (
        0.65 +
        pulse * 0.35
      );

    float intensity =
      base +
      signal * 2.2;

    vec3 finalColor =
      uColor *
      intensity;

    float alpha =
      0.055 +
      signal * 0.55;

    gl_FragColor =
      vec4(
        finalColor,
        alpha
      );

  }

`;


/* =========================================================
   COMPONENT
   ========================================================= */

export function ConnectionLines({
  networkRef,
  color = '#A040FF',
}: ConnectionLinesProps) {
  const lineRef =
    useRef<THREE.LineSegments>(null);

  const globalGroupRef =
    useRef<THREE.Group>(null);

  const pointer =
    useRef(
      new THREE.Vector2(0, 0)
    );


  const MAX_EDGES =
    2500;


  /* =======================================================
     GEOMETRY
     ======================================================= */

  const geometry =
    useMemo(() => {
      const positions =
        new Float32Array(
          MAX_EDGES * 2 * 3
        );

      const signal =
        new Float32Array(
          MAX_EDGES * 2
        );

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
        'aSignal',

        new THREE.BufferAttribute(
          signal,
          1
        )
      );

      geo.setDrawRange(0, 0);

      return geo;
    }, []);


  /* =======================================================
     SHADER UNIFORMS
     ======================================================= */

  const uniforms =
    useMemo(
      () => ({
        uTime: {
          value: 0,
        },

        uColor: {
          value:
            new THREE.Color(color),
        },
      }),
      [color]
    );


  /* =======================================================
     FRAME LOOP
     ======================================================= */

  useFrame(
    (state, delta) => {
      const line =
        lineRef.current;

      if (!line) {
        return;
      }


      const time =
        state.clock.elapsedTime;


      /* ---------------------------------------------------
         SAME GLOBAL 3D ROTATION AS CORE + NODES
         --------------------------------------------------- */

      const targetX =
        state.pointer.y * 0.42;

      const targetY =
        state.pointer.x * 0.42;

      const targetZ =
        -state.pointer.x * 0.12;


      pointer.current.x =
        THREE.MathUtils.damp(
          pointer.current.x,
          targetX,
          4.5,
          delta
        );

      pointer.current.y =
        THREE.MathUtils.damp(
          pointer.current.y,
          targetY,
          4.5,
          delta
        );


      if (globalGroupRef.current) {
        globalGroupRef.current.rotation.x =
          time * 0.105 +
          pointer.current.x;

        globalGroupRef.current.rotation.y =
          time * 0.17 +
          pointer.current.y;

        globalGroupRef.current.rotation.z =
          Math.sin(time * 0.11) *
          0.055 +
          targetZ;
      }


      /* ---------------------------------------------------
         NETWORK
         --------------------------------------------------- */

      const network =
        networkRef.current;

      if (
        !network.positions ||
        network.edges.length === 0
      ) {
        geometry.setDrawRange(0, 0);
        return;
      }


      const positionAttribute =
        geometry.getAttribute(
          'position'
        ) as THREE.BufferAttribute;

      const signalAttribute =
        geometry.getAttribute(
          'aSignal'
        ) as THREE.BufferAttribute;


      const positions =
        network.positions;

      const edges =
        network.edges;

      const signals =
        network.signalIntensities;


      const edgeCount =
        Math.min(
          edges.length,
          MAX_EDGES
        );


      /* ---------------------------------------------------
         UPDATE EDGE POSITIONS
         --------------------------------------------------- */

      for (
        let i = 0;
        i < edgeCount;
        i++
      ) {
        const [a, b] =
          edges[i];

        const aIndex =
          a * 3;

        const bIndex =
          b * 3;

        const vertexA =
          i * 2;

        const vertexB =
          vertexA + 1;


        positionAttribute.setXYZ(
          vertexA,

          positions[aIndex],
          positions[aIndex + 1],
          positions[aIndex + 2]
        );


        positionAttribute.setXYZ(
          vertexB,

          positions[bIndex],
          positions[bIndex + 1],
          positions[bIndex + 2]
        );


        const signalA =
          signals.get(a) ?? 0;

        const signalB =
          signals.get(b) ?? 0;


        signalAttribute.setX(
          vertexA,
          signalA
        );

        signalAttribute.setX(
          vertexB,
          signalB
        );
      }


      positionAttribute.needsUpdate =
        true;

      signalAttribute.needsUpdate =
        true;


      geometry.setDrawRange(
        0,
        edgeCount * 2
      );


      /* ---------------------------------------------------
         SHADER TIME
         --------------------------------------------------- */

      const material =
        line.material as THREE.ShaderMaterial;

      material.uniforms.uTime.value =
        time;

      material.uniforms.uColor.value
        .set(color);
    }
  );


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <group ref={globalGroupRef}>
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
          uniforms={uniforms}
          transparent
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
