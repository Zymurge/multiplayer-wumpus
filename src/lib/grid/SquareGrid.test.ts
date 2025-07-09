import { describe, it, expect } from 'vitest';
import { SquareGrid } from './SquareGrid.js';
import type { Position } from './IGridSystem.js';

describe('SquareGrid', () => {
	describe('constructor and basic properties', () => {
		it('should create a grid with specified dimensions', () => {
			const grid = new SquareGrid(5, 3);
			const dims = grid.getDimensions();
			
			expect(dims.width).toBe(5);
			expect(dims.height).toBe(3);
		});
	});

	describe('distance calculation', () => {
		it('should calculate distance between same position as 0', () => {
			const grid = new SquareGrid(5, 5);
			const pos: Position = { x: 2, y: 2 };
			
			expect(grid.distance(pos, pos)).toBe(0);
		});

		it('should calculate distance between adjacent horizontal positions', () => {
			const grid = new SquareGrid(5, 5);
			const pos1: Position = { x: 1, y: 2 };
			const pos2: Position = { x: 2, y: 2 };
			
			expect(grid.distance(pos1, pos2)).toBe(1);
		});

		it('should calculate distance between adjacent vertical positions', () => {
			const grid = new SquareGrid(5, 5);
			const pos1: Position = { x: 2, y: 1 };
			const pos2: Position = { x: 2, y: 2 };
			
			expect(grid.distance(pos1, pos2)).toBe(1);
		});

		it('should calculate distance between diagonal positions', () => {
			const grid = new SquareGrid(5, 5);
			const pos1: Position = { x: 0, y: 0 };
			const pos2: Position = { x: 1, y: 1 };
			
			// sqrt(2) ≈ 1.414, floor(1.414) = 1
			expect(grid.distance(pos1, pos2)).toBe(1);
		});

		it('should calculate distance between corner positions', () => {
			const grid = new SquareGrid(5, 5);
			const pos1: Position = { x: 0, y: 0 };
			const pos2: Position = { x: 4, y: 4 };
			
			// sqrt(16 + 16) = sqrt(32) ≈ 5.65, floor(5.65) = 5
			expect(grid.distance(pos1, pos2)).toBe(5);
		});

		it('should be symmetric', () => {
			const grid = new SquareGrid(5, 5);
			const pos1: Position = { x: 1, y: 2 };
			const pos2: Position = { x: 3, y: 4 };
			
			expect(grid.distance(pos1, pos2)).toBe(grid.distance(pos2, pos1));
		});

		it('should calculate distance between points in same row', () => {
			const grid = new SquareGrid(5, 5);
			const pos1: Position = { x: 1, y: 2 };
			const pos2: Position = { x: 4, y: 2 };
			
			// Distance should be 3 (horizontal distance only)
			expect(grid.distance(pos1, pos2)).toBe(3);
		});

		it('should calculate distance between points in same column', () => {
			const grid = new SquareGrid(5, 5);
			const pos1: Position = { x: 2, y: 1 };
			const pos2: Position = { x: 2, y: 4 };
			
			// Distance should be 3 (vertical distance only)
			expect(grid.distance(pos1, pos2)).toBe(3);
		});

		it('should handle distance calculation for points outside boundaries', () => {
			const grid = new SquareGrid(5, 5);
			const validPos: Position = { x: 2, y: 2 };
			const invalidPos: Position = { x: 10, y: 2 };
			
			// Distance should still be calculated (interface doesn't require validation)
			// Distance from (2,2) to (10,2) = 8
			expect(grid.distance(validPos, invalidPos)).toBe(8);
		});

		it('should handle distance calculation between two points outside boundaries', () => {
			const grid = new SquareGrid(5, 5);
			const pos1: Position = { x: -1, y: 2 };
			const pos2: Position = { x: 10, y: 2 };
			
			// Distance from (-1,2) to (10,2) = 11
			expect(grid.distance(pos1, pos2)).toBe(11);
		});
	});

	describe('position validation', () => {
		const grid = new SquareGrid(3, 4);

		it('should validate positions within boundaries', () => {
			expect(grid.isValidPosition({ x: 0, y: 0 })).toBe(true);
			expect(grid.isValidPosition({ x: 2, y: 3 })).toBe(true);
			expect(grid.isValidPosition({ x: 1, y: 2 })).toBe(true);
		});

		it('should reject positions outside boundaries', () => {
			expect(grid.isValidPosition({ x: -1, y: 0 })).toBe(false);
			expect(grid.isValidPosition({ x: 0, y: -1 })).toBe(false);
			expect(grid.isValidPosition({ x: 3, y: 0 })).toBe(false);
			expect(grid.isValidPosition({ x: 0, y: 4 })).toBe(false);
			expect(grid.isValidPosition({ x: 3, y: 4 })).toBe(false);
		});
	});

	describe('random position generation', () => {
		it('should generate valid positions', () => {
			const grid = new SquareGrid(5, 5);
			
			for (let i = 0; i < 100; i++) {
				const pos = grid.getRandomPosition();
				expect(grid.isValidPosition(pos)).toBe(true);
			}
		});

		it('should generate positions within bounds', () => {
			const grid = new SquareGrid(3, 4);
			
			for (let i = 0; i < 100; i++) {
				const pos = grid.getRandomPosition();
				expect(pos.x).toBeGreaterThanOrEqual(0);
				expect(pos.x).toBeLessThan(3);
				expect(pos.y).toBeGreaterThanOrEqual(0);
				expect(pos.y).toBeLessThan(4);
			}
		});
	});

	describe('adjacent positions', () => {
		it('should return 8 adjacent positions for center position', () => {
			const grid = new SquareGrid(5, 5);
			const center: Position = { x: 2, y: 2 };
			const adjacent = grid.getAdjacentPositions(center);
			
			expect(adjacent).toHaveLength(8);
			
			const expected = [
				{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 },
				{ x: 2, y: 1 },                 { x: 2, y: 3 },
				{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }
			];
			
			expect(adjacent).toEqual(expect.arrayContaining(expected));
		});

		it('should return 3 adjacent positions for corner position', () => {
			const grid = new SquareGrid(5, 5);
			const corner: Position = { x: 0, y: 0 };
			const adjacent = grid.getAdjacentPositions(corner);
			
			expect(adjacent).toHaveLength(3);
			
			const expected = [
				{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }
			];
			
			expect(adjacent).toEqual(expect.arrayContaining(expected));
		});

		it('should return 5 adjacent positions for edge position', () => {
			const grid = new SquareGrid(5, 5);
			const edge: Position = { x: 0, y: 2 };
			const adjacent = grid.getAdjacentPositions(edge);
			
			expect(adjacent).toHaveLength(5);
			
			const expected = [
				{ x: 0, y: 1 }, { x: 0, y: 3 },
				{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }
			];
			
			expect(adjacent).toEqual(expect.arrayContaining(expected));
		});

		it('should return 5 adjacent positions for side column position', () => {
			const grid = new SquareGrid(5, 5);
			const sideCol: Position = { x: 4, y: 2 }; // Right edge
			const adjacent = grid.getAdjacentPositions(sideCol);
			
			expect(adjacent).toHaveLength(5);
			
			const expected = [
				{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
				{ x: 4, y: 1 }, { x: 4, y: 3 }
			];
			
			expect(adjacent).toEqual(expect.arrayContaining(expected));
		});

		it('should return 5 adjacent positions for bottom row position', () => {
			const grid = new SquareGrid(5, 5);
			const bottomRow: Position = { x: 2, y: 4 }; // Bottom edge
			const adjacent = grid.getAdjacentPositions(bottomRow);
			
			expect(adjacent).toHaveLength(5);
			
			const expected = [
				{ x: 1, y: 3 }, { x: 1, y: 4 },
				{ x: 2, y: 3 },
				{ x: 3, y: 3 }, { x: 3, y: 4 }
			];
			
			expect(adjacent).toEqual(expect.arrayContaining(expected));
		});

		it('should only return valid positions', () => {
			const grid = new SquareGrid(3, 3);
			const positions = grid.getAllPositions();
			
			for (const pos of positions) {
				const adjacent = grid.getAdjacentPositions(pos);
				for (const adj of adjacent) {
					expect(grid.isValidPosition(adj)).toBe(true);
				}
			}
		});
	});

	describe('maximum distance', () => {
		it('should return correct max distance for square grid', () => {
			const grid = new SquareGrid(5, 5);
			// Distance from (0,0) to (4,4) = sqrt(16 + 16) = sqrt(32) ≈ 5.65, floor = 5
			expect(grid.maxDistance()).toBe(5);
		});

		it('should return correct max distance for rectangular grid', () => {
			const grid = new SquareGrid(3, 4);
			// Distance from (0,0) to (2,3) = sqrt(4 + 9) = sqrt(13) ≈ 3.60, floor = 3
			expect(grid.maxDistance()).toBe(3);
		});

		it('should return correct max distance for 1x1 grid', () => {
			const grid = new SquareGrid(1, 1);
			expect(grid.maxDistance()).toBe(0);
		});
	});

	describe('get all positions', () => {
		it('should return all positions in correct order', () => {
			const grid = new SquareGrid(2, 3);
			const positions = grid.getAllPositions();
			
			expect(positions).toHaveLength(6);
			
			const expected = [
				{ x: 0, y: 0 }, { x: 1, y: 0 },
				{ x: 0, y: 1 }, { x: 1, y: 1 },
				{ x: 0, y: 2 }, { x: 1, y: 2 }
			];
			
			expect(positions).toEqual(expected);
		});

		it('should return empty array for 0x0 grid', () => {
			const grid = new SquareGrid(0, 0);
			const positions = grid.getAllPositions();
			
			expect(positions).toHaveLength(0);
		});
	});

	describe('random movement generation', () => {
		it('should generate movement vectors in range [-1, 1]', () => {
			const grid = new SquareGrid(5, 5);
			
			for (let i = 0; i < 100; i++) {
				const movement = grid.getRandomMovement();
				expect(movement.x).toBeGreaterThanOrEqual(-1);
				expect(movement.x).toBeLessThanOrEqual(1);
				expect(movement.y).toBeGreaterThanOrEqual(-1);
				expect(movement.y).toBeLessThanOrEqual(1);
			}
		});

		it('should generate all possible movement combinations over many iterations', () => {
			const grid = new SquareGrid(5, 5);
			const movements = new Set<string>();
			
			for (let i = 0; i < 1000; i++) {
				const movement = grid.getRandomMovement();
				movements.add(`${movement.x},${movement.y}`);
			}
			
			// Should have generated most of the 9 possible combinations
			expect(movements.size).toBeGreaterThan(5);
		});

		it('should generate movement that can result in position outside grid', () => {
			const grid = new SquareGrid(3, 3);
			const cornerPos: Position = { x: 0, y: 0 };
			let foundOutsideMovement = false;
			
			// Try many times to find a movement that would go outside
			for (let i = 0; i < 100; i++) {
				const movement = grid.getRandomMovement();
				const newPos = { x: cornerPos.x + movement.x, y: cornerPos.y + movement.y };
				
				if (!grid.isValidPosition(newPos)) {
					foundOutsideMovement = true;
					break;
				}
			}
			
			// Should eventually find a movement that goes outside (like -1,-1 from 0,0)
			expect(foundOutsideMovement).toBe(true);
		});
	});
});
