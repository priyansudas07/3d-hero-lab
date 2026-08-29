export interface ProjectSpecimen {
  id: string;
  slug: string;
  number: string;
  title: string;
  category: string;
  tagline: string;
  summary: string;
  year: string;
  status: string;
  stack: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  overview: {
    context: string;
    objectives: string[];
  };
  architecture: {
    approach: string;
    decisions: {
      title: string;
      rationale: string;
    }[];
    codeSnippet?: {
      filename: string;
      language: string;
      code: string;
    };
  };
  results: {
    outcomes: string[];
    learnings: string;
  };
  links: {
    demo?: string;
    source?: string;
  };
}

export const PROJECT_SPECIMENS: ProjectSpecimen[] = [
  {
    id: 'neural-core-3d',
    slug: 'neural-core-3d',
    number: '01.01',
    title: 'Neural Core 3D',
    category: 'GRAPHICS ENGINE // REAL-TIME WEBGL',
    tagline: 'Directional graph flow and spatial depth in 3D space.',
    summary:
      'A high-density 3D neural network simulation running 3,500 instanced vertices with graph-bound traveling pulses, raycasting hover recognition, and asymmetric core energy coupling without frame drops.',
    year: '2026',
    status: 'DEPLOYED',
    stack: ['THREE.JS', 'REACT THREE FIBER', 'GLSL', 'TYPESCRIPT'],
    metrics: [
      { label: 'NODES', value: '3,500' },
      { label: 'CASCADE HOPS', value: '5 MAX' },
      { label: 'GRID QUERY', value: '<1.2MS' },
      { label: 'FRAME RATE', value: '60 FPS' },
    ],
    overview: {
      context:
        'Traditional particle simulations often rely on disconnected points or heavy CPU-bound graph calculations. Neural Core 3D was developed to demonstrate a real-time, interactive graph system capable of multi-hop directional signal cascades while maintaining 60fps on mobile and desktop hardware.',
      objectives: [
        'Render 3,500+ dynamic coordinates with zero per-frame CPU allocations.',
        'Implement directional multi-hop impulse cascades avoiding cyclical back-and-forth bounce.',
        'Couple central geodesic core emissive states to real-time aggregate network activity.',
      ],
    },
    architecture: {
      approach:
        'The system uses an InstancedMesh paired with an O(1) SpatialGrid partitioning algorithm. A unified SignalPropagator acts as the single source of truth for all traveling pulses, maintaining visited-node history to enforce forward-flowing topological paths.',
      decisions: [
        {
          title: 'Single-Pass Instanced Rendering',
          rationale:
            'Rather than managing 3,500 individual Three.js meshes, a single InstancedMesh is mutated via matrix buffers and Float32Array color buffers, drastically reducing draw calls.',
        },
        {
          title: 'Asymmetric Attack / Decay Core Damping',
          rationale:
            'Fast attack damping (6.0) makes the central core immediately react when pulses travel into neighboring nodes, while smooth release damping (2.8) naturally simulates energy dissipation.',
        },
        {
          title: 'GPU Depth Attenuation',
          rationale:
            'Vertex and fragment shaders compute Z-depth scaling and color falloff directly on the GPU, achieving volumetric spatial depth without heavy blur passes.',
        },
      ],
      codeSnippet: {
        filename: 'SignalPropagator.ts',
        language: 'typescript',
        code: `// Multi-hop path generation avoiding node revisit cycles
const visitedNodes = new Set<number>([startNode]);
for (let hop = 0; hop < MAX_HOPS; hop++) {
  const neighbors = adjacencyList.get(currentNode);
  if (!neighbors || neighbors.length === 0) break;
  
  const candidates = neighbors.filter((n) => !visitedNodes.has(n));
  const nextNode = (candidates.length > 0 ? candidates : neighbors)[
    Math.floor(Math.random() * (candidates.length > 0 ? candidates.length : neighbors.length))
  ];
  
  path.push(nextNode);
  visitedNodes.add(nextNode);
  currentNode = nextNode;
}`,
      },
    },
    results: {
      outcomes: [
        'Sustained 60fps execution with 3,500 instanced vertices and dynamic connection lines.',
        'Seamless 3-state interaction hierarchy across Idle, Hover, and Click cascades.',
        'Fully responsive camera geometry and viewport scaling across all screen sizes.',
      ],
      learnings:
        'Optimizing spatial algorithms with pre-allocated Float32Array buffers and bounded queue systems prevents garbage collection spikes, creating butter-smooth WebGL interactive experiences.',
    },
    links: {
      demo: '/',
      source: 'https://github.com/priyansudas07/3d-hero-lab',
    },
  },
  {
    id: 'synaptic-dispatch-engine',
    slug: 'synaptic-dispatch-engine',
    number: '01.02',
    title: 'Synaptic Dispatch Engine',
    category: 'DISTRIBUTED SYSTEMS // EVENT PIPELINE',
    tagline: 'High-throughput asynchronous event dispatcher with deterministic state evaluation.',
    summary:
      'A deterministic event propagation architecture managing complex multi-hop cascades and asynchronous signal lifecycle states with bounded queues.',
    year: '2025',
    status: 'ACTIVE',
    stack: ['TYPESCRIPT', 'NODE.JS', 'WEBSOCKETS', 'EVENT EMITTERS'],
    metrics: [
      { label: 'THROUGHPUT', value: '10K EVT/S' },
      { label: 'QUEUE CAPACITY', value: '12 BOUNDED' },
      { label: 'CYCLE PREV', value: 'O(1) SET' },
    ],
    overview: {
      context:
        'Complex interactive simulations require predictable event distribution. When multiple signals are triggered concurrently, traditional event emitters can suffer from infinite loops or memory buildup. Synaptic Engine provides a deterministic, bounded dispatch layer.',
      objectives: [
        'Enforce FIFO bounded signal queues to eliminate memory leaks.',
        'Guarantee cycle-free topological traversal across arbitrary graph definitions.',
        'Provide unified state feeds for multi-system subscribers.',
      ],
    },
    architecture: {
      approach:
        'The dispatch engine decouples signal generation from visual consumers using a lightweight pub/sub model. State snapshots are published directly via shared memory references to avoid serialization overhead.',
      decisions: [
        {
          title: 'Bounded FIFO Buffering',
          rationale:
            'Limits max simultaneous impulses to 12. Incoming events beyond capacity discard the oldest frame, preserving stable memory footprints.',
        },
        {
          title: 'Cycle Prevention Sets',
          rationale:
            'Tracks visited nodes on each hop, ensuring signals propagate forward through the graph rather than ping-ponging between adjacent pairs.',
        },
      ],
    },
    results: {
      outcomes: [
        'Zero memory accumulation during rapid user interaction loops.',
        'Predictable, deterministic state propagation for complex graphical subscribers.',
      ],
      learnings:
        'Strict bounding and minimal object instantiation are critical for high-frequency event architectures.',
    },
    links: {
      source: 'https://github.com/priyansudas07/3d-hero-lab',
    },
  },
  {
    id: 'spatial-grid-partitioning',
    slug: 'spatial-grid-partitioning',
    number: '01.03',
    title: 'Spatial Grid Partitioning',
    category: 'ALGORITHMS // SPATIAL INDEX',
    tagline: 'Sub-millisecond spatial neighborhood search across thousands of active 3D coordinates.',
    summary:
      'A high-performance spatial hashing algorithm partitioning 3D space into uniform cubic cells, reducing O(N²) distance tests into sub-millisecond O(1) neighbor lookups.',
    year: '2025',
    status: 'STABLE',
    stack: ['ALGORITHMS', 'SPATIAL HASHING', 'TYPESCRIPT'],
    metrics: [
      { label: 'COMPLEXITY', value: 'O(1) CELL' },
      { label: 'CELL SIZE', value: '1.6 UNITS' },
      { label: 'COORDINATES', value: '3,500' },
    ],
    overview: {
      context:
        'Testing proximity across thousands of particles every frame usually requires O(N²) calculations (over 12 million operations for 3,500 nodes). A spatial partition index was engineered to reduce neighbor queries to sub-millisecond times.',
      objectives: [
        'Partition 3D coordinate space into uniform spatial buckets.',
        'Provide sub-millisecond neighbor lookups for pointer interaction and graph formation.',
        'Operate with pre-allocated buffer arrays to eliminate garbage collection.',
      ],
    },
    architecture: {
      approach:
        'Coordinates are mapped to a 1D spatial hash key based on quantized (X, Y, Z) cell indices. Only the 27 neighboring cells in the 3D neighborhood are evaluated during distance testing.',
      decisions: [
        {
          title: 'Linear Array Cell Hashing',
          rationale:
            'Uses a flat Map with integer cell keys to store node index arrays, keeping memory compact and lookups instantaneous.',
        },
        {
          title: 'Pre-Allocated Neighbor Buffers',
          rationale:
            'Returns neighbor indices into a caller-supplied pre-allocated array, eliminating array allocations in the frame loop.',
        },
      ],
    },
    results: {
      outcomes: [
        'Reduced 12,000,000 potential distance checks down to fewer than 500 per frame.',
        'Sub-millisecond pointer field interaction and graph topology generation.',
      ],
      learnings:
        'Spatial hashing is indispensable for scaling 3D WebGL scenes without offloading physics to expensive backend workers.',
    },
    links: {
      source: 'https://github.com/priyansudas07/3d-hero-lab',
    },
  },
];
