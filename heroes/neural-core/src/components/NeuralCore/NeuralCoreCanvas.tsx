'use client';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Canvas,
} from '@react-three/fiber';

import {
  OrbitControls,
} from '@react-three/drei';

import {
  CoreMesh,
} from './CoreMesh';

import {
  SynapticNodes,
  SynapticNetworkState,
} from './SynapticNodes';

import {
  ConnectionLines,
} from './ConnectionLines';


/* =========================================================
   PROPS
   ========================================================= */

export interface SynapticNodeCloudProps {

  nodeCount?:
    number;

  interactionRadius?:
    number;

  attractionStrength?:
    number;

  primaryColor?:
    string;

  secondaryColor?:
    string;

  backgroundColor?:
    string;

  className?:
    string;

}


/* =========================================================
   COMPONENT
   ========================================================= */

export function NeuralCoreCanvas({
  nodeCount = 3500,

  interactionRadius = 2.5,

  attractionStrength = 0.25,

  primaryColor = '#00F0FF',

  secondaryColor = '#A040FF',

  backgroundColor = '#030308',

  className = '',

}: SynapticNodeCloudProps) {


  /* =======================================================
     CLIENT MOUNT
     ======================================================= */

  const [
    mounted,
    setMounted,
  ] =
    useState(false);


  useEffect(() => {

    setMounted(true);

  }, []);


  /* =======================================================
     SHARED NETWORK

     SynapticNodes writes into this.
     ConnectionLines reads from it.
     ======================================================= */

  const networkRef =
    useRef<SynapticNetworkState>({
      positions: null,

      adjacency: null,

      edges: [],

      signalIntensities:
        new Map(),

      nodeCount: 0,
    });


  /* =======================================================
     SSR FALLBACK
     ======================================================= */

  if (!mounted) {

    return (

      <div
        className={`
          relative
          w-full
          h-screen
          flex
          items-center
          justify-center
          bg-[#030308]
          text-white
          ${className}
        `}
      >

        <div
          className="
            text-center
            animate-pulse
          "
        >

          <div
            className="
              w-16
              h-16
              border-4
              border-[#00F0FF]
              border-t-transparent
              rounded-full
              animate-spin
              mx-auto
              mb-4
            "
          />

          <p
            className="
              text-sm
              tracking-widest
              uppercase
              text-cyan-400
              font-mono
            "
          >
            Loading Synaptic Engine...
          </p>

        </div>

      </div>

    );

  }


  /* =======================================================
     MAIN SCENE
     ======================================================= */

  return (

    <div
      className={`
        relative
        w-full
        h-screen
        overflow-hidden
        bg-[#030308]
        ${className}
      `}
    >

      {/* =================================================
          WEBGL
          ================================================= */}

      <div
        className="
          absolute
          inset-0
          z-0
        "
      >

        <Canvas

          camera={{
            position: [
              0,
              0,
              11,
            ],

            fov: 50,

            near: 0.1,

            far: 100,
          }}

          dpr={[
            1,
            2,
          ]}

          gl={{
            antialias: true,

            alpha: true,

            powerPreference:
              'high-performance',
          }}

        >

          {/* =============================================
              BACKGROUND
              ============================================= */}

          <color
            attach="background"
            args={[
              backgroundColor,
            ]}
          />


          {/* =============================================
              LIGHTING
              ============================================= */}

          <ambientLight
            intensity={0.35}
          />


          <directionalLight
            position={[
              8,
              8,
              6,
            ]}
            intensity={1.2}
            color={
              primaryColor
            }
          />


          <pointLight
            position={[
              -6,
              -6,
              -4,
            ]}
            intensity={0.8}
            color={
              secondaryColor
            }
          />


          {/* =============================================
              CENTRAL CORE
              ============================================= */}

          <CoreMesh

            primaryColor={
              primaryColor
            }

            secondaryColor={
              secondaryColor
            }

          />


          {/* =============================================
              SYNAPTIC NODES

              This generates the ONLY network.
              ============================================= */}

          <SynapticNodes

            count={
              nodeCount
            }

            interactionRadius={
              interactionRadius
            }

            attractionStrength={
              attractionStrength
            }

            primaryColor={
              primaryColor
            }

            secondaryColor={
              secondaryColor
            }

            networkRef={
              networkRef
            }

          />


          {/* =============================================
              CONNECTIONS

              Reads the exact same network.
              ============================================= */}

          <ConnectionLines

            networkRef={
              networkRef
            }

            color={
              secondaryColor
            }

          />


          {/* =============================================
              CAMERA CONTROL
              ============================================= */}

          <OrbitControls

            enableZoom={
              false
            }

            enablePan={
              false
            }

            minPolarAngle={
              0.05
            }

            maxPolarAngle={
              Math.PI - 0.05
            }

            enableDamping={
              true
            }

            dampingFactor={
              0.08
            }

            rotateSpeed={
              0.65
            }

          />

        </Canvas>

      </div>


      {/* =================================================
          HUD
          ================================================= */}

      <div
        className="
          absolute
          bottom-6
          left-6
          z-10
          pointer-events-none
          font-mono
          text-[11px]
          text-cyan-400/80
          bg-slate-950/40
          backdrop-blur-md
          px-3
          py-1.5
          rounded-lg
          border
          border-cyan-500/20
        "
      >

        SYNAPTIC NODE CLOUD
        {' // '}
        CLICK NODE TO TRIGGER IMPULSE

      </div>

    </div>

  );

}
