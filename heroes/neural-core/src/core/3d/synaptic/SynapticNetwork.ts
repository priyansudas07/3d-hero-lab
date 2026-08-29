import type { SignalPropagator } from './SignalPropagator';

export interface SynapticNetworkState {
  positions: Float32Array | null;
  adjacency: Map<number, number[]> | null;
  edges: Array<[number, number]>;
  signalIntensities: Map<number, number>;
  nodeCount: number;
  signalPropagator: SignalPropagator | null;
  hoveredNode?: number | null;
}

export interface SynapticNetworkRef {
  current: SynapticNetworkState;
}
