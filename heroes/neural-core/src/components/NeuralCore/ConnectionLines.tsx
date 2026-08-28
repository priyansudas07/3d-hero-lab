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

    vSignal =
      aSignal;

    vec4 worldPosition =
      modelMatrix *
      vec4(
        position,
        1.0
      );

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

    /*
     * Base network visibility.
     */

    float base =
      0.16;


    /*
     * Signal traveling through the network.
     */

    float pulse =
      sin(
        uTime * 4.0
      ) *
      0.5 +
      0.5;


    float signal =
      vSignal *
      (
        0.65 +
        pulse * 0.35
      );


    /*
     * Signal becomes significantly brighter
     * than the inactive network.
     */

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
    useRef<THREE.LineSegments>(
      null
    );


  /*
   * Hard GPU safety limit.
   *
   * The graph itself is much smaller because every node
   * has a limited degree.
   */

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


      geo.setDrawRange(
        0,
        0
      );


      return geo;

    }, []);


  /* =======================================================
     UNIFORMS
     ======================================================= */

  const uniforms =
    useMemo(
      () => ({

        uTime: {
          value: 0,
        },

        uColor: {
          value:
            new THREE.Color(
              color
            ),
        },

      }),
      [color]
    );


  /* =======================================================
     FRAME LOOP
     ======================================================= */

  useFrame(
    (state) => {

      const line =
        lineRef.current;


      if (!line) {
        return;
      }


      const network =
        networkRef.current;


      if (
        !network.positions ||
        network.edges.length === 0
      ) {

        geometry.setDrawRange(
          0,
          0
        );

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


      /* ===================================================
         UPDATE EDGE POSITIONS
         =================================================== */

      for (
        let i = 0;
        i < edgeCount;
        i++
      ) {

        const [
          a,
          b,
        ] =
          edges[i];


        const aIndex =
          a * 3;


        const bIndex =
          b * 3;


        const vertexA =
          i * 2;


        const vertexB =
          vertexA + 1;


        /* -------------------------------------------------
           Endpoint A
           ------------------------------------------------- */

        positionAttribute.setXYZ(
          vertexA,

          positions[aIndex],

          positions[aIndex + 1],

          positions[aIndex + 2]
        );


        /* -------------------------------------------------
           Endpoint B
           ------------------------------------------------- */

        positionAttribute.setXYZ(
          vertexB,

          positions[bIndex],

          positions[bIndex + 1],

          positions[bIndex + 2]
        );


        /* =================================================
           SIGNAL INTENSITY

           Signal can travel through a connection if either
           endpoint is active.
           ================================================= */

        const signalA =
          signals.get(a) ??
          0;


        const signalB =
          signals.get(b) ??
          0;


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


      /* ===================================================
         SHADER TIME
         =================================================== */

      const material =
        line.material as THREE.ShaderMaterial;


      material.uniforms
        .uTime
        .value =
        state.clock.elapsedTime;


      /* ===================================================
         COLOR
         =================================================== */

      material.uniforms
        .uColor
        .value
        .set(color);

    }
  );


  /* =======================================================
     RENDER
     ======================================================= */

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

        depthWrite={
          false
        }

      />

    </lineSegments>

  );

}
