'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { CoreMesh } from './CoreMesh';
import { SynapticNodes, SynapticNetworkRef } from './SynapticNodes';
import { ConnectionLines } from './ConnectionLines';

interface NeuralSystemProps {
  nodeCount: number;
  interactionRadius: number;
  attractionStrength: number;
  primaryColor: string;
  secondaryColor: string;
  networkRef: SynapticNetworkRef;
}

export function NeuralSystem({
  nodeCount,
  interactionRadius,
  attractionStrength,
  primaryColor,
  secondaryColor,
  networkRef,
}: NeuralSystemProps) {
  const globalGroupRef = useRef<THREE.Group>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    const targetX = state.pointer.y * 0.42;
    const targetY = state.pointer.x * 0.42;
    const targetZ = -state.pointer.x * 0.12;

    pointer.current.x = THREE.MathUtils.damp(
      pointer.current.x,
      targetX,
      4.5,
      delta
    );

    pointer.current.y = THREE.MathUtils.damp(
      pointer.current.y,
      targetY,
      4.5,
      delta
    );

    if (globalGroupRef.current) {
      globalGroupRef.current.rotation.x =
        time * 0.105 + pointer.current.x;

      globalGroupRef.current.rotation.y =
        time * 0.17 + pointer.current.y;

      globalGroupRef.current.rotation.z =
        Math.sin(time * 0.11) * 0.055 + targetZ;
    }
  });

  return (
    <group ref={globalGroupRef}>
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
