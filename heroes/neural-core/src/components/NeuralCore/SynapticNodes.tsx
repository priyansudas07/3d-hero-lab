'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { SignalPropagator } from '../../core/3d/synaptic/SignalPropagator';
import { SpatialGrid } from '../../core/3d/synaptic/SpatialGrid';

interface SynapticNodesProps {
  count?: number;
  interactionRadius?: number;
  attractionStrength?: number;
  primaryColor?: string;
  secondaryColor?: string;
  onNodeClick?: (nodeId: number) => void;
}

export function SynapticNodes({
  count = 3500,
  interactionRadius = 2.5,
  attractionStrength = 0.25,
  primaryColor = '#00F0FF',
  secondaryColor = '#A040FF',
  onNodeClick,
}: SynapticNodesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const signalPropagator = useMemo(() => new SignalPropagator(), []);
  const spatialGrid = useMemo(() => new SpatialGrid(2.5), []);
  const currentPointerWorld = useRef(new THREE.Vector3(0, 0, 0));

  // Reusable object references to prevent garbage collection allocation spikes
  const reusableDummy = useMemo(() => new THREE.Object3D(), []);
  const reusableColor = useMemo(() => new THREE.Color(), []);
  const neighborBuffer = useMemo(() => new Array<number>(), []);

  // Initialize node positions, base scales, and adjacency graph
  const { initialPositions, currentPositions, scales, baseColors, adjacencyList } = useMemo(() => {
    const initPos = new Float32Array(count * 3);
    const currPos = new Float32Array(count * 3);
    const scs = new Float32Array(count);
    const cols = new Float32Array(count * 3);
    const graph = new Map<number, number[]>();

    const c1 = new THREE.Color(primaryColor);
    const c2 = new THREE.Color(secondaryColor);

    const numAxons = 6;
    const axonAngles = Array.from({ length: numAxons }, (_, i) => (i / numAxons) * Math.PI * 2.0);

    for (let i = 0; i < count; i++) {
      let x = 0, y = 0, z = 0;
      let scale = 0.015;

      const pType = Math.random();

      if (pType < 0.3) {
        const r = 0.8 + Math.cbrt(Math.random()) * 1.5;
        const theta = Math.random() * Math.PI * 2.0;
        const phi = Math.acos(2.0 * Math.random() - 1.0);

        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        scale = 0.018 + Math.random() * 0.015;
      } else {
        const axonIdx = Math.floor(Math.random() * numAxons);
        const baseAngle = axonAngles[axonIdx];
        const distAlongAxon = 1.5 + Math.pow(Math.random(), 1.5) * 5.0;

        const spiralAngle = distAlongAxon * 1.2;
        const dispersionRadius = 0.2 + (distAlongAxon * 0.1);

        x = Math.cos(baseAngle) * distAlongAxon + Math.cos(spiralAngle) * dispersionRadius;
        y = Math.sin(baseAngle) * distAlongAxon + Math.sin(spiralAngle) * dispersionRadius;
        z = (Math.random() - 0.5) * (distAlongAxon * 0.3);
        scale = 0.012 + Math.random() * 0.012;
      }

      initPos[i * 3] = x;
      initPos[i * 3 + 1] = y;
      initPos[i * 3 + 2] = z;

      currPos[i * 3] = x;
      currPos[i * 3 + 1] = y;
      currPos[i * 3 + 2] = z;

      scs[i] = scale;

      const nodeColor = c1.clone().lerp(c2, Math.random());
      cols[i * 3] = nodeColor.r;
      cols[i * 3 + 1] = nodeColor.g;
      cols[i * 3 + 2] = nodeColor.b;

      graph.set(i, []);
    }

    // Build spatial grid lookup for O(1) adjacency
    spatialGrid.buildGrid(initPos, count);

    for (let i = 0; i < Math.min(count, 1000); i++) {
      const neighbors: number[] = [];
      spatialGrid.getNeighbors(initPos[i * 3], initPos[i * 3 + 1], initPos[i * 3 + 2], 2.2, neighbors);

      for (let k = 0; k < neighbors.length; k++) {
        const j = neighbors[k];
        if (j > i) {
          graph.get(i)!.push(j);
          graph.get(j)!.push(i);
        }
      }
    }

    return {
      initialPositions: initPos,
      currentPositions: currPos,
      scales: scs,
      baseColors: cols,
      adjacencyList: graph,
    };
  }, [count, primaryColor, secondaryColor, spatialGrid]);

  useEffect(() => {
    if (!meshRef.current) return;
    const colorAttr = new THREE.InstancedBufferAttribute(new Float32Array(baseColors), 3);
    meshRef.current.instanceColor = colorAttr;

    for (let i = 0; i < count; i++) {
      reusableDummy.position.set(initialPositions[i * 3], initialPositions[i * 3 + 1], initialPositions[i * 3 + 2]);
      reusableDummy.scale.setScalar(scales[i]);
      reusableDummy.updateMatrix();
      meshRef.current.setMatrixAt(i, reusableDummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, initialPositions, scales, reusableDummy, baseColors]);

  const handlePointerDown = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined) {
      signalPropagator.triggerSignal(e.instanceId, adjacencyList);
      if (onNodeClick) onNodeClick(e.instanceId);
    }
  };

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Dampened cursor position in world coordinates
    const targetWorldX = state.pointer.x * 6.0;
    const targetWorldY = state.pointer.y * 4.0;

    currentPointerWorld.current.x = THREE.MathUtils.damp(currentPointerWorld.current.x, targetWorldX, 5, delta);
    currentPointerWorld.current.y = THREE.MathUtils.damp(currentPointerWorld.current.y, targetWorldY, 5, delta);

    const activeSignalIntensities = signalPropagator.update(delta);
    const instanceColors = meshRef.current.instanceColor;

    // Spatial Grid Neighbor Query for Mouse Interaction (Zero O(N^2) loops)
    const numNear = spatialGrid.getNeighbors(
      currentPointerWorld.current.x,
      currentPointerWorld.current.y,
      currentPointerWorld.current.z,
      interactionRadius,
      neighborBuffer
    );

    const nearSet = new Set(neighborBuffer.slice(0, numNear));

    for (let i = 0; i < count; i++) {
      const ix = initialPositions[i * 3];
      const iy = initialPositions[i * 3 + 1];
      const iz = initialPositions[i * 3 + 2];

      let targetX = ix;
      let targetY = iy;
      let targetZ = iz;
      let currentScale = scales[i];

      if (nearSet.has(i)) {
        const dx = ix - currentPointerWorld.current.x;
        const dy = iy - currentPointerWorld.current.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < interactionRadius * interactionRadius && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const factor = 1.0 - dist / interactionRadius;

          targetX += (dx / dist) * factor * attractionStrength;
          targetY += (dy / dist) * factor * attractionStrength;
          currentScale *= 1.0 + factor * 0.8;
        }
      }

      // Fast Position Interpolation
      currentPositions[i * 3] = THREE.MathUtils.damp(currentPositions[i * 3], targetX, 6, delta);
      currentPositions[i * 3 + 1] = THREE.MathUtils.damp(currentPositions[i * 3 + 1], targetY, 6, delta);
      currentPositions[i * 3 + 2] = THREE.MathUtils.damp(currentPositions[i * 3 + 2], targetZ, 6, delta);

      reusableDummy.position.set(currentPositions[i * 3], currentPositions[i * 3 + 1], currentPositions[i * 3 + 2]);
      reusableDummy.scale.setScalar(currentScale);
      reusableDummy.updateMatrix();
      meshRef.current.setMatrixAt(i, reusableDummy.matrix);

      // Fast Signal Impulse Color Update
      if (instanceColors && activeSignalIntensities.has(i)) {
        const intensity = activeSignalIntensities.get(i)!;
        instanceColors.setXYZ(
          i,
          1.0 * intensity + baseColors[i * 3] * (1 - intensity),
          1.0 * intensity + baseColors[i * 3 + 1] * (1 - intensity),
          1.0
        );
      } else if (instanceColors) {
        instanceColors.setXYZ(i, baseColors[i * 3], baseColors[i * 3 + 1], baseColors[i * 3 + 2]);
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (instanceColors) instanceColors.needsUpdate = true;

    meshRef.current.rotation.y = state.clock.elapsedTime * 0.025;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.04;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      onPointerDown={handlePointerDown}
    >
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial transparent opacity={0.75} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}
