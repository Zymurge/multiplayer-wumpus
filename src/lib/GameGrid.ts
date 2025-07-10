import { SquareGrid } from './grid/SquareGrid.js';
import { GameBoard } from './game/GameBoard.js';
import type { Position } from './grid/IGridSystem.js';

export interface WumpusPosition extends Position {}

export class GameGrid {
	private gridSystem: SquareGrid;
	private gameBoard: GameBoard;
	wumpus: WumpusPosition;
	last: { x: number; y: number; dist: number } | null;
	clickCount: number;
	
	constructor(x: number, y: number, fadeSteps: number = 3) {
		this.gridSystem = new SquareGrid(x, y);
		this.gameBoard = new GameBoard(this.gridSystem, fadeSteps);
		this.wumpus = this.initWumpus();
		this.last = null;
		this.clickCount = 0;
	}

	/**
	 * Get a cell at the specified position
	 * Delegates to GameBoard for cell state management
	 */
	get(x: number, y: number) {
		return this.gameBoard.getCell({ x, y });
	}

	/**
	 * Get all cells as 2D array for display
	 * Delegates to GameBoard
	 */
	getCellsAs2DArray() {
		return this.gameBoard.getCellsAs2DArray();
	}

	/**
	 * Get grid dimensions
	 */
	getDimensions() {
		return this.gridSystem.getDimensions();
	}

	/**
	 * Initialize wumpus at random position
	 * Uses SquareGrid for position generation
	 */
	initWumpus(): WumpusPosition {
		return this.gridSystem.getRandomPosition();
	}

	/**
	 * Move wumpus based on distance between clicks
	 * Uses SquareGrid for movement generation and validation
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
	 * Uses SquareGrid for distance calculation and GameBoard for cell state
	 */
	setClicked(x: number, y: number): { found: boolean; distance: number } {
		const clickPos = { x, y };
		
		// Calculate distance using SquareGrid
		const distance = this.gridSystem.distance(this.wumpus, clickPos);
		
		// Apply fade step to all clicked cells first
		this.gameBoard.fadeStep();
		
		// Set clicked cell state using GameBoard
		this.gameBoard.setCellClicked(clickPos, distance);
		
		const found = distance === 0;
		this.clickCount++;
		
		if (this.last && !found) {
			// Calculate movement distance using SquareGrid
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
	 * Delegates to GameBoard for cell reset
	 */
	reset(): void {
		this.gameBoard.reset();
		this.wumpus = this.initWumpus();
		this.last = null;
		this.clickCount = 0;
	}
}
