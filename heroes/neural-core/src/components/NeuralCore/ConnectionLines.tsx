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
   VERTEX SHADER (WITH Z-DEPTH PASS-THROUGH)
   ========================================================= */

const vertexShader = `

  attribute float aSignal;

  varying float vSignal;

  varying float vDepthFactor;

  void main() {

    vSignal =
      aSignal;

    vec4 worldPosition =
      modelMatrix *
      vec4(
        position,
        1.0
      );

    vec4 viewPosition =
      viewMatrix *
      worldPosition;

    /*
     * View-space depth factor:
     * Subtle attenuation (0.80 in background -> 1.15 in foreground)
     */
    vDepthFactor =
      clamp(0.95 + position.z * 0.08, 0.80, 1.15);

    gl_Position =
      projectionMatrix *
      viewPosition;
  }

`;


/* =========================================================
   FRAGMENT SHADER
   ========================================================= */

const fragmentShader = `

  uniform float uTime;

  uniform vec3 uColor;

  varying float vSignal;

  varying float vDepthFactor;


  void main() {

    /*
     * Extremely subtle inactive network with depth attenuation.
     */
    float base =
      0.075 * vDepthFactor;


    /*
     * Soft global breathing.
     */
    float breathing =
      sin(
        uTime * 1.2
      ) *
      0.5 +
      0.5;


    /*
     * Signal intensity.
     */
    float signal =
      vSignal;


    /*
     * Stronger signal response.
     */
    float intensity =
      base +
      signal *
      (
        2.8 +
        breathing *
        0.7
      );


    vec3 finalColor =
      uColor *
      intensity;


    float alpha =
      (0.025 * vDepthFactor) +
      signal *
      0.75;


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

  const signalMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  /*
   * Maximum normal network edges.
   */
  const MAX_EDGES =
    2500;


  /*
   * Additional geometry for traveling pulses.
   *
   * Each pulse gets its own tiny line segment.
   */
  const MAX_SIGNAL_PULSES =
    12;


  /* =======================================================
     BASE NETWORK GEOMETRY
     ======================================================= */

  const geometry =
    useMemo(() => {

      const positions =
        new Float32Array(
          MAX_EDGES *
          2 *
          3
        );

      const signal =
        new Float32Array(
          MAX_EDGES *
          2
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
     SIGNAL PULSE GEOMETRY
     ======================================================= */

  const signalGeometry =
    useMemo(() => {

      const positions =
        new Float32Array(
          MAX_SIGNAL_PULSES *
          2 *
          3
        );

      const signal =
        new Float32Array(
          MAX_SIGNAL_PULSES *
          2
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
     SIGNAL UNIFORMS
     ======================================================= */

  const signalUniforms =
    useMemo(
      () => ({

        uTime: {
          value: 0,
        },

        uColor: {
          value:
            new THREE.Color(
              '#FFFFFF'
            ),
        },

      }),
      []
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

        signalGeometry.setDrawRange(
          0,
          0
        );

        return;
      }


      /* ===================================================
         BASE NETWORK
         =================================================== */

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

      const nearbyFlags =
        network.nearbyFlags;

      const hoveredNode =
        network.hoveredNode;

      const edgeCount =
        Math.min(
          edges.length,
          MAX_EDGES
        );


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
           Position A
           ------------------------------------------------- */

        positionAttribute.setXYZ(
          vertexA,

          positions[aIndex],

          positions[aIndex + 1],

          positions[aIndex + 2]
        );


        /* -------------------------------------------------
           Position B
           ------------------------------------------------- */

        positionAttribute.setXYZ(
          vertexB,

          positions[bIndex],

          positions[bIndex + 1],

          positions[bIndex + 2]
        );


        /* -------------------------------------------------
           Endpoint signal & cursor influence
           ------------------------------------------------- */

        let signalA =
          signals.get(a) ??
          0;

        let signalB =
          signals.get(b) ??
          0;

        /*
         * Hovered Node Edge Boost:
         * If either endpoint touches the currently hovered node,
         * boost edge brightness to provide direct focus preview.
         */
        if (hoveredNode !== null && hoveredNode !== undefined) {
          if (a === hoveredNode || b === hoveredNode) {
            signalA = Math.max(signalA, 0.45);
            signalB = Math.max(signalB, 0.45);
          }
        }

        /*
         * Mouse Proximity Boost:
         * Require both endpoints near cursor for subtle edge highlight.
         */
        if (nearbyFlags && nearbyFlags[a] !== 0 && nearbyFlags[b] !== 0) {
          signalA = Math.max(signalA, 0.16);
          signalB = Math.max(signalB, 0.16);
        }

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
         TRAVELING SIGNAL PULSES
         =================================================== */

      const pulsePositionAttribute =
        signalGeometry.getAttribute(
          'position'
        ) as THREE.BufferAttribute;

      const pulseSignalAttribute =
        signalGeometry.getAttribute(
          'aSignal'
        ) as THREE.BufferAttribute;

      const propagator =
        network.signalPropagator;

      let pulseCount =
        0;


      if (
        propagator
      ) {

        const signalEdges =
          propagator.getSignalEdges();

        const nodeCount =
          network.nodeCount;


        for (
          let i = 0;

          i <
          Math.min(
            signalEdges.length,
            MAX_SIGNAL_PULSES
          );

          i++
        ) {

          const signalEdge =
            signalEdges[i];

          const from =
            signalEdge.from;

          const to =
            signalEdge.to;

          /*
           * Validate node indices safely.
           */
          if (
            from < 0 ||
            from >= nodeCount ||
            to < 0 ||
            to >= nodeCount
          ) {
            continue;
          }

          const fromIndex =
            from * 3;

          const toIndex =
            to * 3;


          /*
           * Interpolate pulse head (bright lead).
           */
          const px =
            THREE.MathUtils.lerp(
              positions[fromIndex],
              positions[toIndex],
              signalEdge.progress
            );

          const py =
            THREE.MathUtils.lerp(
              positions[fromIndex + 1],
              positions[toIndex + 1],
              signalEdge.progress
            );

          const pz =
            THREE.MathUtils.lerp(
              positions[fromIndex + 2],
              positions[toIndex + 2],
              signalEdge.progress
            );


          /*
           * Short 6% directional trailing segment behind pulse head.
           */
          const trail =
            0.06;


          const trailProgress =
            Math.max(
              0,
              signalEdge.progress -
                trail
            );


          const tx =
            THREE.MathUtils.lerp(
              positions[fromIndex],
              positions[toIndex],
              trailProgress
            );

          const ty =
            THREE.MathUtils.lerp(
              positions[fromIndex + 1],
              positions[toIndex + 1],
              trailProgress
            );

          const tz =
            THREE.MathUtils.lerp(
              positions[fromIndex + 2],
              positions[toIndex + 2],
              trailProgress
            );


          const vertexA =
            pulseCount * 2;

          const vertexB =
            vertexA + 1;


          pulsePositionAttribute.setXYZ(
            vertexA,

            tx,
            ty,
            tz
          );

          pulsePositionAttribute.setXYZ(
            vertexB,

            px,
            py,
            pz
          );


          pulseSignalAttribute.setX(
            vertexA,
            signalEdge.intensity *
            0.35
          );

          pulseSignalAttribute.setX(
            vertexB,
            signalEdge.intensity *
            1.8
          );


          pulseCount++;
        }
      }


      pulsePositionAttribute.needsUpdate =
        true;

      pulseSignalAttribute.needsUpdate =
        true;

      signalGeometry.setDrawRange(
        0,
        pulseCount * 2
      );


      /* ===================================================
         TIME
         =================================================== */

      const time =
        state.clock.elapsedTime;

      const material =
        line.material as THREE.ShaderMaterial;

      material.uniforms
        .uTime
        .value =
        time;

      material.uniforms
        .uColor
        .value
        .set(color);


      const pulseMaterial =
        signalMaterialRef.current;

      if (
        pulseMaterial
      ) {

        pulseMaterial.uniforms
          .uTime
          .value =
          time;
      }
    }
  );


  /* =======================================================
     RENDER
     ========================================================= */

  return (

    <>

      {/* -----------------------------------------------
          Normal synaptic network
          ----------------------------------------------- */}

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


      {/* -----------------------------------------------
          Traveling signal pulses
          ----------------------------------------------- */}

      <lineSegments
        geometry={
          signalGeometry
        }
      >

        <shaderMaterial

          ref={
            signalMaterialRef
          }

          vertexShader={
            vertexShader
          }

          fragmentShader={
            fragmentShader
          }

          uniforms={
            signalUniforms
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

    </>
  );
}
