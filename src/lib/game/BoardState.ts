import type { IGridSystem, Position } from '../grid/IGridSystem.js';

/**
 * Represents the state of a single cell in the game board
 */
export interface GridCell {
	position: Position;
	shade: number;
	value: number | null;
	clicked: boolean;
	fadeCounter: number;
}

/**
 * Manages the state of all cells on the game board
 * Handles cell state operations like fading, clicking, and value setting
 * Does NOT handle geometry operations - delegates to IGridSystem
 */
export class BoardState {
	private static readonly MAX_GRID_SIZE = 24;
	
	private gridSystem: IGridSystem;
	private cells: Map<string, GridCell>;
	private fadeSteps: number;
	
	constructor(gridSystem: IGridSystem, fadeSteps: number = 3) {
		// Validate grid dimensions
		const dimensions = gridSystem.getDimensions();
		if (dimensions.width <= 0 || dimensions.height <= 0) {
			throw new Error('Grid dimensions must be positive integers');
		}
		if (dimensions.width > BoardState.MAX_GRID_SIZE || dimensions.height > BoardState.MAX_GRID_SIZE) {
			throw new Error(`Grid dimensions cannot exceed ${BoardState.MAX_GRID_SIZE}`);
		}
		
		this.gridSystem = gridSystem;
		this.fadeSteps = fadeSteps;
		this.cells = new Map();
		this.initializeCells();
	}
	
	/**
	 * Initialize a single cell to default state
	 */
	initializeCell(pos: Position): void {
		const cell = this.getCell(pos);
		if (cell) {
			cell.shade = 100;
			cell.value = null;
			cell.clicked = false;
			cell.fadeCounter = 0;
		}
	}

	/**
	 * Initialize all cells to default state
	 */
	private initializeCells(): void {
		const positions = this.gridSystem.getAllPositions();
		
		for (const position of positions) {
			const cell: GridCell = {
				position,
				shade: 100,
				value: null,
				clicked: false,
				fadeCounter: 0
			};
			this.cells.set(this.positionKey(position), cell);
		}
	}
	
	/**
	 * Generate a unique key for a position
	 */
	private positionKey(pos: Position): string {
		return `${pos.x},${pos.y}`;
	}
	
	/**
	 * Get a cell at the specified position
	 */
	getCell(pos: Position): GridCell | null {
		return this.cells.get(this.positionKey(pos)) || null;
	}
	
	/**
	 * Set a cell's clicked state and value
	 */
	setCellClicked(pos: Position, value: number): void {
		// Validate value is not negative
		if (value < 0) {
			throw new Error('Cell value cannot be negative');
		}
		
		// Validate coordinates are valid
		if (!this.gridSystem.isValidPosition(pos)) {
			throw new Error('Invalid position');
		}
		
		const cell = this.getCell(pos);
		if (cell) {
			cell.value = value;
			cell.shade = 0;
			cell.clicked = true;
			cell.fadeCounter = this.fadeSteps;
		}
	}
	

	
	/**
	 * Apply fade step to all clicked cells
	 * Decrements fadeCounter for all clicked cells and updates their shade
	 */
	fadeStep(): void {
		for (const cell of this.cells.values()) {
			if (cell.clicked && cell.fadeCounter > 0) {
				cell.fadeCounter--;
				
				// If fade counter reaches 0, reset the cell completely
				if (cell.fadeCounter === 0) {
					this.initializeCell(cell.position);
				} else {
					// Calculate shade based on fade counter
					cell.shade = this.fadeValue(cell.fadeCounter);
				}
			}
		}
	}
	
	/**
	 * Get all cells as an array
	 */
	getAllCells(): GridCell[] {
		return Array.from(this.cells.values());
	}
	
	/**
	 * Get cells as a 2D array for display purposes
	 */
	getCellsAs2DArray(): GridCell[][] {
		const { width, height } = this.gridSystem.getDimensions();
		const grid: GridCell[][] = [];
		
		for (let y = 0; y < height; y++) {
			const row: GridCell[] = [];
			for (let x = 0; x < width; x++) {
				const cell = this.getCell({ x, y });
				if (cell) {
					row.push(cell);
				}
			}
			grid.push(row);
		}
		
		return grid;
	}
	
	/**
	 * Reset all cells to initial state
	 */
	reset(): void {
		const positions = this.gridSystem.getAllPositions();
		for (const position of positions) {
			this.initializeCell(position);
		}
	}
	
	/**
	 * Calculate shade value based on fade counter
	 * Encapsulates fadeSteps logic for consistent fade progression
	 */
	private fadeValue(fadeCounter: number): number {
		// Calculate fade progress: fadeSteps=4, fadeCounter=3 -> 25%, fadeCounter=2 -> 50%, etc.
		const fadeProgress = (this.fadeSteps - fadeCounter) / this.fadeSteps;
		return Math.round(fadeProgress * 100);
	}
	
	/**
	 * Get the grid system for external use
	 */
	getGridSystem(): IGridSystem {
		return this.gridSystem;
	}
	
	/**
	 * Get the fade steps configuration
	 */
	getFadeSteps(): number {
		return this.fadeSteps;
	}
}
