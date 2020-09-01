class Game {
  constructor () {
    this.cellStates = {};
    this.neighborCounts = {};
  }

  clear() {
    this.cellStates = {};
    this.neighborCounts = {};
  }

  addCell(coordinates) {
    const coordinatesString = coordinates.join(",");
    this.cellStates[coordinatesString] = true;
    for (let x = coordinates[0] - 1; x <= coordinates[0] + 1; x++) {
      for (let y = coordinates[1] - 1; y <= coordinates[1] + 1; y++) {
        const neighborString = [x, y].join(",");
        if (neighborString !== coordinatesString && x >= 0 && y >= 0) {
          this.neighborCounts[neighborString] = this.neighborCounts[neighborString] + 1 || 1;
        }
      }
    }
  }

  removeCell(coordinates) {
    const coordinatesString = coordinates.join(",");
    delete this.cellStates[coordinatesString];
    for (let x = coordinates[0] - 1; x <= coordinates[0] + 1; x++) {
      for (let y = coordinates[1] - 1; y <= coordinates[1] + 1; y++) {
        const neighborString = [x, y].join(",");
        if (neighborString !== coordinatesString && x >= 0 && y >= 0) {
          this.neighborCounts[neighborString] = this.neighborCounts[neighborString] - 1;
        }
      }
    }
    // Cleanup any squares with no neighbors left
    for (const square in this.neighborCounts) {
      if (!this.neighborCounts[square]) {
        delete this.neighborCounts[square];
      }
    }
  }

  calculateNextTick() {
    const changes = {};
    const tempCellStates = { ...this.cellStates };
    const tempNeighborCounts = { ...this.neighborCounts };
    // Any live cell without either exactly two or three live neighbours dies
    for (const liveCell in tempCellStates) {
      if (!(tempNeighborCounts[liveCell] === 2 || tempNeighborCounts[liveCell] === 3)) {
        this.removeCell(Array.from(liveCell.split(","), Number));
        changes[liveCell] = false;
      }
    }
    // Any dead cell with three live neighbours becomes a live cell
    for (const cell in tempNeighborCounts) {
      if (!tempCellStates[cell] && tempNeighborCounts[cell] === 3) {
        this.addCell(Array.from(cell.split(","), Number));
        changes[cell] = true;
      }
    }
    return changes;
  }
}
