import { WumpusGame } from '@server/game/WumpusGame.js';
import { type GameState, ServerMessage, ServerMessageType } from '@shared/types.js';

// Export games map for testing
export const gameMap = new Map<string, WumpusGame>();

/**
 * Creates a ServerError message.
 * @param error The error information.
 * @param message Optional additional error message.
 * @returns The ServerMessage object.
 */
export function createServerError(error: string, message?: string): ServerMessage {
    return {
        type: ServerMessageType.GAME_ERROR,
        payload: {
            errorInfo: {
                error,
                message
            }
        }
    };
}

/**
 * Get the current game state for a given game instance.
 * @param game The game instance.
 * @returns The current game state.
 */
export function getGameState(game: WumpusGame): GameState {
    const cells = game.getCellsAs2DArray();
    const grid = cells.map(row =>
        row.map(cell => {
            const clicked = cell.clicked;
            const isWumpus = clicked && game.isWumpusAt(cell.position);
            return {
                value: !isWumpus && clicked ? (game.lastClick?.dist?.toString() ?? '') : '',
                color: cell.fader?.color() ?? '',
                showWumpus: isWumpus
            };
        })
    );

    return {
        grid,
        moves: game.clickCount,
        distance: game.lastClick?.dist,
        found: game.isWumpusFound
    } as GameState;
}

/**
 * Process a clicked cell and return the updated board state
 * @param id The WebSocket connection ID.
 * @param payload The game parameters. Expected to contain x and y coordinates.
 * @returns The updated game state or an error message.
 */
export function handleCellClicked(id: string, payload: any): ServerMessage {
    const game = gameMap.get(id);
    if (!game) {
        return createServerError('INVALID_GAME_ID', 'No active game found');
    }
    if ( typeof payload?.x !== 'number' || typeof payload?.y !== 'number' ) {
        return createServerError('INVALID_COORDINATES', 'Non-numeric coordinates');
    }
    if( payload.x < 0 || payload.y < 0 ) {
        return createServerError('INVALID_COORDINATES', 'Out-of-bounds coordinates');
    }
    try {
        game.setClicked(payload.x, payload.y);
    } catch (error) {
        return createServerError('INVALID_COORDINATES', error instanceof Error ? error.message : undefined);
    }

    return {
        type: ServerMessageType.GAME_STATE,
        payload: { 
            gameState: getGameState(game),
        },
     } as ServerMessage;
}

/**
 * Start a new game and register it for the WebSocket connection.
 * @param ws The WebSocket connection.
 * @param payload The game parameters.
 * @returns The initial game state or an error message.
 */
export function handleStartGame(id: string, payload: { gridSize: number; fadeSteps: number }): ServerMessage {
    if (!payload.gridSize || !payload.fadeSteps) {
        return createServerError('Missing required game parameters');
    }

    const game = new WumpusGame(
        payload.gridSize,
        payload.gridSize,
        payload.fadeSteps
    );
    gameMap.set(id, game);

    return {
        type: ServerMessageType.GAME_STATE,
        payload: { 
            gameState: getGameState(game)
        },
    };
}

/**
 * Reset the game for the given WebSocket connection.
 * @param id The WebSocket connection ID.
 * @returns The updated game state after reset or an error message.
 */
export function handleResetGame(id: string): ServerMessage {
    const game = gameMap.get(id);
    if (!game) {
        return createServerError('No active game found');
    }
    
    game.reset();
    gameMap.delete(id);
    
    return {
        type: ServerMessageType.GAME_STATE,
        payload: { 
            gameState: getGameState(game)
        },
    } as ServerMessage;
}