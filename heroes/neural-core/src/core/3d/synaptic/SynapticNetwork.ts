export interface SynapticNetworkState {
  positions: Float32Array | null;
  adjacency: Map<number, number[]> | null;
  edges: Array<[number, number]>;
  signalIntensities: Map<number, number>;
  nodeCount: number;
  signalPropagator: any | null;
}

export interface SynapticNetworkRef {
  current: SynapticNetworkState;
}
