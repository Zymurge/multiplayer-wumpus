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
export class GameBoard {
	private gridSystem: IGridSystem;
	private cells: Map<string, GridCell>;
	
	constructor(gridSystem: IGridSystem) {
		this.gridSystem = gridSystem;
		this.cells = new Map();
		this.initializeCells();
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
		const cell = this.getCell(pos);
		if (cell) {
			cell.value = value;
			cell.shade = 0;
			cell.clicked = true;
			cell.fadeCounter = 3;
		}
	}
	
	/**
	 * Apply fade to all cells based on rate
	 */
	fadeAllCells(rate: number): void {
		for (const cell of this.cells.values()) {
			cell.shade = this.fadeValue(cell.shade, rate);
		}
	}
	
	/**
	 * Apply fade based on click count for all cells except the clicked one
	 */
	fadeBasedOnClicks(clickedPos: Position): void {
		const clickedKey = this.positionKey(clickedPos);
		
		for (const [key, cell] of this.cells) {
			if (cell.clicked && cell.fadeCounter > 0) {
				// Decrement fade counter for all squares except the one just clicked
				if (key !== clickedKey) {
					cell.fadeCounter--;
				}
				
				// If fade counter reaches 0, reset the square completely
				if (cell.fadeCounter === 0) {
					cell.shade = 100;
					cell.clicked = false;
					cell.value = null;
				} else {
					// Set shade based on fade counter: 3=0%, 2=33%, 1=66%
					cell.shade = (3 - cell.fadeCounter) * 33;
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
		this.initializeCells();
	}
	
	/**
	 * Helper method to calculate fade value
	 */
	private fadeValue(current: number, rate: number): number {
		const newValue = current + rate;
		return newValue < 100 ? newValue : 100;
	}
	
	/**
	 * Get the grid system for external use
	 */
	getGridSystem(): IGridSystem {
		return this.gridSystem;
	}
}
