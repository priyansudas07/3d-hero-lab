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
     * Very subtle inactive network.
     */
    float base =
      0.12;


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
      0.045 +
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
           Endpoint signal
           ------------------------------------------------- */

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

        const activeSignals =
          propagator.getActiveSignals();


        for (
          let i = 0;

          i <
          Math.min(
            activeSignals.length,
            MAX_SIGNAL_PULSES
          );

          i++
        ) {

          const signal =
            activeSignals[i];

          if (
            signal.nextNode ===
            null
          ) {
            continue;
          }

          const from =
            signal.activeNode;

          const to =
            signal.nextNode;

          const fromIndex =
            from * 3;

          const toIndex =
            to * 3;


          /*
           * Interpolate the pulse between
           * the two nodes.
           */
          const px =
            THREE.MathUtils.lerp(
              positions[fromIndex],
              positions[toIndex],
              signal.progress
            );

          const py =
            THREE.MathUtils.lerp(
              positions[fromIndex + 1],
              positions[toIndex + 1],
              signal.progress
            );

          const pz =
            THREE.MathUtils.lerp(
              positions[fromIndex + 2],
              positions[toIndex + 2],
              signal.progress
            );


          /*
           * Tiny line segment gives the
           * pulse a directional appearance.
           */
          const trail =
            0.055;


          const trailProgress =
            Math.max(
              0,
              signal.progress -
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
            signal.intensity *
            0.45
          );

          pulseSignalAttribute.setX(
            vertexB,
            signal.intensity
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


  /*
   * Signal material reference.
   */
  const signalMaterialRef =
    useRef<THREE.ShaderMaterial>(
      null
    );


  /* =======================================================
     RENDER
     ======================================================= */

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
