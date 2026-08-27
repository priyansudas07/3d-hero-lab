export interface ActiveSignal {
  path: number[];
  currentStep: number;
  progress: number;
  speed: number;
  activeNode: number;
}

export class SignalPropagator {
  private activeSignals: ActiveSignal[] = [];

  public triggerSignal(startNode: number, adjacencyList: Map<number, number[]>, speed: number = 2.0): void {
    // Generate a 4-hop neural signal path along connected graph neighbors
    const path: number[] = [startNode];
    let curr = startNode;

    for (let hop = 0; hop < 4; hop++) {
      const neighbors = adjacencyList.get(curr);
      if (!neighbors || neighbors.length === 0) break;
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      path.push(next);
      curr = next;
    }

    if (path.length > 1) {
      this.activeSignals.push({
        path,
        currentStep: 0,
        progress: 0,
        speed,
        activeNode: startNode,
      });
    }
  }

  public update(delta: number): Map<number, number> {
    const activeNodeIntensities = new Map<number, number>();

    for (let i = this.activeSignals.length - 1; i >= 0; i--) {
      const sig = this.activeSignals[i];
      sig.progress += delta * sig.speed;

      if (sig.progress >= 1.0) {
        sig.progress = 0;
        sig.currentStep++;
        if (sig.currentStep >= sig.path.length - 1) {
          this.activeSignals.splice(i, 1);
          continue;
        }
      }

      const nodeA = sig.path[sig.currentStep];
      const intensity = 1.0 - (sig.currentStep / sig.path.length);
      activeNodeIntensities.set(nodeA, intensity);
    }

    return activeNodeIntensities;
  }

  public getActiveSignals(): ActiveSignal[] {
    return this.activeSignals;
  }
}
