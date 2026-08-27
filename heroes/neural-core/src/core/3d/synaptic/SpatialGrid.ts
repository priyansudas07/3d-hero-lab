export class SpatialGrid {
  private cellSize: number;
  private invCellSize: number;
  private grid: Map<number, number[]>;

  constructor(cellSize: number = 2.0) {
    this.cellSize = cellSize;
    this.invCellSize = 1.0 / cellSize;
    this.grid = new Map();
  }

  // Integer spatial hash function avoiding string allocations
  private getHash(cx: number, cy: number, cz: number): number {
    return ((cx * 73856093) ^ (cy * 19349663) ^ (cz * 83492791)) | 0;
  }

  public buildGrid(positions: Float32Array, count: number): void {
    this.grid.clear();
    for (let i = 0; i < count; i++) {
      const cx = Math.floor(positions[i * 3] * this.invCellSize);
      const cy = Math.floor(positions[i * 3 + 1] * this.invCellSize);
      const cz = Math.floor(positions[i * 3 + 2] * this.invCellSize);
      const hash = this.getHash(cx, cy, cz);

      let cell = this.grid.get(hash);
      if (!cell) {
        cell = [];
        this.grid.set(hash, cell);
      }
      cell.push(i);
    }
  }

  public getNeighbors(x: number, y: number, z: number, radius: number, outNeighbors: number[]): number {
    outNeighbors.length = 0;
    const minX = Math.floor((x - radius) * this.invCellSize);
    const maxX = Math.floor((x + radius) * this.invCellSize);
    const minY = Math.floor((y - radius) * this.invCellSize);
    const maxY = Math.floor((y + radius) * this.invCellSize);
    const minZ = Math.floor((z - radius) * this.invCellSize);
    const maxZ = Math.floor((z + radius) * this.invCellSize);

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        for (let cz = minZ; cz <= maxZ; cz++) {
          const hash = this.getHash(cx, cy, cz);
          const cell = this.grid.get(hash);
          if (cell) {
            for (let i = 0; i < cell.length; i++) {
              outNeighbors.push(cell[i]);
            }
          }
        }
      }
    }
    return outNeighbors.length;
  }
}
