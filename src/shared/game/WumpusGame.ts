import { BoardState } from './BoardState.js';
import { HexGrid } from '../grid/HexGrid.js';
import type { GridCell, Position } from '../grid/IGridOperations.js';

type WumpusPosition = Position;

/**
 * High-level game orchestrator:
 *   • Chooses initial Wumpus position via GridOperations.getRandomPosition()
 *   • On each click: computes distance, updates BoardModel, moves Wumpus
 *   • Implements movement rules (getRandomMovement)
 *   • Exposes get(), getCellsAs2DArray(), setClicked(), reset()
 */
export class WumpusGame {
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
	get(x: number, y: number): GridCell {
		const cell = this.boardState.getCell({ x, y });
		if( !cell ) {
			throw new Error(`Attempt to fetch invalid cell from ${x}, ${y}`)
		}
		return cell;
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
	 * Get max possible distance on this grid
	 */
	getMaxDistance() {
		// TODO: call once and cache result, so long as grid dimensions don't change
		return this.gridSystem.maxDistance()
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
		
		// Capture this clicks to track previous clicks and all Wumpus to move based on distance
		// between last click and this click
		if (this.last && !found) {
			// Calculate movement distance using gridSystem
			const moveDist = this.gridSystem.distance(this.last, clickPos);
			this.last = { x, y, dist: moveDist };
			this.moveWumpus(moveDist);
		} else {
			this.last = { x, y, dist: 0 };
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
};