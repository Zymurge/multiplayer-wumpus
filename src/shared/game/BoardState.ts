import { GridCell, type IGridOperations, type Position } from '@shared/grid/IGridOperations.js';
import { 
	type ClientMessage, 
	type ServerMessage, 
	type GameCell, 
	GameError 
} from '@shared/types/game.js';
import { COLORS, getDistanceColor } from './ColorManager.js';

/*
 * Manages the state of all cells on the game board
 * Handles cell state operations like fading, clicking, and value setting
 * Does NOT handle geometry operations - delegates to IGridOperation
 */
export class BoardState {
    private static readonly MAX_GRID_SIZE = 24;
    
    private gridOperations: IGridOperations;
    private cells: Map<string, GridCell>;
    private fadeSteps: number;
    private clickCount: number = 0;
    private wumpusFound: boolean = false;
    
    constructor(gridOperations: IGridOperations, fadeSteps: number = 3) {
        // Validate grid dimensions
        const dimensions = gridOperations.getDimensions();
        if (dimensions.width <= 0 || dimensions.height <= 0) {
            throw new Error('Grid dimensions must be positive integers');
        }
        if (dimensions.width > BoardState.MAX_GRID_SIZE || dimensions.height > BoardState.MAX_GRID_SIZE) {
            throw new Error(`Grid dimensions cannot exceed ${BoardState.MAX_GRID_SIZE}`);
        }
        
        this.gridOperations = gridOperations;
        this.fadeSteps = fadeSteps;
        this.cells = new Map();
        this.initializeCells();
    }
    
    private getGameState() {
        const { width, height } = this.gridOperations.getDimensions();
        const grid: GameCell[][] = Array(height).fill(null).map((_, y) =>
            Array(width).fill(null).map((_, x) => {
                const cell = this.cells.get(this.positionKey({ x, y }));
                if (!cell) throw new GameError('Cell not found', 'CELL_NOT_FOUND');
                
                const isWumpus = cell.clicked && cell.value === 0;
                return {
                    value: !isWumpus && cell.clicked ? cell.value?.toString() ?? '' : '',
                    color: cell.fader?.color() ?? '',
                    showWumpus: isWumpus
                };
            })
        );

        return {
            grid,
            moves: this.clickCount,
            found: this.wumpusFound
        };
    }

    private getGameStateMessage(): ServerMessage {
        return {
            type: 'game_state',
            payload: this.getGameState()
        };
    }

    private handleClickCell(message: ClientMessage): ServerMessage {
        if (!message.payload?.x || !message.payload?.y) {
            throw new GameError('Missing coordinates', 'INVALID_PARAMS');
        }
        
        const pos: Position = { x: message.payload.x, y: message.payload.y };
        if (!this.isValidPosition(pos)) {
            throw new GameError('Invalid position', 'INVALID_POSITION');
        }

        this.clickCount++;
        const cell = this.cells.get(this.positionKey(pos));
        if (!cell) {
            throw new GameError('Cell not found', 'CELL_NOT_FOUND');
        }

        cell.clicked = true;
        if (cell.value === 0) {
            this.wumpusFound = true;
            return {
                type: 'game_over',
                payload: {
                    ...this.getGameState(),
                    message: 'Wumpus found!'
                }
            };
        }

        return this.getGameStateMessage();
    }

    private handleResetGame(): ServerMessage {
        this.initializeCells();
        this.clickCount = 0;
        this.wumpusFound = false;
        return this.getGameStateMessage();
    }

    private handleStartGame(message: ClientMessage): ServerMessage {
        if (!message.payload?.gridSize || !message.payload?.difficulty) {
            throw new GameError('Missing grid size or difficulty', 'INVALID_PARAMS');
        }
        // Initialize new game with parameters
        this.initializeCells();
        return this.getGameStateMessage();
    }
    
    /**
     * Initialize a single cell to default state
     */
    private initializeCell(pos: Position): void {
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
        const positions = this.gridOperations.getAllPositions();
        
        for (const position of positions) {
            const cell = new GridCell(position);
            // Cell should get its initial color from a default color manager
            cell.setColorManager(
                COLORS.unclicked,
                COLORS.unclicked,
                0
            );
            this.cells.set(this.positionKey(position), cell);
        }
    }

	/**
	 * Validate if a position is within grid bounds
	 */
    private isValidPosition(pos: Position): boolean {
        const { width, height } = this.gridOperations.getDimensions();
        return pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height;
    }

    /**
     * Generate a unique key for a position
     */
    private positionKey(pos: Position): string {
        return `${pos.x},${pos.y}`;
    }
    
    /**
     * Apply fade step to all clicked cells
     * Decrements fadeCounter for all clicked cells and updates their shade
     */
    fadeStep(): void {
        for (const cell of this.cells.values()) {
            if (cell.clicked && cell.fader != null) {
                cell.fader.next();
                // If fader has reached the end, reset the cell value
                if (cell.fader.currStep >= cell.fader.steps) {
                    cell.value = null; // Reset value after fading
                    cell.clicked = false; // Mark as unclicked
                }
            }
        }
    }
    
    /**
     * Get a cell at the specified position
     */
    getCell(pos: Position): GridCell | null {
        return this.cells.get(this.positionKey(pos)) || null;
    }
    
    /**
     * Get all cells as an array
     */
    getCells(): GridCell[] {
        return Array.from(this.cells.values());
    } 
    
    /**
     * Get cells as a 2D array for display purposes
     */
    getCellsAs2DArray(): GridCell[][] {
        const { width, height } = this.gridOperations.getDimensions();
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
     * Get the grid operations implementation for external use
     */
    getGridOperations(): IGridOperations {
        return this.gridOperations;
    }
    
    /**
     * Get the fade steps configuration
     */
    getFadeSteps(): number {
        return this.fadeSteps;
    }

    /**
     * Handles incoming client messages and returns appropriate server responses
     */
    handleMessage(message: ClientMessage): ServerMessage {
        try {
            switch (message.type) {
                case 'start_game':
                    return this.handleStartGame(message);
                case 'click_cell':
                    return this.handleClickCell(message);
                case 'reset_game':
                    return this.handleResetGame();
                default:
                    throw new GameError('Invalid message type', 'INVALID_MESSAGE');
            }
        } catch (error) {
            if (error instanceof GameError) {
                return {
                    type: 'game_error',
                    payload: {
                        error: error.code,
                        message: error.message
                    }
                };
            }
            return {
                type: 'game_error',
                payload: {
                    error: 'UNKNOWN_ERROR',
                    message: 'An unexpected error occurred'
                }
            };
        }
    }

    /**
     * Reset all cells to initial state
     */
    reset(): void {
        const positions = this.gridOperations.getAllPositions();
        for (const position of positions) {
            this.initializeCell(position);
        }
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
        if (!this.gridOperations.isValidPosition(pos)) {
            throw new Error('Invalid position');
        }
        
        const cell = this.getCell(pos);
        if (cell) {
            cell.value = value;
            cell.clicked = true;
            cell.setColorManager(
                getDistanceColor(value, this.gridOperations.maxDistance()), 
                COLORS.unclicked, 
                this.getFadeSteps()
            );
        }
    }
}
