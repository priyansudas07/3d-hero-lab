'use client';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Canvas,
  useFrame,
} from '@react-three/fiber';

import {
  OrbitControls,
} from '@react-three/drei';

import {
  EffectComposer,
  Bloom,
  Vignette,
} from '@react-three/postprocessing';

import * as THREE from 'three';

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
   NEURAL SYSTEM (SHARED ANIMATED GROUP)
   ========================================================= */

interface NeuralSystemProps {
  nodeCount: number;
  interactionRadius: number;
  attractionStrength: number;
  primaryColor: string;
  secondaryColor: string;
  networkRef: React.MutableRefObject<SynapticNetworkState>;
}

function NeuralSystem({
  nodeCount,
  interactionRadius,
  attractionStrength,
  primaryColor,
  secondaryColor,
  networkRef,
}: {
  nodeCount: number;
  interactionRadius: number;
  attractionStrength: number;
  primaryColor: string;
  secondaryColor: string;
  networkRef: React.MutableRefObject<SynapticNetworkState>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const rotation = useRef(
    new THREE.Vector3(0, 0, 0)
  );

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    /*
     * Mouse controls the COMPLETE neural structure.
     *
     * X = vertical tilt
     * Y = horizontal tilt
     * Z = subtle banking
     */

    const targetX =
      state.pointer.y * 0.32;

    const targetY =
      state.pointer.x * 0.32;

    const targetZ =
      state.pointer.x * -0.08;

    rotation.current.x =
      THREE.MathUtils.damp(
        rotation.current.x,
        targetX,
        4,
        delta
      );

    rotation.current.y =
      THREE.MathUtils.damp(
        rotation.current.y,
        targetY,
        4,
        delta
      );

    rotation.current.z =
      THREE.MathUtils.damp(
        rotation.current.z,
        targetZ,
        4,
        delta
      );

    /*
     * Autonomous 3D rotation.
     *
     * Both X and Y rotate continuously.
     */

    groupRef.current.rotation.x =
      time * 0.055 +
      rotation.current.x;

    groupRef.current.rotation.y =
      time * 0.12 +
      rotation.current.y;

    groupRef.current.rotation.z =
      Math.sin(time * 0.15) * 0.035 +
      rotation.current.z;
  });

  return (
    <group ref={groupRef} scale={1.15}>
      <CoreMesh
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />

      <SynapticNodes
        count={nodeCount}
        interactionRadius={interactionRadius}
        attractionStrength={attractionStrength}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        networkRef={networkRef}
      />

      <ConnectionLines
        networkRef={networkRef}
        color={secondaryColor}
      />
    </group>
  );
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

      {/* Atmospheric Background Backdrop Lighting */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(0,240,255,0.08)_0%,_rgba(160,64,255,0.04)_45%,_rgba(3,3,8,1)_85%)] pointer-events-none" />

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
              NEURAL SYSTEM (SHARED ROTATION GROUP)
              ============================================= */}

          <NeuralSystem
            nodeCount={nodeCount}
            interactionRadius={interactionRadius}
            attractionStrength={attractionStrength}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            networkRef={networkRef}
          />


          {/* =============================================
              POST PROCESSING (Bloom & Ethereal Glow)
              ============================================= */}

          <EffectComposer>
            <Bloom
              intensity={0.75}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.1} darkness={0.8} />
          </EffectComposer>


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
