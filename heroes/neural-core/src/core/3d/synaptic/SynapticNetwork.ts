export interface SynapticNetworkState {
  positions: Float32Array | null;
  adjacency: Map<number, number[]> | null;
  edges: Array<[number, number]>;
  nodeCount: number;
}

export interface SynapticNetworkRef {
  current: SynapticNetworkState;
}
