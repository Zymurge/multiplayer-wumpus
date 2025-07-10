/**
 * Represents a position in the grid system
 */
export interface Position {
	x: number;
	y: number;
}

/**
 * Interface for grid geometry operations
 * Handles spatial relationships, distance calculations, and position validation
 * Does NOT manage cell state or game logic
 * 
 * Implementations should be stateless and focused purely on geometric operations
 */
export interface IGridSystem {
	/**
	 * Calculate distance between two positions using this grid's metric
	 * @param pos1 First position
	 * @param pos2 Second position
	 * @returns Distance as a number (implementation-specific units)
	 */
	distance(pos1: Position, pos2: Position): number;
	
	/**
	 * Get a random valid position within the grid boundaries
	 * @returns A valid position within the grid
	 */
	getRandomPosition(): Position;
	
	/**
	 * Get all adjacent positions to the given position
	 * Only returns positions that are valid within grid boundaries
	 * @param pos The center position
	 * @returns Array of adjacent valid positions
	 */
	getAdjacentPositions(pos: Position): Position[];
	
	/**
	 * Check if a position is valid within grid boundaries
	 * @param pos Position to validate
	 * @returns True if position is within grid boundaries
	 */
	isValidPosition(pos: Position): boolean;
	
	/**
	 * Get the maximum possible distance in this grid
	 * Useful for normalizing distances or calculating ratios
	 * @returns Maximum distance between any two valid positions
	 */
	maxDistance(): number;
	
	/**
	 * Get all valid positions in the grid
	 * @returns Array of all valid positions within grid boundaries
	 */
	getAllPositions(): Position[];
	
	/**
	 * Get grid dimensions
	 * @returns Object containing grid dimensions
	 */
	getDimensions(): { width: number; height: number };

	/**
	 * Get a random neighbor from the set of all valid adjacent cells plus the origin
	 * No move can be considered a random move afterall
	 * @returns Cell position of the random move
	 */
	getRandomMovement(pos: Position): Position;
}
