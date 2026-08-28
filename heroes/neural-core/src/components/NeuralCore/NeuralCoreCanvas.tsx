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
   =========================================================

   IMPORTANT:

   This is now the ONLY component responsible for
   global rotation of the neural structure.

   CoreMesh
   SynapticNodes
   ConnectionLines

   all live inside this same coordinate system.
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
      new THREE.Vector3(0, 0, 0)
    );


  useFrame((state, delta) => {

    const group =
      groupRef.current;

    if (!group) {
      return;
    }


    const time =
      state.clock.elapsedTime;


    /* =====================================================
       MOUSE → 3D TILT
       ===================================================== */

    const mouseX =
      state.pointer.x;

    const mouseY =
      state.pointer.y;


    const targetX =
      mouseY * 0.30;

    const targetY =
      mouseX * 0.30;

    const targetZ =
      mouseX * -0.055;


    targetRotation.current.x =
      THREE.MathUtils.damp(
        targetRotation.current.x,
        targetX,
        4.0,
        delta
      );

    targetRotation.current.y =
      THREE.MathUtils.damp(
        targetRotation.current.y,
        targetY,
        4.0,
        delta
      );

    targetRotation.current.z =
      THREE.MathUtils.damp(
        targetRotation.current.z,
        targetZ,
        4.0,
        delta
      );


    /* =====================================================
       AUTONOMOUS 3D ROTATION

       X + Y are deliberately both active.

       This prevents the neural structure from appearing
       like a flat horizontally rotating object.
       ===================================================== */

    group.rotation.x =
      time * 0.045 +
      targetRotation.current.x;

    group.rotation.y =
      time * 0.115 +
      targetRotation.current.y;

    group.rotation.z =
      Math.sin(time * 0.14) * 0.025 +
      targetRotation.current.z;
  });


  return (
    <group
      ref={groupRef}
      scale={1.15}
    >

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
      />


      {/* =================================================
          SYNAPTIC NODE CLOUD
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
  ] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);


  /* =======================================================
     SHARED NETWORK STATE
     ======================================================= */

  const networkRef =
    useRef<SynapticNetworkState>({
      positions: null,

      adjacency: null,

      edges: [],

      signalIntensities:
        new Map(),

      nodeCount: 0,

      signalPropagator: null,
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

      {/* Atmospheric Background */}

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

          {/* Background */}

          <color
            attach="background"
            args={[
              backgroundColor,
            ]}
          />


          {/* Lighting */}

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
              ONE SHARED 3D NEURAL SYSTEM
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
              intensity={0.75}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              mipmapBlur
            />

            <Vignette
              eskil={false}
              offset={0.1}
              darkness={0.8}
            />

          </EffectComposer>


          {/* =================================================
              CAMERA CONTROL
              ================================================= */}

          <OrbitControls
            enableZoom={false}
            enablePan={false}

            minPolarAngle={0.05}

            maxPolarAngle={
              Math.PI - 0.05
            }

            enableDamping

            dampingFactor={0.08}

            rotateSpeed={0.65}
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
