'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SignalPropagator } from '../../core/3d/synaptic/SignalPropagator';
import { SpatialGrid } from '../../core/3d/synaptic/SpatialGrid';
import { SynapticNetworkRef } from '../../core/3d/synaptic/SynapticNetwork';

interface SynapticNodesProps {
  count?: number;
  interactionRadius?: number;
  attractionStrength?: number;
  primaryColor?: string;
  secondaryColor?: string;
  onNodeClick?: (nodeId: number) => void;
  networkRef?: SynapticNetworkRef;
}

const MAX_GRAPH_NODES = 1000;
const MAX_CONNECTIONS_PER_NODE = 5;

export function SynapticNodes({
  count = 3500,
  interactionRadius = 2.5,
  attractionStrength = 0.25,
  primaryColor = '#00F0FF',
  secondaryColor = '#A040FF',
  onNodeClick,
  networkRef,
}: SynapticNodesProps) {
  const nodeMeshRef = useRef<THREE.InstancedMesh>(null);
  const connectionRef = useRef<THREE.LineSegments>(null);

  const signalPropagator = useMemo(
    () => new SignalPropagator(),
    []
  );

  const spatialGrid = useMemo(
    () => new SpatialGrid(2.5),
    []
  );

  const pointerWorld = useRef(new THREE.Vector3());
  const pointerTarget = useRef(new THREE.Vector3());

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  const neighborBuffer = useMemo<number[]>(
    () => [],
    []
  );

  /*
   * ---------------------------------------------------------
   * NODE GENERATION
   * ---------------------------------------------------------
   */

  const {
    initialPositions,
    currentPositions,
    velocities,
    scales,
    baseColors,
    adjacencyList,
    edgePairs,
  } = useMemo(() => {
    const initial = new Float32Array(count * 3);
    const current = new Float32Array(count * 3);

    const velocity = new Float32Array(count * 3);
    const nodeScales = new Float32Array(count);

    const colors = new Float32Array(count * 3);

    const graph = new Map<number, number[]>();
    const edges: Array<[number, number]> = [];

    const c1 = new THREE.Color(primaryColor);
    const c2 = new THREE.Color(secondaryColor);

    const numAxons = 6;

    const axonAngles = Array.from(
      { length: numAxons },
      (_, i) => (i / numAxons) * Math.PI * 2
    );

    /*
     * Generate structured neural distribution
     */

    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      let z = 0;

      let scale = 0.015;

      const type = Math.random();

      /*
       * CENTRAL CORE
       */

      if (type < 0.32) {
        const radius =
          0.6 +
          Math.pow(Math.random(), 0.55) * 1.7;

        const theta =
          Math.random() * Math.PI * 2;

        const phi =
          Math.acos(2 * Math.random() - 1);

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
          0.018 +
          Math.random() * 0.018;
      }

      /*
       * NEURAL AXONS
       */

      else {
        const axon =
          Math.floor(
            Math.random() * numAxons
          );

        const baseAngle =
          axonAngles[axon];

        const distance =
          1.4 +
          Math.pow(Math.random(), 1.4) * 6;

        const spiral =
          distance * 1.15;

        const dispersion =
          0.15 +
          distance * 0.09;

        x =
          Math.cos(baseAngle) *
            distance +
          Math.cos(spiral) *
            dispersion;

        y =
          Math.sin(baseAngle) *
            distance +
          Math.sin(spiral) *
            dispersion;

        z =
          (Math.random() - 0.5) *
          distance *
          0.35;

        scale =
          0.011 +
          Math.random() * 0.014;
      }

      initial[i * 3] = x;
      initial[i * 3 + 1] = y;
      initial[i * 3 + 2] = z;

      current[i * 3] = x;
      current[i * 3 + 1] = y;
      current[i * 3 + 2] = z;

      /*
       * Small initial velocity.
       */

      velocity[i * 3] =
        (Math.random() - 0.5) * 0.015;

      velocity[i * 3 + 1] =
        (Math.random() - 0.5) * 0.015;

      velocity[i * 3 + 2] =
        (Math.random() - 0.5) * 0.015;

      nodeScales[i] = scale;

      /*
       * Gradient node color.
       */

      color.copy(c1).lerp(
        c2,
        Math.random()
      );

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      graph.set(i, []);
    }

    /*
     * -------------------------------------------------------
     * BUILD SPATIAL GRID
     * -------------------------------------------------------
     */

    spatialGrid.buildGrid(
      initial,
      count
    );

    /*
     * Only build the visible network from a controlled
     * number of nodes.
     */

    const graphNodeCount =
      Math.min(
        count,
        MAX_GRAPH_NODES
      );

    for (
      let i = 0;
      i < graphNodeCount;
      i++
    ) {
      const neighbors: number[] = [];

      spatialGrid.getNeighbors(
        initial[i * 3],
        initial[i * 3 + 1],
        initial[i * 3 + 2],
        2.2,
        neighbors
      );

      /*
       * Sort by distance so we prefer
       * the closest neural neighbors.
       */

      neighbors.sort((a, b) => {
        const ax =
          initial[a * 3] -
          initial[i * 3];

        const ay =
          initial[a * 3 + 1] -
          initial[i * 3 + 1];

        const az =
          initial[a * 3 + 2] -
          initial[i * 3 + 2];

        const bx =
          initial[b * 3] -
          initial[i * 3];

        const by =
          initial[b * 3 + 1] -
          initial[i * 3 + 1];

        const bz =
          initial[b * 3 + 2] -
          initial[i * 3 + 2];

        return (
          ax * ax +
          ay * ay +
          az * az -
          (bx * bx +
            by * by +
            bz * bz)
        );
      });

      let connectionCount = 0;

      for (const j of neighbors) {
        if (
          j <= i ||
          j >= graphNodeCount
        ) {
          continue;
        }

        if (
          connectionCount >=
          MAX_CONNECTIONS_PER_NODE
        ) {
          break;
        }

        graph.get(i)!.push(j);
        graph.get(j)!.push(i);

        edges.push([i, j]);

        connectionCount++;
      }
    }

    if (networkRef) {
      networkRef.current = {
        positions: current,
        adjacency: graph,
        edges,
        nodeCount: count,
      };
    }

    return {
      initialPositions: initial,
      currentPositions: current,
      velocities: velocity,
      scales: nodeScales,
      baseColors: colors,
      adjacencyList: graph,
      edgePairs: edges,
    };
  }, [
    count,
    primaryColor,
    secondaryColor,
    spatialGrid,
    networkRef,
  ]);

  /*
   * ---------------------------------------------------------
   * INITIAL NODE MATRICES + COLORS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const mesh =
      nodeMeshRef.current;

    if (!mesh) return;

    const instanceColors =
      new THREE.InstancedBufferAttribute(
        new Float32Array(baseColors),
        3
      );

    mesh.instanceColor =
      instanceColors;

    for (
      let i = 0;
      i < count;
      i++
    ) {
      dummy.position.set(
        initialPositions[i * 3],
        initialPositions[i * 3 + 1],
        initialPositions[i * 3 + 2]
      );

      dummy.scale.setScalar(
        scales[i]
      );

      dummy.updateMatrix();

      mesh.setMatrixAt(
        i,
        dummy.matrix
      );
    }

    mesh.instanceMatrix.needsUpdate =
      true;

    instanceColors.needsUpdate =
      true;
  }, [
    count,
    initialPositions,
    baseColors,
    scales,
    dummy,
  ]);

  /*
   * ---------------------------------------------------------
   * CONNECTION GEOMETRY
   * ---------------------------------------------------------
   */

  const connectionGeometry =
    useMemo(() => {
      const positions =
        new Float32Array(
          edgePairs.length * 6
        );

      const colors =
        new Float32Array(
          edgePairs.length * 6
        );

      return {
        positions,
        colors,
      };
    }, [edgePairs]);

  /*
   * ---------------------------------------------------------
   * CLICK
   * ---------------------------------------------------------
   */

  const handlePointerDown = (
    event: ThreeEvent<MouseEvent>
  ) => {
    event.stopPropagation();

    if (
      event.instanceId === undefined
    ) {
      return;
    }

    const nodeId =
      event.instanceId;

    signalPropagator.triggerSignal(
      nodeId,
      adjacencyList
    );

    onNodeClick?.(nodeId);
  };

  /*
   * ---------------------------------------------------------
   * FRAME LOOP
   * ---------------------------------------------------------
   */

  useFrame(
    (state, delta) => {
      const mesh =
        nodeMeshRef.current;

      if (!mesh) return;

      const elapsed =
        state.clock.elapsedTime;

      /*
       * -----------------------------------------------------
       * POINTER
       * -----------------------------------------------------
       */

      pointerTarget.current.set(
        state.pointer.x * 6,
        state.pointer.y * 4,
        0
      );

      pointerWorld.current.x =
        THREE.MathUtils.damp(
          pointerWorld.current.x,
          pointerTarget.current.x,
          5,
          delta
        );

      pointerWorld.current.y =
        THREE.MathUtils.damp(
          pointerWorld.current.y,
          pointerTarget.current.y,
          5,
          delta
        );

      /*
       * -----------------------------------------------------
       * SIGNALS
       * -----------------------------------------------------
       */

      const activeSignals =
        signalPropagator.update(
          delta
        );

      const instanceColors =
        mesh.instanceColor;

      /*
       * -----------------------------------------------------
       * FIND NEARBY NODES
       * -----------------------------------------------------
       */

      const nearbyCount =
        spatialGrid.getNeighbors(
          pointerWorld.current.x,
          pointerWorld.current.y,
          pointerWorld.current.z,
          interactionRadius,
          neighborBuffer
        );

      /*
       * Clear/reuse a Set only for nearby
       * nodes. This avoids checking every
       * node against the cursor.
       */

      const nearbySet =
        new Set<number>();

      for (
        let i = 0;
        i < nearbyCount;
        i++
      ) {
        nearbySet.add(
          neighborBuffer[i]
        );
      }

      /*
       * -----------------------------------------------------
       * UPDATE NODES
       * -----------------------------------------------------
       */

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const index = i * 3;

        const baseX =
          initialPositions[index];

        const baseY =
          initialPositions[index + 1];

        const baseZ =
          initialPositions[index + 2];

        let targetX = baseX;
        let targetY = baseY;
        let targetZ = baseZ;

        /*
         * Organic idle movement.
         */

        const idleX =
          Math.sin(
            elapsed * 0.45 +
            i * 0.17
          ) * 0.012;

        const idleY =
          Math.cos(
            elapsed * 0.37 +
            i * 0.11
          ) * 0.012;

        const idleZ =
          Math.sin(
            elapsed * 0.31 +
            i * 0.07
          ) * 0.008;

        targetX += idleX;
        targetY += idleY;
        targetZ += idleZ;

        /*
         * ---------------------------------------------------
         * CURSOR FORCE
         * ---------------------------------------------------
         */

        if (
          nearbySet.has(i)
        ) {
          const dx =
            baseX -
            pointerWorld.current.x;

          const dy =
            baseY -
            pointerWorld.current.y;

          const distanceSq =
            dx * dx +
            dy * dy;

          if (
            distanceSq <
              interactionRadius *
                interactionRadius &&
            distanceSq > 0.00001
          ) {
            const distance =
              Math.sqrt(
                distanceSq
              );

            const normalized =
              1 -
              distance /
                interactionRadius;

            /*
             * Smooth falloff.
             */

            const falloff =
              normalized *
              normalized;

            /*
             * REPULSION
             *
             * Nodes push away from
             * the cursor.
             */

            targetX +=
              (dx / distance) *
              falloff *
              attractionStrength;

            targetY +=
              (dy / distance) *
              falloff *
              attractionStrength;

            /*
             * Slight Z displacement
             * creates depth.
             */

            targetZ +=
              falloff * 0.15;

            /*
             * Cursor proximity increases
             * node scale.
             */

            const scale =
              scales[i] *
              (1 +
                falloff *
                  1.4);

            dummy.scale.setScalar(
              scale
            );
          } else {
            dummy.scale.setScalar(
              scales[i]
            );
          }
        } else {
          dummy.scale.setScalar(
            scales[i]
          );
        }

        /*
         * ---------------------------------------------------
         * SPRING BACK TO BASE POSITION
         * ---------------------------------------------------
         */

        currentPositions[index] =
          THREE.MathUtils.damp(
            currentPositions[index],
            targetX,
            5.5,
            delta
          );

        currentPositions[index + 1] =
          THREE.MathUtils.damp(
            currentPositions[index + 1],
            targetY,
            5.5,
            delta
          );

        currentPositions[index + 2] =
          THREE.MathUtils.damp(
            currentPositions[index + 2],
            targetZ,
            5.5,
            delta
          );

        /*
         * ---------------------------------------------------
         * SIGNAL RESPONSE
         * ---------------------------------------------------
         */

        const signalIntensity =
          activeSignals.get(i) ??
          0;

        if (
          instanceColors
        ) {
          const r =
            baseColors[index];

          const g =
            baseColors[index + 1];

          const b =
            baseColors[index + 2];

          /*
           * Signal turns node toward
           * white.
           */

          instanceColors.setXYZ(
            i,
            THREE.MathUtils.lerp(
              r,
              1,
              signalIntensity
            ),
            THREE.MathUtils.lerp(
              g,
              1,
              signalIntensity
            ),
            THREE.MathUtils.lerp(
              b,
              1,
              signalIntensity
            )
          );
        }

        /*
         * ---------------------------------------------------
         * WRITE INSTANCE MATRIX
         * ---------------------------------------------------
         */

        dummy.position.set(
          currentPositions[index],
          currentPositions[index + 1],
          currentPositions[index + 2]
        );

        dummy.updateMatrix();

        mesh.setMatrixAt(
          i,
          dummy.matrix
        );
      }

      mesh.instanceMatrix.needsUpdate =
        true;

      if (instanceColors) {
        instanceColors.needsUpdate =
          true;
      }

      /*
       * -----------------------------------------------------
       * UPDATE NEURAL CONNECTIONS
       * -----------------------------------------------------
       */

      const line =
        connectionRef.current;

      if (line) {
        const positionAttribute =
          line.geometry.getAttribute(
            'position'
          ) as THREE.BufferAttribute;

        const colorAttribute =
          line.geometry.getAttribute(
            'color'
          ) as THREE.BufferAttribute;

        for (
          let e = 0;
          e < edgePairs.length;
          e++
        ) {
          const [
            a,
            b,
          ] = edgePairs[e];

          const aIndex =
            a * 3;

          const bIndex =
            b * 3;

          /*
           * Endpoint A
           */

          positionAttribute.setXYZ(
            e * 2,
            currentPositions[aIndex],
            currentPositions[aIndex + 1],
            currentPositions[aIndex + 2]
          );

          /*
           * Endpoint B
           */

          positionAttribute.setXYZ(
            e * 2 + 1,
            currentPositions[bIndex],
            currentPositions[bIndex + 1],
            currentPositions[bIndex + 2]
          );

          const signalA =
            activeSignals.get(a) ??
            0;

          const signalB =
            activeSignals.get(b) ??
            0;

          const signal =
            Math.max(
              signalA,
              signalB
            );

          /*
           * Normal connections are very subtle.
           */

          const baseIntensity =
            0.12;

          const intensity =
            baseIntensity +
            signal * 0.88;

          colorAttribute.setXYZ(
            e * 2,
            intensity,
            intensity,
            intensity
          );

          colorAttribute.setXYZ(
            e * 2 + 1,
            intensity,
            intensity,
            intensity
          );
        }

        positionAttribute.needsUpdate =
          true;

        colorAttribute.needsUpdate =
          true;
      }

      /*
       * Very slow global movement.
       */

      mesh.rotation.y =
        elapsed * 0.018;

      mesh.rotation.x =
        Math.sin(
          elapsed * 0.08
        ) * 0.035;

      if (line) {
        line.rotation.y =
          mesh.rotation.y;

        line.rotation.x =
          mesh.rotation.x;
      }
    }
  );

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <group>
      {/* Neural connections */}

      <lineSegments
        ref={connectionRef}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              connectionGeometry.positions,
              3,
            ]}
          />

          <bufferAttribute
            attach="attributes-color"
            args={[
              connectionGeometry.colors,
              3,
            ]}
          />
        </bufferGeometry>

        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.18}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
        />
      </lineSegments>

      {/* Neural nodes */}

      <instancedMesh
        ref={nodeMeshRef}
        args={[
          undefined,
          undefined,
          count,
        ]}
        onPointerDown={
          handlePointerDown
        }
      >
        <sphereGeometry
          args={[1, 6, 6]}
        />

        <meshBasicMaterial
          transparent
          opacity={0.8}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}
