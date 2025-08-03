import type { IGridSystem, Position } from '../grid/IGridSystem.js';
import { ColorFader, COLORS, getDistanceColor } from './ColorManager.js';

/**
 * Represents the state of a single cell in the game board
 */
export class GridCell {
	position: Position;
	value: number | null;
	clicked: boolean = false;
	/**
	 * Color manager for this cell, used to handle color fading
	 * @type {ColorFader | null}
	 */
	fader: ColorFader | null = null;

	constructor(pos: Position) {
		this.position = pos;
		this.value = null;
	}

	public shade() {
		return this.fader?.color;
	}

	public setColorManager(
		startRGB:  string,
		endRGB:    string,
		fadeSteps: number
	) {
		console.log(`setColorManager() for cell at ${this.position.x},${this.position.y} with startRGB=${startRGB}, endRGB=${endRGB}, fadeSteps=${fadeSteps}`);
		const fader = new ColorFader( startRGB, endRGB, fadeSteps );
		this.fader = fader;
	}
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
			cell.value = null;
			cell.clicked = false;
			cell.fader = null; // Reset color manager
		}
	}

	/**
	 * Initialize all cells to default state
	 */
	private initializeCells(): void {
		const positions = this.gridSystem.getAllPositions();
		
		for (const position of positions) {
			const cell = new GridCell(position);
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
		console.log(`setCellClicked() at ${pos.x},${pos.y} to value ${value}`);
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
			cell.clicked = true;
			cell.setColorManager(
				getDistanceColor(value, this.gridSystem.maxDistance()), 
				COLORS.unclicked, 
				this.getFadeSteps()
			);
		}
	}
	
	/**
	 * Apply fade step to all clicked cells
	 * Decrements fadeCounter for all clicked cells and updates their shade
	 */
	fadeStep(): void {
		for (const cell of this.cells.values()) {
			if (cell.clicked && cell.fader != null) {
				cell.fader.next();
				//cell.shade = cell.fader.color();
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
