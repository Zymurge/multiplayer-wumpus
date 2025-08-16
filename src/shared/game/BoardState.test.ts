import { describe, it, expect } from 'vitest';
import { BoardState } from './BoardState.js';
import type { IGridSystem, Position } from '@shared/grid/IGridSystem.js';
// import { GridCell } from '$lib/grid/IGridSystem.js';

// class StubGridCell extends GridCell {
// 	constructor() {
// 		super( { x: 0, y: 0 } );
// 	}
// }

class StubGrid implements IGridSystem {
	width: number;
	height: number;

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	distanceFake = 0;
	distance(a: Position, b: Position): number {
		// Manhattan distance stub
		return this.distanceFake;
	}

	getAdjacentPositions(pos: Position): Position[] {
		// Return 4-way adjacent positions
		const adj: Position[] = [];
		const dirs = [
			{ x: 0, y: -1 },
			{ x: 1, y: 0 },
			{ x: 0, y: 1 },
			{ x: -1, y: 0 }
		];
		for (const d of dirs) {
			const np = { x: pos.x + d.x, y: pos.y + d.y };
			if (this.isValidPosition(np)) adj.push(np);
		}
		return adj;
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

	getDimensions(): { width: number; height: number } {
		return { width: this.width, height: this.height };
	}
	
	randomPositionFake = { x: 0, y: 0 };
	getRandomMovement(pos: Position): Position {
		return this.randomPositionFake;
	}

	getRandomPosition(): Position {
		return this.randomPositionFake;
	}

	validPositionFake = true;
	isValidPosition(pos: Position): boolean {
		return this.validPositionFake;
	}

	maxDistanceFake = 5;
	maxDistance(): number {
		return this.maxDistanceFake;
	}
}

describe('BoardState', () => {
	describe('constructor and initialization', () => {
		it('should validate that dimensions are positive integers', () => {
			expect(() => new BoardState(new StubGrid(0, 5))).toThrow('Grid dimensions must be positive integers');
			expect(() => new BoardState(new StubGrid(5, 0))).toThrow('Grid dimensions must be positive integers');
			expect(() => new BoardState(new StubGrid(-1, 5))).toThrow('Grid dimensions must be positive integers');
			expect(() => new BoardState(new StubGrid(5, -1))).toThrow('Grid dimensions must be positive integers');
		});

		it('should enforce maximum grid size', () => {
			const maxSize = 24;
			expect(() => new BoardState(new StubGrid(25, 5))).toThrow(`Grid dimensions cannot exceed ${maxSize}`);
			expect(() => new BoardState(new StubGrid(5, 25))).toThrow(`Grid dimensions cannot exceed ${maxSize}`);
			expect(() => new BoardState(new StubGrid(25, 25))).toThrow(`Grid dimensions cannot exceed ${maxSize}`);
		});

		it('should accept valid dimensions within limits', () => {
			expect(() => new BoardState(new StubGrid(1, 1))).not.toThrow();
			expect(() => new BoardState(new StubGrid(24, 24))).not.toThrow();
			expect(() => new BoardState(new StubGrid(10, 15))).not.toThrow();
		});

		it('should take fadeSteps parameter with default of 3', () => {
			const grid = new StubGrid(3, 3);
			const defaultBoard = new BoardState(grid);
			const customBoard = new BoardState(grid, 5);
			
			// We'll need to expose fadeSteps or test its behavior
			expect(defaultBoard.getFadeSteps()).toBe(3);
			expect(customBoard.getFadeSteps()).toBe(5);
		});

		it('should validate that fadeSteps are correctly applied in initialization using non-default value', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid, 7);
			const pos: Position = { x: 1, y: 1 };
			
			// When a cell is clicked, fadeCounter should be set to fadeSteps value
			board.setCellClicked(pos, 5);
			const cell = board.getCell(pos);
			
			expect(cell!.fader?.steps).toBe(7);
		});

		it('should initialize all cells to default state', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid);
			
			const positions = grid.getAllPositions();
			for (const pos of positions) {
				const cell = board.getCell(pos);
				expect(cell).not.toBeNull();
				expect(cell!.value).toBeNull();
				expect(cell!.clicked).toBe(false);
				expect(cell!.fader!.steps).toBe(0);
				expect(cell!.position).toEqual(pos);
			}
		});

		it('should store reference to grid system', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid);
			
			expect(board.getGridSystem()).toBe(grid);
		});
	});

	describe('cell access', () => {
		it('should get cell at valid position', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid);
			const pos: Position = { x: 1, y: 1 };
			
			const cell = board.getCell(pos);
			expect(cell).not.toBeNull();
			expect(cell!.position).toEqual(pos);
		});

		it('should return null for invalid position', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid);
			
			expect(board.getCell({ x: 5, y: 5 })).toBeNull();
			expect(board.getCell({ x: -1, y: 0 })).toBeNull();
			expect(board.getCell({ x: 0, y: -1 })).toBeNull();
		});
	});

	describe('cell clicking', () => {
		it('should set cell as clicked with correct values', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid, 4);
			const pos: Position = { x: 1, y: 1 };
			
			board.setCellClicked(pos, 5);
			
			const cell = board.getCell(pos);
			expect(cell!.value).toBe(5);
			expect(cell!.clicked).toBe(true);
			expect(cell!.fader).not.toBeNull();
			expect(cell!.fader!.steps).toBe(board.getFadeSteps());
		});

		it('should not accept negative values', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid);
			const pos: Position = { x: 1, y: 1 };
			
			expect(() => board.setCellClicked(pos, -1)).toThrow('Cell value cannot be negative');
			expect(() => board.setCellClicked(pos, -5)).toThrow('Cell value cannot be negative');
		});

		it('should error on illegal coordinates', () => {
			const grid = new StubGrid(3, 3);
			grid.validPositionFake = false; // Force invalid positions
			const board = new BoardState(grid);
			
			expect(() => board.setCellClicked({ x: 5, y: 5 }, 3)).toThrow('Invalid position');
			expect(() => board.setCellClicked({ x: -1, y: 0 }, 3)).toThrow('Invalid position');
			expect(() => board.setCellClicked({ x: 0, y: -1 }, 3)).toThrow('Invalid position');
		});

		it('should not affect other cells when setting one clicked', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid);
			const clickedPos: Position = { x: 1, y: 1 };
			const otherPos: Position = { x: 0, y: 0 };
			
			board.setCellClicked(clickedPos, 5);
			
			const otherCell = board.getCell(otherPos);
			expect(otherCell!.value).toBeNull();
			expect(otherCell!.clicked).toBe(false);
			expect(otherCell!.fadeStep).toBe(0);
		});

		it('should respect custom fadeSteps value', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid, 5);
			const pos: Position = { x: 1, y: 1 };
			
			board.setCellClicked(pos, 3);
			
			const cell = board.getCell(pos);
			expect(cell!.fader).not.toBeNull();
			expect(cell!.fader!.steps).toBe(board.getFadeSteps());
		});
	});

	describe('fade step', () => {
		it('should fade all clicked cells by fade increment', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid, 4); // fadeSteps = 4
			
			// Click some cells
			board.setCellClicked({ x: 0, y: 0 }, 1);
			board.setCellClicked({ x: 1, y: 1 }, 2);
			board.setCellClicked({ x: 2, y: 2 }, 3);
			
			// Initial state: all should have fadeCounter = 0
			expect(board.getCell({ x: 0, y: 0 })!.fadeStep).toBe(0);
			expect(board.getCell({ x: 1, y: 1 })!.fadeStep).toBe(0);
			expect(board.getCell({ x: 2, y: 2 })!.fadeStep).toBe(0);
			
			board.fadeStep();
			
			// After fade step: all should have fadeCounter = 1
			expect(board.getCell({ x: 0, y: 0 })!.fadeStep).toBe(1);
			expect(board.getCell({ x: 1, y: 1 })!.fadeStep).toBe(1);
			expect(board.getCell({ x: 2, y: 2 })!.fadeStep).toBe(1);
		});

		it('should reset cell when fade counter reaches zero', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid, 1); // fadeSteps = 1
			const pos: Position = { x: 1, y: 1 };
			
			board.setCellClicked(pos, 5);
			expect(board.getCell(pos)!.fadeStep).toBe(0);
			
			board.fadeStep();
			
			const cell = board.getCell(pos);
			expect(cell!.clicked).toBe(false);
			expect(cell!.value).toBeNull();
			expect(cell!.fadeStep).toBe(1);
		});

		it('should not affect unclicked cells', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid);
			const clickedPos: Position = { x: 1, y: 1 };
			const unclickedPos: Position = { x: 0, y: 0 };
			
			board.setCellClicked(clickedPos, 5);
			
			const unclickedBefore = board.getCell(unclickedPos);
			board.fadeStep();
			const unclickedAfter = board.getCell(unclickedPos);
			
			expect(unclickedAfter).toEqual(unclickedBefore);
		});
	});

	describe('get cells as 2D array', () => {
		it('should return cells as 2D array in correct order', () => {
			const grid = new StubGrid(2, 3);
			const board = new BoardState(grid);
			
			const cells2D = board.getCellsAs2DArray();
			
			expect(cells2D).toHaveLength(3); // height
			expect(cells2D[0]).toHaveLength(2); // width
			expect(cells2D[1]).toHaveLength(2);
			expect(cells2D[2]).toHaveLength(2);
			
			// Check positions are correct
			expect(cells2D[0][0].position).toEqual({ x: 0, y: 0 });
			expect(cells2D[0][1].position).toEqual({ x: 1, y: 0 });
			expect(cells2D[1][0].position).toEqual({ x: 0, y: 1 });
			expect(cells2D[1][1].position).toEqual({ x: 1, y: 1 });
			expect(cells2D[2][0].position).toEqual({ x: 0, y: 2 });
			expect(cells2D[2][1].position).toEqual({ x: 1, y: 2 });
		});

		it('should reject empty grid', () => {
			expect(() => new BoardState(new StubGrid(0, 0))).toThrow('Grid dimensions must be positive integers');
		});
	});

	describe('initialize single cell', () => {
		it('should reset a single cell to default state', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid);
			const pos: Position = { x: 1, y: 1 };
			
			// Click cell and modify its state
			board.setCellClicked(pos, 5);
			board.fadeStep();
			
			// Verify cell is modified
			let cell = board.getCell(pos);
			expect(cell!.clicked).toBe(true);
			expect(cell!.value).toBe(5);
			expect(cell!.shade).not.toBe(100);
			
			// Initialize the cell
			board.initializeCell(pos);
			
			// Verify cell is reset to default
			cell = board.getCell(pos);
			expect(cell!.value).toBeNull();
			expect(cell!.clicked).toBe(false);
			expect(cell!.fadeStep).toBe(0);
		});

		it('should handle invalid position gracefully', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid);
			
			// Should not throw error for invalid position
			expect(() => board.initializeCell({ x: 10, y: 10 })).not.toThrow();
		});

		it('should not affect other cells', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid);
			const pos1: Position = { x: 0, y: 0 };
			const pos2: Position = { x: 1, y: 1 };
			
			// Click both cells
			board.setCellClicked(pos1, 3);
			board.setCellClicked(pos2, 7);
			
			// Initialize only one cell
			board.initializeCell(pos1);
			
			// First cell should be reset, second should be unchanged
			expect(board.getCell(pos1)!.clicked).toBe(false);
			expect(board.getCell(pos2)!.clicked).toBe(true);
			expect(board.getCell(pos2)!.value).toBe(7);
		});
	});

	describe('reset', () => {
		it('should reset all cells to default state', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid);
			
			// Click some cells and modify states
			board.setCellClicked({ x: 0, y: 0 }, 1);
			board.setCellClicked({ x: 1, y: 1 }, 2);
			board.fadeStep();
			
			board.reset();
			
			// Check all cells are back to default
			const positions = grid.getAllPositions();
			for (const pos of positions) {
				const cell = board.getCell(pos);
				expect(cell!.value).toBeNull();
				expect(cell!.clicked).toBe(false);
				expect(cell!.fadeStep).toBe(0);
			}
		});

		it('should not change grid system reference', () => {
			const grid = new StubGrid(3, 3);
			const board = new BoardState(grid);
			
			board.reset();
			
			expect(board.getGridSystem()).toBe(grid);
		});
	});
});
