import { HexGrid } from '../grid/HexGrid.js';
import { BoardState } from './BoardState.js';
import type { Position } from '../grid/IGridSystem.js';

type WumpusPosition = Position;

/**
 * High-level game orchestrator:
 *   • Chooses initial Wumpus position via GridSystem.getRandomPosition()
 *   • On each click: computes distance, updates BoardModel, moves Wumpus
 *   • Implements movement rules (getRandomMovement)
 *   • Exposes get(), getCellsAs2DArray(), setClicked(), reset()
 */
export class GameGrid {
	private gridSystem: HexGrid;
	private boardState: BoardState;
	wumpus: WumpusPosition;
	last: { x: number; y: number; dist: number } | null;
	clickCount: number;
	
	constructor(x: number, y: number, fadeSteps: number = 3) {
		this.gridSystem = new HexGrid(x, y);
		this.boardState = new BoardState(this.gridSystem, fadeSteps);
		this.wumpus = this.initWumpus();
		this.last = null;
		this.clickCount = 0;
	}

	/**
	 * Get a cell at the specified position
	 * Delegates to BoardState for cell state management
	 */
	get(x: number, y: number) {
		return this.boardState.getCell({ x, y });
	}

	/**
	 * Get all cells as 2D array for display
	 * Delegates to BoardState
	 */
	getCellsAs2DArray() {
		return this.boardState.getCellsAs2DArray();
	}

	/**
	 * Get grid dimensions
	 */
	getDimensions() {
		return this.gridSystem.getDimensions();
	}

	/**
	 * Initialize wumpus at random position
	 * Uses gridSystem for position generation
	 */
	initWumpus(): WumpusPosition {
		return this.gridSystem.getRandomPosition();
	}

	/**
	 * Move wumpus based on distance between clicks
	 * Uses gridSystem for movement generation and validation
	 */
	moveWumpus(dist: number) {
		const moves = Math.floor(dist / 2);
		for (let i = moves; i > 0; i--) {
			const movement = this.gridSystem.getRandomMovement(this.wumpus);
			console.log(`-- ${i}: wumpus moving from ${this.wumpus.x},${this.wumpus.y} to ${movement.x},${movement.y}`);
			
			this.wumpus.x = movement.x;
			this.wumpus.y = movement.y;
		}
	}

	/**
	 * Handle cell click - main game logic
	 * Uses gridSystem for distance calculation and BoardState for cell state
	 */
	setClicked(x: number, y: number): { found: boolean; distance: number } {
		const clickPos = { x, y };
		
		// Calculate distance using gridSystem
		const distance = this.gridSystem.distance(this.wumpus, clickPos);
		
		// Apply fade step to all clicked cells first
		this.boardState.fadeStep();
		
		// Set clicked cell state using BoardState
		this.boardState.setCellClicked(clickPos, distance);
		
		const found = distance === 0;
		this.clickCount++;
		
		if (this.last && !found) {
			// Calculate movement distance using gridSystem
			const moveDist = this.gridSystem.distance(this.last, clickPos);
			this.last = { x, y, dist: moveDist };
			console.log(`The distance between clicks is ${moveDist}`);
			this.moveWumpus(moveDist);
		} else {
			this.last = { x, y, dist: 0 };
			console.log('First move, no previous distance');
		}
		
		return { found, distance };
	}

	/**
	 * Reset the game state
	 * Delegates to BoardState for cell reset
	 */
	reset(): void {
		this.boardState.reset();
		this.wumpus = this.initWumpus();
		this.last = null;
		this.clickCount = 0;
	}
}
