import * as THREE from 'three';

export class FluidSimulation {
  public positions: Float32Array;
  public velocities: Float32Array;
  public accelerations: Float32Array;
  public count: number;

  constructor(count: number = 20000) {
    this.count = count;
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.accelerations = new Float32Array(count * 3);
    this.resetParticles();
  }

  public resetParticles(): void {
    for (let i = 0; i < this.count; i++) {
      this.positions[i * 3] = (Math.random() - 0.5) * 12.0;
      this.positions[i * 3 + 1] = (Math.random() - 0.5) * 8.0;
      this.positions[i * 3 + 2] = (Math.random() - 0.5) * 4.0;

      this.velocities[i * 3] = (Math.random() - 0.5) * 0.2;
      this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
  }

  public update(
    delta: number,
    pointerWorld: THREE.Vector3,
    forceRadius: number = 3.0,
    forceStrength: number = 2.5,
    vortexStrength: number = 1.8,
    damping: number = 0.96,
    turbulence: number = 0.4
  ): void {
    const time = performance.now() * 0.0005;

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;

      let px = this.positions[idx];
      let py = this.positions[idx + 1];
      let pz = this.positions[idx + 2];

      let vx = this.velocities[idx];
      let vy = this.velocities[idx + 1];
      let vz = this.velocities[idx + 2];

      // Procedural Vector Field Turbulence
      const n1 = Math.sin(py * 0.8 + time) * Math.cos(pz * 0.8 + time) * turbulence;
      const n2 = Math.cos(px * 0.8 + time) * Math.sin(pz * 0.8 + time) * turbulence;

      vx += n1 * delta;
      vy += n2 * delta;

      // Mouse Force Field & Vortex Simulation
      const dx = px - pointerWorld.x;
      const dy = py - pointerWorld.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < forceRadius * forceRadius && distSq > 0.001) {
        const dist = Math.sqrt(distSq);
        const factor = (1.0 - dist / forceRadius) * forceStrength;

        // Radial repulsion/displacement
        vx += (dx / dist) * factor * delta * 2.0;
        vy += (dy / dist) * factor * delta * 2.0;

        // Tangential Vortex / Swirl force
        vx += (-dy / dist) * factor * vortexStrength * delta * 2.5;
        vy += (dx / dist) * factor * vortexStrength * delta * 2.5;
      }

      // Damping & Velocity Integration
      vx *= damping;
      vy *= damping;
      vz *= damping;

      px += vx * delta * 6.0;
      py += vy * delta * 6.0;
      pz += vz * delta * 6.0;

      // Soft Boundary Constraints (-7 to +7 X, -5 to +5 Y)
      if (px > 7.0) px = -7.0;
      if (px < -7.0) px = 7.0;
      if (py > 5.0) py = -5.0;
      if (py < -5.0) py = 5.0;
      if (pz > 3.0 || pz < -3.0) vz *= -0.8;

      this.positions[idx] = px;
      this.positions[idx + 1] = py;
      this.positions[idx + 2] = pz;

      this.velocities[idx] = vx;
      this.velocities[idx + 1] = vy;
      this.velocities[idx + 2] = vz;
    }
  }
}
