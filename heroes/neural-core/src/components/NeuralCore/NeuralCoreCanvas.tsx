'use client';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Canvas,
  useFrame,
  useThree,
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

  showHUD?: boolean;
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
   NEURAL SYSTEM (RESPONSIVE 3D FRAMING)
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

  const { viewport } = useThree();

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

  /*
   * Smooth dynamic scale & perceived vertical centering based on viewport width
   * (Phase 6.5.2 Vertical Composition Tuning)
   * The axon starburst and atmospheric cloud have subtle upward visual energy,
   * so a subtle responsive Y-offset balances top and bottom breathing room.
   */
  const responsiveScale =
    viewport.width < 5.5
      ? 0.98
      : viewport.width < 8.5
      ? 1.18
      : 1.40;

  const responsivePositionY =
    viewport.width < 5.5
      ? -0.15
      : viewport.width < 8.5
      ? -0.22
      : -0.30;


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

      const tiltAmountX =
        0.35;

      const tiltAmountY =
        0.55;

      const tiltAmountZ =
        0.12;

      targetRotation.current.x =
        -mouseY *
        tiltAmountX;

      targetRotation.current.y =
        mouseX *
        tiltAmountY;

      targetRotation.current.z =
        mouseX *
        mouseY *
        tiltAmountZ;


      /* =====================================================
         SMOOTH DAMPING
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
      scale={responsiveScale}
      position={[0, responsivePositionY, 0]}
    >

      {/* =================================================
          AMBIENT ATMOSPHERIC DUST
          ================================================= */}

      <AmbientParticleField
        count={180}
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
   MAIN CANVAS (COMMERCIAL REUSABLE COMPONENT)
   ========================================================= */

export function NeuralCoreCanvas({
  nodeCount = 3500,

  interactionRadius = 2.5,

  attractionStrength = 0.25,

  primaryColor = '#00F0FF',

  secondaryColor = '#A040FF',

  backgroundColor = '#030308',

  className = '',

  showHUD = true,
}: SynapticNodeCloudProps) {


  /* =======================================================
     CLIENT MOUNT & DEVICE PROFILE DETECTION
     ======================================================= */

  const [
    mounted,
    setMounted,
  ] =
    useState(false);

  const [
    isMobileDevice,
    setIsMobileDevice,
  ] =
    useState(false);


  useEffect(() => {

    setMounted(true);

    if (typeof window !== 'undefined') {
      const isMobile =
        window.innerWidth < 768 ||
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      setIsMobileDevice(isMobile);
    }

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
          h-full
          min-h-[400px]
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
              mx-auto
              mb-4
              rounded-full
              border
              border-cyan-400/40
              border-t-cyan-400
              animate-spin
            "
          />

          <p
            className="
              font-mono
              text-xs
              text-cyan-400/70
              tracking-wider
            "
          >

            INITIALIZING NEURAL CORE...

          </p>

        </div>

      </div>
    );
  }


  /* =======================================================
     ADAPTIVE PERFORMANCE PARAMETERS
     ======================================================= */

  /*
   * On mobile devices, clamp node count and DPR gracefully to ensure 60fps
   */
  const effectiveNodeCount =
    isMobileDevice ? Math.min(nodeCount, 2200) : nodeCount;

  const targetDpr: [number, number] =
    isMobileDevice ? [1, 1.5] : [1, 2];


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div
      className={`
        relative
        w-full
        h-screen
        overflow-hidden
        ${className}
      `}
    >

      {/* =================================================
          ATMOSPHERIC RADIAL GLOW
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
          WEBGL CANVAS
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

          dpr={targetDpr}

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
              effectiveNodeCount
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
          HUD (CONFIGURABLE)
          ================================================= */}

      {showHUD && (
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
      )}

    </div>
  );
}
