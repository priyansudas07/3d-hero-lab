import * as THREE from 'three';

export type PhysicsMode = 'GRAVITY' | 'ATTRACT' | 'REPEL' | 'VORTEX' | 'SPRING';

export class PhysicsSimulation {
  public positions: Float32Array;
  public velocities: Float32Array;
  public anchorPositions: Float32Array;
  public count: number;

  constructor(count: number = 10000) {
    this.count = count;
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.anchorPositions = new Float32Array(count * 3);
    this.initPhysics();
  }

  public initPhysics(): void {
    for (let i = 0; i < this.count; i++) {
      const x = (Math.random() - 0.5) * 10.0;
      const y = (Math.random() - 0.5) * 7.0;
      const z = (Math.random() - 0.5) * 3.0;

      this.positions[i * 3] = x;
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = z;

      this.anchorPositions[i * 3] = x;
      this.anchorPositions[i * 3 + 1] = y;
      this.anchorPositions[i * 3 + 2] = z;

      this.velocities[i * 3] = 0;
      this.velocities[i * 3 + 1] = 0;
      this.velocities[i * 3 + 2] = 0;
    }
  }

  public update(
    delta: number,
    pointerWorld: THREE.Vector3,
    isMouseDown: boolean,
    mode: PhysicsMode = 'ATTRACT',
    gravityStrength: number = 0.5,
    forceStrength: number = 3.0,
    damping: number = 0.95
  ): void {
    const dt = Math.min(delta, 0.05);

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;

      let px = this.positions[idx];
      let py = this.positions[idx + 1];
      let pz = this.positions[idx + 2];

      let vx = this.velocities[idx];
      let vy = this.velocities[idx + 1];
      let vz = this.velocities[idx + 2];

      // 1. GRAVITY FORCE
      if (mode === 'GRAVITY') {
        vy -= gravityStrength * 9.8 * dt;
      }

      // 2. MOUSE INTERACTION FORCE FIELD
      if (isMouseDown || mode !== 'GRAVITY') {
        const dx = pointerWorld.x - px;
        const dy = pointerWorld.y - py;
        const distSq = dx * dx + dy * dy;

        if (distSq < 25.0 && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const factor = (1.0 - dist / 5.0) * forceStrength;

          if (mode === 'ATTRACT' || (mode === 'GRAVITY' && isMouseDown)) {
            vx += (dx / dist) * factor * dt * 8.0;
            vy += (dy / dist) * factor * dt * 8.0;
          } else if (mode === 'REPEL') {
            vx -= (dx / dist) * factor * dt * 8.0;
            vy -= (dy / dist) * factor * dt * 8.0;
          } else if (mode === 'VORTEX') {
            vx += (-dy / dist) * factor * dt * 10.0;
            vy += (dx / dist) * factor * dt * 10.0;
          }
        }
      }

      // 3. SPRING RESTORATION FORCE
      if (mode === 'SPRING') {
        const ax = this.anchorPositions[idx];
        const ay = this.anchorPositions[idx + 1];
        const az = this.anchorPositions[idx + 2];

        vx += (ax - px) * 12.0 * dt;
        vy += (ay - py) * 12.0 * dt;
        vz += (az - pz) * 12.0 * dt;
      }

      // 4. DAMPING & NUMERICAL INTEGRATION
      vx *= damping;
      vy *= damping;
      vz *= damping;

      px += vx * dt;
      py += vy * dt;
      pz += vz * dt;

      // 5. BOUNDARY RESPONSES (Floor Bounce / Wall Wraps)
      if (mode === 'GRAVITY') {
        if (py < -3.8) {
          py = -3.8;
          vy *= -0.65; // Bounce energy loss
        }
      } else {
        if (px > 6.5) { px = 6.5; vx *= -0.7; }
        if (px < -6.5) { px = -6.5; vx *= -0.7; }
        if (py > 4.5) { py = 4.5; vy *= -0.7; }
        if (py < -4.5) { py = -4.5; vy *= -0.7; }
      }

      this.positions[idx] = px;
      this.positions[idx + 1] = py;
      this.positions[idx + 2] = pz;

      this.velocities[idx] = vx;
      this.velocities[idx + 1] = vy;
      this.velocities[idx + 2] = vz;
    }
  }
}
