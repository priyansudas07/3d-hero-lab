'use client';

import React, {
  useEffect,
  useMemo,
  useRef,
} from 'react';

import {
  useFrame,
  ThreeEvent,
} from '@react-three/fiber';

import * as THREE from 'three';

import {
  SignalPropagator,
} from '../../core/3d/synaptic/SignalPropagator';

import {
  SpatialGrid,
} from '../../core/3d/synaptic/SpatialGrid';


/* =========================================================
   SHARED NETWORK TYPES
   ========================================================= */

export interface SynapticNetworkState {
  positions: Float32Array | null;

  adjacency:
    Map<number, number[]> | null;

  edges:
    Array<[number, number]>;

  signalIntensities:
    Map<number, number>;

  nodeCount:
    number;

  signalPropagator:
    SignalPropagator | null;

  nearbyFlags?:
    Uint8Array | null;

  hoveredNode?:
    number | null;
}

export type SynapticNetworkRef =
  React.MutableRefObject<SynapticNetworkState>;


/* =========================================================
   PROPS
   ========================================================= */

interface SynapticNodesProps {
  count?: number;

  interactionRadius?: number;

  attractionStrength?: number;

  primaryColor?: string;

  secondaryColor?: string;

  onNodeClick?: (
    nodeId: number
  ) => void;

  networkRef?: SynapticNetworkRef;
}


/* =========================================================
   COMPONENT
   ========================================================= */

export function SynapticNodes({
  count = 3500,

  interactionRadius = 2.5,

  attractionStrength = 0.25,

  primaryColor = '#00F0FF',

  secondaryColor = '#A040FF',

  onNodeClick,

  networkRef,
}: SynapticNodesProps) {

  const meshRef =
    useRef<THREE.InstancedMesh>(null);

  /* ---------------------------------------------------------
     Simulation systems
     --------------------------------------------------------- */

  const signalPropagator =
    useMemo(
      () => new SignalPropagator(),
      []
    );

  const spatialGrid =
    useMemo(
      () => new SpatialGrid(1.6),
      []
    );

  /* ---------------------------------------------------------
     Autonomous impulses timing (Delta-time based)
     --------------------------------------------------------- */

  const autoTimerRef = useRef(0);
  const nextAutoDelayRef = useRef(1.5);

  /* ---------------------------------------------------------
     Mouse & Hover State Tracking (Refs to prevent state overhead)
     --------------------------------------------------------- */

  const currentPointerWorld =
    useRef(
      new THREE.Vector3()
    );

  const hoveredNodeRef =
    useRef<number | null>(null);

  /* ---------------------------------------------------------
     Reusable objects
     --------------------------------------------------------- */

  const reusableDummy =
    useMemo(
      () => new THREE.Object3D(),
      []
    );

  const reusableColor =
    useMemo(
      () => new THREE.Color(),
      []
    );

  const neighborBuffer =
    useMemo(
      () => new Array<number>(),
      []
    );

  const nearbyFlags =
    useMemo(
      () => new Uint8Array(count),
      [count]
    );

  /* =========================================================
     GENERATE NETWORK
     ========================================================= */

  const {
    initialPositions,
    currentPositions,
    scales,
    baseColors,
    adjacencyList,
    edgePairs,
    connectedNodeIds,
  } = useMemo(() => {

    const initPos =
      new Float32Array(
        count * 3
      );

    const currPos =
      new Float32Array(
        count * 3
      );

    const scs =
      new Float32Array(
        count
      );

    const cols =
      new Float32Array(
        count * 3
      );

    const graph =
      new Map<number, number[]>();

    const edges:
      Array<[number, number]> =
      [];

    const c1 =
      new THREE.Color(
        primaryColor
      );

    const c2 =
      new THREE.Color(
        secondaryColor
      );

    /* -------------------------------------------------------
       Generate neural cloud
       ------------------------------------------------------- */

    for (
      let i = 0;
      i < count;
      i++
    ) {

      let x = 0;
      let y = 0;
      let z = 0;

      let scale =
        0.015;

      const type =
        Math.random();

      /* -----------------------------------------------------
         Central neural cloud
         ----------------------------------------------------- */

      if (
        type < 0.68
      ) {

        const radius =
          0.45 +
          Math.cbrt(
            Math.random()
          ) *
          2.25;

        const theta =
          Math.random() *
          Math.PI *
          2;

        const phi =
          Math.acos(
            2 *
            Math.random() -
            1
          );

        x =
          radius *
          Math.sin(phi) *
          Math.cos(theta);

        y =
          radius *
          Math.sin(phi) *
          Math.sin(theta);

        z =
          radius *
          Math.cos(phi);

        scale =
          0.014 +
          Math.random() *
          0.014;

      }

      /* -----------------------------------------------------
         Short axon structures
         ----------------------------------------------------- */

      else {

        const numAxons =
          6;

        const axonIndex =
          Math.floor(
            Math.random() *
            numAxons
          );

        const angle =
          (
            axonIndex /
            numAxons
          ) *
          Math.PI *
          2;

        const distance =
          1.2 +
          Math.pow(
            Math.random(),
            1.8
          ) *
          2.8;

        const spiral =
          distance *
          1.35;

        const dispersion =
          0.10 +
          distance *
          0.055;

        x =
          Math.cos(angle) *
          distance +
          Math.cos(spiral) *
          dispersion;

        y =
          Math.sin(angle) *
          distance +
          Math.sin(spiral) *
          dispersion;

        z =
          (
            Math.random() -
            0.5
          ) *
          distance *
          0.22;

        scale =
          0.011 +
          Math.random() *
          0.011;
      }

      const index =
        i * 3;

      initPos[index] =
        x;

      initPos[index + 1] =
        y;

      initPos[index + 2] =
        z;

      currPos[index] =
        x;

      currPos[index + 1] =
        y;

      currPos[index + 2] =
        z;

      scs[i] =
        scale;

      reusableColor
        .copy(c1)
        .lerp(
          c2,
          Math.random()
        );

      cols[index] =
        reusableColor.r;

      cols[index + 1] =
        reusableColor.g;

      cols[index + 2] =
        reusableColor.b;

      graph.set(
        i,
        []
      );
    }

    /* -------------------------------------------------------
       Build spatial grid
       ------------------------------------------------------- */

    spatialGrid.buildGrid(
      initPos,
      count
    );

    /* -------------------------------------------------------
       Build local graph
       ------------------------------------------------------- */

    const MAX_DEGREE =
      4;

    const CONNECTION_RADIUS =
      1.55;

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const neighbors:
        number[] =
        [];

      spatialGrid.getNeighbors(
        initPos[i * 3],
        initPos[i * 3 + 1],
        initPos[i * 3 + 2],
        CONNECTION_RADIUS,
        neighbors
      );

      for (
        let k = 0;
        k < neighbors.length;
        k++
      ) {

        const j =
          neighbors[k];

        if (
          j <= i
        ) {
          continue;
        }

        if (
          graph.get(i)!.length >=
          MAX_DEGREE
        ) {
          break;
        }

        if (
          graph.get(j)!.length >=
          MAX_DEGREE
        ) {
          continue;
        }

        graph
          .get(i)!
          .push(j);

        graph
          .get(j)!
          .push(i);

        edges.push(
          [i, j]
        );
      }
    }

    /*
     * Pre-filter nodes that have at least 1 neighbor connection
     */
    const validNodes: number[] = [];
    graph.forEach((neighbors, nodeId) => {
      if (neighbors.length > 0) {
        validNodes.push(nodeId);
      }
    });

    return {
      initialPositions:
        initPos,

      currentPositions:
        currPos,

      scales:
        scs,

      baseColors:
        cols,

      adjacencyList:
        graph,

      edgePairs:
        edges,

      connectedNodeIds:
        validNodes,
    };

  }, [
    count,
    primaryColor,
    secondaryColor,
    spatialGrid,
    reusableColor,
  ]);


  /* =========================================================
     PUBLISH NETWORK
     ========================================================= */

  useEffect(() => {

    if (!networkRef) {
      return;
    }

    networkRef.current.positions =
      currentPositions;

    networkRef.current.adjacency =
      adjacencyList;

    networkRef.current.edges =
      edgePairs;

    networkRef.current.nodeCount =
      count;

    networkRef.current.signalPropagator =
      signalPropagator;

    networkRef.current.nearbyFlags =
      nearbyFlags;

    networkRef.current.hoveredNode =
      hoveredNodeRef.current;

    return () => {

      if (
        networkRef.current.positions ===
        currentPositions
      ) {

        networkRef.current.positions =
          null;

        networkRef.current.adjacency =
          null;

        networkRef.current.edges =
          [];

        networkRef.current.signalIntensities
          .clear();

        networkRef.current.signalPropagator =
          null;

        networkRef.current.nearbyFlags =
          null;

        networkRef.current.hoveredNode =
          null;

        networkRef.current.nodeCount =
          0;
      }

    };

  }, [
    networkRef,
    currentPositions,
    adjacencyList,
    edgePairs,
    count,
    signalPropagator,
    nearbyFlags,
  ]);


  /* =========================================================
     INITIAL INSTANCE SETUP
     ========================================================= */

  useEffect(() => {

    const mesh =
      meshRef.current;

    if (!mesh) {
      return;
    }

    const colorAttribute =
      new THREE.InstancedBufferAttribute(
        new Float32Array(
          baseColors
        ),
        3
      );

    mesh.instanceColor =
      colorAttribute;

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const index =
        i * 3;

      reusableDummy.position.set(
        initialPositions[index],
        initialPositions[index + 1],
        initialPositions[index + 2]
      );

      reusableDummy.scale.setScalar(
        scales[i]
      );

      reusableDummy.updateMatrix();

      mesh.setMatrixAt(
        i,
        reusableDummy.matrix
      );
    }

    mesh.instanceMatrix
      .needsUpdate =
      true;

    mesh.instanceColor
      .needsUpdate =
      true;

  }, [
    count,
    initialPositions,
    scales,
    baseColors,
    reusableDummy,
  ]);


  /* =========================================================
     POINTER / HOVER HANDLERS
     ========================================================= */

  const handlePointerOver =
    (
      event: ThreeEvent<PointerEvent>
    ) => {

      event.stopPropagation();

      if (
        event.instanceId !== undefined
      ) {
        hoveredNodeRef.current =
          event.instanceId;
      }
    };

  const handlePointerOut =
    (
      event: ThreeEvent<PointerEvent>
    ) => {

      event.stopPropagation();

      hoveredNodeRef.current =
        null;
    };

  const handlePointerDown =
    (
      event: ThreeEvent<MouseEvent>
    ) => {

      event.stopPropagation();

      if (
        event.instanceId ===
        undefined
      ) {
        return;
      }

      const nodeId =
        event.instanceId;

      if (
        adjacencyList
      ) {

        signalPropagator.triggerSignal(
          nodeId,
          adjacencyList,
          2.4
        );
      }

      onNodeClick?.(
        nodeId
      );
    };


  /* =========================================================
     FRAME LOOP
     ========================================================= */

  useFrame(
    (
      state,
      delta
    ) => {

      const mesh =
        meshRef.current;

      if (!mesh) {
        return;
      }

      /* -----------------------------------------------------
         Publish hoveredNode state to shared networkRef
         ----------------------------------------------------- */

      if (networkRef) {
        networkRef.current.hoveredNode =
          hoveredNodeRef.current;
      }


      /* -----------------------------------------------------
         AUTONOMOUS PROBABILISTIC NEURAL IMPULSES
         ----------------------------------------------------- */

      autoTimerRef.current += delta;

      if (
        autoTimerRef.current >= nextAutoDelayRef.current &&
        connectedNodeIds.length > 0
      ) {
        autoTimerRef.current = 0;
        nextAutoDelayRef.current = 1.5 + Math.random() * 2.7;

        const randomStartNode =
          connectedNodeIds[
            Math.floor(Math.random() * connectedNodeIds.length)
          ];

        signalPropagator.triggerSignal(
          randomStartNode,
          adjacencyList,
          1.4
        );
      }


      /* -----------------------------------------------------
         Mouse world position
         ----------------------------------------------------- */

      const targetX =
        state.pointer.x *
        5.2;

      const targetY =
        state.pointer.y *
        3.8;

      currentPointerWorld.current.x =
        THREE.MathUtils.damp(
          currentPointerWorld.current.x,
          targetX,
          5,
          delta
        );

      currentPointerWorld.current.y =
        THREE.MathUtils.damp(
          currentPointerWorld.current.y,
          targetY,
          5,
          delta
        );


      /* -----------------------------------------------------
         Signal propagation
         ----------------------------------------------------- */

      const activeSignals =
        signalPropagator.update(
          delta
        );

      if (networkRef) {

        networkRef.current
          .signalIntensities =
          activeSignals;
      }


      /* -----------------------------------------------------
         Cursor neighborhood
         ----------------------------------------------------- */

      const numNear =
        spatialGrid.getNeighbors(
          currentPointerWorld.current.x,
          currentPointerWorld.current.y,
          0,
          interactionRadius,
          neighborBuffer
        );

      nearbyFlags.fill(0);

      for (
        let n = 0;
        n < numNear;
        n++
      ) {

        const index =
          neighborBuffer[n];

        if (
          index >= 0 &&
          index < count
        ) {
          nearbyFlags[index] =
            1;
        }
      }


      /* -----------------------------------------------------
         Hovered Node & 1-Hop Neighbor Lookup
         ----------------------------------------------------- */

      const currentHovered =
        hoveredNodeRef.current;

      const hoveredNeighbors =
        currentHovered !== null
          ? adjacencyList?.get(currentHovered)
          : null;


      /* -----------------------------------------------------
         Cursor repulsion
         ----------------------------------------------------- */

      for (
        let n = 0;
        n < numNear;
        n++
      ) {

        const i =
          neighborBuffer[n];

        if (
          i < 0 ||
          i >= count
        ) {
          continue;
        }

        const index =
          i * 3;

        const ix =
          initialPositions[index];

        const iy =
          initialPositions[index + 1];

        const iz =
          initialPositions[index + 2];

        const dx =
          ix -
          currentPointerWorld.current.x;

        const dy =
          iy -
          currentPointerWorld.current.y;

        const distSq =
          dx * dx +
          dy * dy;

        if (
          distSq >
          interactionRadius *
          interactionRadius
        ) {
          continue;
        }

        if (
          distSq <=
          0.0001
        ) {
          continue;
        }

        const dist =
          Math.sqrt(
            distSq
          );

        const factor =
          1 -
          dist /
          interactionRadius;

        const targetNodeX =
          ix +
          (
            dx /
            dist
          ) *
          factor *
          attractionStrength;

        const targetNodeY =
          iy +
          (
            dy /
            dist
          ) *
          factor *
          attractionStrength;

        currentPositions[index] =
          THREE.MathUtils.damp(
            currentPositions[index],
            targetNodeX,
            7,
            delta
          );

        currentPositions[index + 1] =
          THREE.MathUtils.damp(
            currentPositions[index + 1],
            targetNodeY,
            7,
            delta
          );

        currentPositions[index + 2] =
          THREE.MathUtils.damp(
            currentPositions[index + 2],
            iz,
            7,
            delta
          );
      }


      /* -----------------------------------------------------
         Update every node
         ----------------------------------------------------- */

      for (
        let i = 0;
        i < count;
        i++
      ) {

        const index =
          i * 3;

        const nodeZ =
          currentPositions[index + 2];

        /*
         * Subtle Z-Depth Factor (0.75 in background -> 1.15 in foreground)
         * Creates natural 3D volumetric layering without fog
         */
        const depthFactor =
          THREE.MathUtils.clamp(
            0.95 + nodeZ * 0.10,
            0.75,
            1.15
          );

        const signal =
          activeSignals.get(
            i
          ) ?? 0;

        const isDirectHover =
          i === currentHovered;

        const isHoverNeighbor =
          !isDirectHover &&
          hoveredNeighbors !== null &&
          hoveredNeighbors !== undefined &&
          hoveredNeighbors.includes(i);


        /* ---------------------------------------------------
           Return to base position
           --------------------------------------------------- */

        if (
          nearbyFlags[i] === 0
        ) {

          currentPositions[index] =
            THREE.MathUtils.damp(
              currentPositions[index],
              initialPositions[index],
              3.5,
              delta
            );

          currentPositions[index + 1] =
            THREE.MathUtils.damp(
              currentPositions[index + 1],
              initialPositions[index + 1],
              3.5,
              delta
            );

          currentPositions[index + 2] =
            THREE.MathUtils.damp(
              currentPositions[index + 2],
              initialPositions[index + 2],
              3.5,
              delta
            );
        }


        /* ---------------------------------------------------
           Node scale calculation (Strict Hierarchy + Depth)
           --------------------------------------------------- */

        let scale =
          scales[i] * depthFactor;

        /*
         * 1. Active traveling signal (1.5x - 2.0x)
         */
        if (
          signal > 0
        ) {

          scale *=
            1 +
            signal *
            2.0;
        }

        /*
         * 2. Direct Hover Focus (1.35x)
         */
        else if (
          isDirectHover
        ) {

          scale *= 1.35;
        }

        /*
         * 3. Hovered Neighbor (1.15x)
         */
        else if (
          isHoverNeighbor
        ) {

          scale *= 1.15;
        }

        /*
         * 4. Mouse-field neighborhood reaction (1.0x - 1.7x)
         */
        else if (
          nearbyFlags[i] !== 0
        ) {

          const dx =
            initialPositions[index] -
            currentPointerWorld.current.x;

          const dy =
            initialPositions[index + 1] -
            currentPointerWorld.current.y;

          const distance =
            Math.sqrt(
              dx * dx +
              dy * dy
            );

          if (
            distance <
            interactionRadius
          ) {

            const factor =
              1 -
              distance /
              interactionRadius;

            scale *=
              1 +
              factor *
              0.7;
          }
        }


        /* ---------------------------------------------------
           Matrix
           --------------------------------------------------- */

        reusableDummy.position.set(
          currentPositions[index],
          currentPositions[index + 1],
          currentPositions[index + 2]
        );

        reusableDummy.scale.setScalar(
          scale
        );

        reusableDummy.updateMatrix();

        mesh.setMatrixAt(
          i,
          reusableDummy.matrix
        );


        /* ---------------------------------------------------
           Color & Emissive Highlight (Strict Hierarchy + Depth)
           --------------------------------------------------- */

        const instanceColors =
          mesh.instanceColor;

        if (
          instanceColors
        ) {

          /*
           * 1. Active traveling signal (Pushes toward bright white)
           */
          if (
            signal > 0
          ) {

            instanceColors.setXYZ(
              i,

              THREE.MathUtils.lerp(
                baseColors[index],
                1,
                signal
              ),

              THREE.MathUtils.lerp(
                baseColors[index + 1],
                1,
                signal
              ),

              THREE.MathUtils.lerp(
                baseColors[index + 2],
                1,
                signal
              )

            );

          }

          /*
           * 2. Direct Hover Focus (Strong cyan/white preview)
           */
          else if (
            isDirectHover
          ) {

            instanceColors.setXYZ(
              i,

              THREE.MathUtils.lerp(
                baseColors[index],
                1,
                0.75
              ),

              THREE.MathUtils.lerp(
                baseColors[index + 1],
                1,
                0.75
              ),

              THREE.MathUtils.lerp(
                baseColors[index + 2],
                1,
                0.75
              )

            );

          }

          /*
           * 3. Hovered Neighbor (Subtle secondary highlight)
           */
          else if (
            isHoverNeighbor
          ) {

            instanceColors.setXYZ(
              i,

              THREE.MathUtils.lerp(
                baseColors[index],
                1,
                0.35
              ),

              THREE.MathUtils.lerp(
                baseColors[index + 1],
                1,
                0.35
              ),

              THREE.MathUtils.lerp(
                baseColors[index + 2],
                1,
                0.35
              )

            );

          }

          /*
           * 4. Mouse-field proximity highlight
           */
          else if (
            nearbyFlags[i] !== 0
          ) {

            instanceColors.setXYZ(
              i,

              THREE.MathUtils.lerp(
                baseColors[index] * depthFactor,
                1,
                0.20
              ),

              THREE.MathUtils.lerp(
                baseColors[index + 1] * depthFactor,
                1,
                0.20
              ),

              THREE.MathUtils.lerp(
                baseColors[index + 2] * depthFactor,
                1,
                0.20
              )

            );

          }

          /*
           * 5. Baseline state with subtle depth attenuation
           */
          else {

            instanceColors.setXYZ(
              i,

              baseColors[index] * depthFactor,
              baseColors[index + 1] * depthFactor,
              baseColors[index + 2] * depthFactor
            );
          }
        }
      }


      mesh.instanceMatrix
        .needsUpdate =
        true;

      if (
        mesh.instanceColor
      ) {

        mesh.instanceColor
          .needsUpdate =
          true;
      }
    }
  );


  /* =========================================================
     RENDER
     ========================================================= */

  return (

    <instancedMesh
      ref={meshRef}
      args={[
        undefined,
        undefined,
        count,
      ]}
      onPointerOver={
        handlePointerOver
      }
      onPointerOut={
        handlePointerOut
      }
      onPointerDown={
        handlePointerDown
      }
    >

      <sphereGeometry
        args={[
          1,
          6,
          6,
        ]}
      />

      <meshBasicMaterial
        transparent
        opacity={0.78}
        blending={
          THREE.AdditiveBlending
        }
        depthWrite={false}
      />

    </instancedMesh>
  );
}
