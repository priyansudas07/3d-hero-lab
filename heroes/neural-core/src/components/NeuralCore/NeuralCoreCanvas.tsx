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

import {
  AmbientParticleField,
} from './AmbientParticleField';


/* =========================================================
   PROPS
   ========================================================= */

export interface SynapticNodeCloudProps {

  nodeCount?: number;

  interactionRadius?: number;

  attractionStrength?: number;

  primaryColor?: string;

  secondaryColor?: string;

  backgroundColor?: string;

  className?: string;
}


/* =========================================================
   SHARED NEURAL SYSTEM
   ========================================================= */

interface NeuralSystemProps {

  nodeCount: number;

  interactionRadius: number;

  attractionStrength: number;

  primaryColor: string;

  secondaryColor: string;

  networkRef:
    React.MutableRefObject<SynapticNetworkState>;
}


/* =========================================================
   NEURAL SYSTEM
   ========================================================= */

function NeuralSystem({
  nodeCount,
  interactionRadius,
  attractionStrength,
  primaryColor,
  secondaryColor,
  networkRef,
}: NeuralSystemProps) {

  const groupRef =
    useRef<THREE.Group>(null);


  const targetRotation =
    useRef(
      new THREE.Vector3(
        0,
        0,
        0
      )
    );


  const currentRotation =
    useRef(
      new THREE.Vector3(
        0,
        0,
        0
      )
    );


  /* =======================================================
     GLOBAL 3D MOTION
     ======================================================= */

  useFrame(
    (
      state,
      delta
    ) => {

      const group =
        groupRef.current;

      if (!group) {
        return;
      }


      const time =
        state.clock.elapsedTime;


      /* =====================================================
         MOUSE → TRUE 3D TILT
         ===================================================== */

      const mouseX =
        state.pointer.x;

      const mouseY =
        state.pointer.y;


      /*
       * Vertical mouse movement tilts around X.
       *
       * Horizontal mouse movement tilts around Y.
       *
       * Small Z component creates a subtle banking motion.
       */

      const targetX =
        mouseY *
        0.28;

      const targetY =
        mouseX *
        0.34;

      const targetZ =
        -mouseX *
        0.045;


      targetRotation.current.x =
        targetX;

      targetRotation.current.y =
        targetY;

      targetRotation.current.z =
        targetZ;


      /* =====================================================
         SMOOTH MOUSE RESPONSE
         ===================================================== */

      currentRotation.current.x =
        THREE.MathUtils.damp(
          currentRotation.current.x,
          targetRotation.current.x,
          4.0,
          delta
        );


      currentRotation.current.y =
        THREE.MathUtils.damp(
          currentRotation.current.y,
          targetRotation.current.y,
          4.0,
          delta
        );


      currentRotation.current.z =
        THREE.MathUtils.damp(
          currentRotation.current.z,
          targetRotation.current.z,
          4.0,
          delta
        );


      /* =====================================================
         AUTONOMOUS 3D ROTATION
         ===================================================== */

      /*
       * All three axes contribute to the motion.
       *
       * X = slow orbital tilt
       * Y = primary rotation
       * Z = subtle organic banking
       */

      const autoX =
        time *
        0.042;

      const autoY =
        time *
        0.105;

      const autoZ =
        Math.sin(
          time *
          0.12
        ) *
        0.035;


      group.rotation.x =
        autoX +
        currentRotation.current.x;


      group.rotation.y =
        autoY +
        currentRotation.current.y;


      group.rotation.z =
        autoZ +
        currentRotation.current.z;
    }
  );


  /* =========================================================
     RENDER
     ========================================================= */

  return (

    <group
      ref={groupRef}
      scale={1.15}
    >

      {/* =================================================
          AMBIENT ATMOSPHERIC DUST
          ================================================= */}

      <AmbientParticleField
        count={220}
        spread={14.0}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />


      {/* =================================================
          CENTRAL CORE
          ================================================= */}

      <CoreMesh
        primaryColor={
          primaryColor
        }

        secondaryColor={
          secondaryColor
        }

        rotationSpeed={1}

        networkRef={
          networkRef
        }
      />


      {/* =================================================
          SYNAPTIC NODES
          ================================================= */}

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


      {/* =================================================
          CONNECTION NETWORK
          ================================================= */}

      <ConnectionLines
        networkRef={
          networkRef
        }

        color={
          secondaryColor
        }
      />

    </group>
  );
}


/* =========================================================
   MAIN CANVAS
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
     ======================================================= */

  const networkRef =
    useRef<SynapticNetworkState>({
      positions: null,

      adjacency: null,

      edges: [],

      signalIntensities:
        new Map(),

      nodeCount: 0,

      signalPropagator:
        null,
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
     MAIN
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
          ATMOSPHERIC BACKGROUND
          ================================================= */}

      <div
        className="
          absolute
          inset-0
          z-0
          pointer-events-none
          bg-[radial-gradient(circle_at_center,_rgba(0,240,255,0.08)_0%,_rgba(160,64,255,0.04)_45%,_rgba(3,3,8,1)_85%)]
        "
      />


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

          {/* =================================================
              BACKGROUND
              ================================================= */}

          <color
            attach="background"
            args={[
              backgroundColor,
            ]}
          />


          {/* =================================================
              LIGHTING
              ================================================= */}

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


          {/* =================================================
              ONE GLOBAL NEURAL SYSTEM
              ================================================= */}

          <NeuralSystem
            nodeCount={
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


          {/* =================================================
              POST PROCESSING
              ================================================= */}

          <EffectComposer>

            <Bloom
              intensity={0.65}
              luminanceThreshold={0.25}
              luminanceSmoothing={0.85}
              mipmapBlur
            />

            <Vignette
              eskil={false}
              offset={0.1}
              darkness={0.8}
            />

          </EffectComposer>


          {/* =================================================
              MANUAL CAMERA INTERACTION
              ================================================= */}

          <OrbitControls

            enableZoom={false}

            enablePan={false}

            minPolarAngle={
              0.05
            }

            maxPolarAngle={
              Math.PI -
              0.05
            }

            enableDamping

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
