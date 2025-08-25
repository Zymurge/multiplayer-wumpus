// HexGrid implementation of IGridOperation
import type { IGridOperations, Position } from './IGridOperations.js';

/**
 * Mapping of adjacent cells for an even numbered row
 */
export const EVEN_Q_DELTAS = [
    { x: +1, y:  0 }, { x: +1, y: -1 },
    { x:  0, y: -1 }, { x: -1, y: -1 },
    { x: -1, y:  0 }, { x:  0, y: +1 }
] as const;

/**
 * Mapping of adjacent cells for an odd numbered row
 */
export const ODD_Q_DELTAS = [
    { x: +1, y: +1 }, { x: +1, y:  0 },
    { x:  0, y: -1 }, { x: -1, y:  0 },
    { x: -1, y: +1 }, { x:  0, y: +1 }
] as const;

/**
 * Implements a HexGrid with an “even-q” offset system with vertical columns, 
 * which corresponds to a pointy-top hex layout:
 * - Columns run straight up/down (vertical layout)
 * - Even-indexed columns (x % 2 === 0) are shifted “up” by half a cell
 * 
 * Converts from an x, y coordinate system to row, even-q with:
 *   r = y – floor(x/2)  // even-q vertical
 *   q = x
 * 
 * All cells are exposed as { x, y } Positions and converted internally
 */
export class HexGrid implements IGridOperations {
    private width: number;
    private height: number;

    constructor(width: number, height: number) {
        this.width = Math.max(0, width);
        this.height = Math.max(0, height);
    }

    getDimensions() {
        return { width: this.width, height: this.height };
    }

    getAllPositions(): Position[] {
        const positions: Position[] = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                positions.push({ x, y });
            }
        }
        return positions;
    }

    isValidPosition(pos: Position): boolean {
        return (
            pos.x >= 0 &&
            pos.x < this.width &&
            pos.y >= 0 &&
            pos.y < this.height
        );
    }

    distance(pos1: Position, pos2: Position): number {
        const a = this.offsetToAxial(pos1);
        const b = this.offsetToAxial(pos2);

        const dq = a.q - b.q;
        const dr = a.r - b.r;
        const ds = -dq - dr;

        return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds));
    }

    private offsetToAxial(pos: Position): { q: number; r: number } {
        const q = pos.x;
        const r = pos.y - Math.floor(pos.x / 2); // even-q layout
        return { q, r };
    }

    getRandomPosition(): Position {
        // Total cells
        const total = this.width * this.height;
        // Pick a flat index in [0 .. total-1]
        const idx = Math.floor(Math.random() * total);
        // Map back to (x, y)
        const x = idx % this.width;
        const y = Math.floor(idx / this.width);
        return { x, y };
    }

    getAdjacentPositions(pos: Position): Position[] {
        if (!this.isValidPosition(pos)) return [];
        
        const deltas = pos.x % 2 === 0 ? EVEN_Q_DELTAS : ODD_Q_DELTAS;

        const neighbors: Position[] = [];

        for (const delta of deltas) {
            const neighbor = { x: pos.x + delta.x, y: pos.y + delta.y };
            if (this.isValidPosition(neighbor)) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    /** Returns the largest distance between any two cells in the grid */
    maxDistance(): number {
        const positions = this.getAllPositions();
        let max = 0;

        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                const d = this.distance(positions[i], positions[j]);
                if (d > max) {
                max = d;
                }
            }
        }

        return max;
    }

    /** Gets a random adjacent square from the pool of all neighbors plus the square itself.
     *  Will return a valid cell.
     */
    getRandomMovement(pos: Position): Position {
        // Get the list of neighbors and add myself to it
        let moveOptions = [...this.getAdjacentPositions(pos), pos];

        // Select a random position from the array
        const randomOffset = Math.floor(Math.random() * moveOptions.length);

        return moveOptions[randomOffset];
    }
}
