export interface ActiveSignal {
  path: number[];

  currentStep: number;

  progress: number;

  speed: number;

  activeNode: number;

  previousNode: number | null;

  nextNode: number | null;

  intensity: number;
}

export interface SignalEdge {
  from: number;

  to: number;

  progress: number;

  intensity: number;
}

export class SignalPropagator {
  private activeSignals: ActiveSignal[] = [];

  /**
   * Maximum number of simultaneous neural impulses.
   *
   * Prevents excessive signal accumulation when the user
   * clicks rapidly.
   */
  private readonly MAX_SIGNALS = 12;

  /**
   * Trigger a new neural impulse.
   */
  public triggerSignal(
    startNode: number,
    adjacencyList: Map<number, number[]>,
    speed: number = 2.0
  ): void {
    if (
      !adjacencyList.has(startNode)
    ) {
      return;
    }

    /*
     * Prevent unlimited signal accumulation.
     */
    if (
      this.activeSignals.length >=
      this.MAX_SIGNALS
    ) {
      this.activeSignals.shift();
    }

    /*
     * Build a short path through the graph.
     */
    const path: number[] = [
      startNode,
    ];

    let currentNode =
      startNode;

    let previousNode:
      number | null =
      null;

    const MAX_HOPS = 5;

    for (
      let hop = 0;
      hop < MAX_HOPS;
      hop++
    ) {
      const neighbors =
        adjacencyList.get(
          currentNode
        );

      if (
        !neighbors ||
        neighbors.length === 0
      ) {
        break;
      }

      /*
       * Avoid immediately travelling
       * backwards through the same edge.
       */
      const availableNeighbors =
        neighbors.filter(
          (node) =>
            node !== previousNode
        );

      const candidates =
        availableNeighbors.length > 0
          ? availableNeighbors
          : neighbors;

      /*
       * Prefer a random branch so repeated
       * clicks don't always produce the same path.
       */
      const nextNode =
        candidates[
          Math.floor(
            Math.random() *
              candidates.length
          )
        ];

      path.push(
        nextNode
      );

      previousNode =
        currentNode;

      currentNode =
        nextNode;
    }

    /*
     * A signal requires at least
     * one connection.
     */
    if (
      path.length < 2
    ) {
      return;
    }

    this.activeSignals.push({
      path,

      currentStep: 0,

      progress: 0,

      speed,

      activeNode:
        startNode,

      previousNode:
        null,

      nextNode:
        path[1],

      intensity: 1,
    });
  }

  /**
   * Advance all active neural impulses.
   */
  public update(
    delta: number
  ): Map<number, number> {

    const activeNodeIntensities =
      new Map<number, number>();

    for (
      let i =
        this.activeSignals.length - 1;
      i >= 0;
      i--
    ) {

      const signal =
        this.activeSignals[i];

      /*
       * Advance signal.
       */
      signal.progress +=
        delta *
        signal.speed;

      /*
       * Move through multiple graph
       * segments if necessary.
       */
      while (
        signal.progress >= 1
      ) {

        signal.progress -= 1;

        signal.currentStep++;

        /*
         * Signal reached the end.
         */
        if (
          signal.currentStep >=
          signal.path.length - 1
        ) {

          this.activeSignals.splice(
            i,
            1
          );

          break;
        }
      }

      /*
       * Signal may have been removed.
       */
      if (
        !this.activeSignals[i]
      ) {
        continue;
      }

      const nodeA =
        signal.path[
          signal.currentStep
        ];

      const nodeB =
        signal.path[
          signal.currentStep + 1
        ];

      signal.activeNode =
        nodeA;

      signal.previousNode =
        signal.currentStep > 0
          ? signal.path[
              signal.currentStep - 1
            ]
          : null;

      signal.nextNode =
        nodeB;

      /*
       * Fade slightly as the signal
       * travels deeper into the path.
       */
      const pathProgress =
        (
          signal.currentStep +
          signal.progress
        ) /
        Math.max(
          signal.path.length - 1,
          1
        );

      signal.intensity =
        Math.max(
          0.25,
          1.0 -
            pathProgress *
              0.65
        );

      /*
       * Current node receives strong
       * illumination.
       */
      const currentIntensity =
        signal.intensity *
        (
          1.0 -
          signal.progress *
            0.35
        );

      this.addNodeIntensity(
        activeNodeIntensities,
        nodeA,
        currentIntensity
      );

      /*
       * Next node begins receiving
       * energy before the pulse reaches it.
       */
      const nextIntensity =
        signal.intensity *
        signal.progress *
        0.45;

      this.addNodeIntensity(
        activeNodeIntensities,
        nodeB,
        nextIntensity
      );
    }

    return activeNodeIntensities;
  }

  /**
   * Additive node intensity helper.
   */
  private addNodeIntensity(
    map: Map<number, number>,
    node: number,
    intensity: number
  ): void {

    const previous =
      map.get(node) ?? 0;

    map.set(
      node,
      Math.min(
        1,
        Math.max(
          previous,
          intensity
        )
      )
    );
  }

  /**
   * Returns active signals.
   *
   * ConnectionLines uses this to
   * render traveling edge pulses.
   */
  public getActiveSignals():
    ActiveSignal[] {

    return this.activeSignals;
  }

  /**
   * Returns the currently active
   * traveling edge segments.
   */
  public getSignalEdges():
    SignalEdge[] {

    const edges: SignalEdge[] = [];

    for (
      const signal of
        this.activeSignals
    ) {

      if (
        signal.nextNode === null
      ) {
        continue;
      }

      edges.push({
        from:
          signal.activeNode,

        to:
          signal.nextNode,

        progress:
          signal.progress,

        intensity:
          signal.intensity,
      });
    }

    return edges;
  }

  /**
   * Remove all active impulses.
   */
  public clear(): void {
    this.activeSignals.length = 0;
  }
}
