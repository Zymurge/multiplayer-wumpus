import type { IGridSystem, Position } from './IGridSystem.js';

/**
 * Square grid implementation using Euclidean distance
 * Manages spatial relationships for a rectangular grid
 */
export class SquareGrid implements IGridSystem {
	private width: number;
	private height: number;
	
	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}
	
	/**
	 * Calculate Euclidean distance between two positions
	 */
	distance(pos1: Position, pos2: Position): number {
		return Math.floor(Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2));
	}
	
	/**
	 * Get a random valid position within the grid
	 */
	getRandomPosition(): Position {
		return {
			x: Math.floor(Math.random() * this.width),
			y: Math.floor(Math.random() * this.height)
		};
	}
	
	/**
	 * Get all 8 adjacent positions (including diagonals)
	 */
	getAdjacentPositions(pos: Position): Position[] {
		const adjacent: Position[] = [];
		
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				if (dx === 0 && dy === 0) continue; // Skip center position
				
				const newPos = { x: pos.x + dx, y: pos.y + dy };
				if (this.isValidPosition(newPos)) {
					adjacent.push(newPos);
				}
			}
		}
		
		return adjacent;
	}
	
	/**
	 * Check if a position is valid within grid boundaries
	 */
	isValidPosition(pos: Position): boolean {
		return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
	}
	
	/**
	 * Get the maximum possible distance in this grid (corner to corner)
	 */
	maxDistance(): number {
		return Math.floor(Math.sqrt((this.width - 1) ** 2 + (this.height - 1) ** 2));
	}
	
	/**
	 * Get all valid positions in the grid
	 */
	getAllPositions(): Position[] {
		const positions: Position[] = [];
		
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				positions.push({ x, y });
			}
		}
		
		return positions;
	}
	
	/**
	 * Get grid dimensions
	 */
	getDimensions(): { width: number; height: number } {
		return { width: this.width, height: this.height };
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
