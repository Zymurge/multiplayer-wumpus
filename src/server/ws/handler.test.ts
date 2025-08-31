import { describe, it, expect, beforeEach } from 'vitest';
import { logger } from '@shared/logger.js';
import { gameMap, handleStartGame, handleCellClicked, handleResetGame } from './handler.js';
import { ServerMessage, ServerMessageType, type GameState, type ErrorInfo } from '@shared/types.js';
import { WumpusGame } from '../game/WumpusGame.js';
function isValidGameState(state: any): state is GameState {
    if (typeof state !== 'object' || state === null) return false;
    
    return Array.isArray(state.grid) &&
        typeof state.moves === 'number' &&
        typeof state.found === 'boolean' &&
        (typeof state.distance === 'number' || state.distance === undefined);
}

function isValidErrorInfo(error: any): error is ErrorInfo {
    if (typeof error !== 'object' || error === null) {
        logger.info('ErrorInfo: Failed basic object check');
        return false;
    }

    return typeof error.error === 'string' &&
        (typeof error.message === 'string' || error.message === undefined);
}

function isValidServerMessage(message: any): message is ServerMessage {
    if (typeof message !== 'object' || message === null) {
        logger.info('ServerMessage: Failed basic object check');
        return false;
    }
    
    if (!Object.values(ServerMessageType).includes(message.type)) {
        logger.info('Failed type check:', message.type);
        return false;
    }
    
    if (typeof message.payload !== 'object' || message.payload === null) {
        logger.info('Failed payload check');
        return false;
    }

    const p = message.payload;
    
    switch (message.type) {
        case ServerMessageType.GAME_STATE:
        case ServerMessageType.GAME_OVER:
            if (!p.gameState) {
                logger.info('Missing gameState in payload');
                return false;
            }
            return isValidGameState(p.gameState);
            
        case ServerMessageType.GAME_ERROR:
            if (!p.errorInfo) {
                logger.info('Missing error in payload');
                return false;
            }
            return isValidErrorInfo(p.errorInfo);
            
        default:
            logger.info('Unknown message type');
            return false;
    }
}

class TestGame extends WumpusGame {
    constructor() {
        super(5, 5);
    }

    setWumpus(x: number, y: number) {
        this.wumpus = { x, y };
    }
}

const TEST_ID = 'test-connection-id';

function createTestGame() {
    const game = new TestGame();
    gameMap.set(TEST_ID, game);
    return game;
}

function checkErrorMessage(result: ServerMessage, expectedError: string, expectedMessage?: string) {
    expect(result).toSatisfy(isValidServerMessage);
    expect(result.type).toBe(ServerMessageType.GAME_ERROR);
    expect(result.payload.errorInfo).toBeDefined();
    expect(result.payload.errorInfo!.error).toBe(expectedError);
    if (expectedMessage) {
        expect(result.payload.errorInfo!.message).toBe(expectedMessage);
    }
}
describe('handleStartGame', () => {
    it('should register the game with the correct ID', () => {
        const result = handleStartGame(TEST_ID, { gridSize: 5, fadeSteps: 4 });
        expect(gameMap.has(TEST_ID)).toBe(true);
    });

    it('should create a valid and correct WumpusGame instance', () => {
        const result = handleStartGame(TEST_ID, { gridSize: 5, fadeSteps: 4 });
        const game = gameMap.get(TEST_ID);
        expect(game).toBeDefined();
        expect(game).toBeInstanceOf(WumpusGame);
        expect(game!.getDimensions()).toEqual({ width: 5, height: 5 });
        expect(game!.clickCount).toBe(0);
    });

    it('should return the correct payload', () => {
        const result = handleStartGame(TEST_ID, { gridSize: 3, fadeSteps: 4 });
        expect(result).toSatisfy(isValidServerMessage);
        expect(result.type).toBe(ServerMessageType.GAME_STATE);
        expect(result.payload.gameState).toBeDefined();
        const state = result.payload.gameState
        expect(state!.grid).toHaveLength(3);
        expect(state!.grid[0]).toHaveLength(3);
        expect(state!.distance).toBeUndefined();
        expect(state!.found).toBe(false);
        expect(state!.moves).toBe(0);
    });

    it('should return an error when parameters are missing', () => {
        let result = handleStartGame(TEST_ID, { gridSize: 5 } as any);
        expect(result).toSatisfy(isValidServerMessage);
        expect(result.type).toBe(ServerMessageType.GAME_ERROR);
        expect(result.payload.errorInfo).toBeDefined();
        expect(result.payload.errorInfo!.error).toBe('INVALID_PARAMETERS');

        result = handleStartGame(TEST_ID, { fadeSteps: 4 } as any);
        expect(result).toSatisfy(isValidServerMessage);
        expect(result.type).toBe(ServerMessageType.GAME_ERROR);
        expect(result.payload.errorInfo).toBeDefined();
        expect(result.payload.errorInfo!.error).toBe('INVALID_PARAMETERS');
    });

    it('should return an error when parameters are of wrong type', () => {
        let result = handleStartGame(TEST_ID, { gridSize: '5', fadeSteps: 4 } as any);
        expect(result).toSatisfy(isValidServerMessage);
        expect(result.type).toBe(ServerMessageType.GAME_ERROR);
        expect(result.payload.errorInfo).toBeDefined();
        expect(result.payload.errorInfo!.error).toBe('INVALID_PARAMETERS');
        expect(result.payload.errorInfo!.message).toBe('Required parameters wrong type or missing');

        result = handleStartGame(TEST_ID, { gridSize: 5, fadeSteps: '4' } as any);
        expect(result).toSatisfy(isValidServerMessage);
        expect(result.type).toBe(ServerMessageType.GAME_ERROR);
        expect(result.payload.errorInfo).toBeDefined();
        expect(result.payload.errorInfo!.error).toBe('INVALID_PARAMETERS');
        expect(result.payload.errorInfo!.message).toBe('Required parameters wrong type or missing');
        result = handleStartGame(TEST_ID, { gridSize: 5, fadeSteps: '4' } as any);
    });

    it('should return an error when parameters are missing', () => {
        let result = handleStartGame(TEST_ID, { } as any);
        expect(result).toSatisfy(isValidServerMessage);
        expect(result.type).toBe(ServerMessageType.GAME_ERROR);
        expect(result.payload.errorInfo).toBeDefined();
        expect(result.payload.errorInfo!.error).toBe('INVALID_PARAMETERS');
        expect(result.payload.errorInfo!.message).toBe('Required parameters wrong type or missing');
    });
});

describe('handleCellClicked', () => {
    beforeEach(() => {
        // create game with known Wumpus position
        const game = createTestGame();
        game.setWumpus(4, 4);
    });

    it('should handle valid cell click', () => {
        const result = handleCellClicked(TEST_ID, { x: 4, y: 3 });
        expect(result).toSatisfy(isValidServerMessage);
        expect(result.type).toBe(ServerMessageType.GAME_STATE);
        const state = result.payload.gameState;
        expect(state).toBeDefined();
        expect(state!.moves).toBe(1);
        expect(state!.found).toBe(false);
        expect(state!.distance).toBe(1);
        expect(state!.grid[3][4].value).toBe('1');
    });

    it('should handle edge coordinates (0,0)', () => {
        const result = handleCellClicked(TEST_ID, { x: 0, y: 0 });
        expect(result).toSatisfy(isValidServerMessage);
        expect(result.type).toBe(ServerMessageType.GAME_STATE);
    });

    it('should return server error when game not found', () => {
        gameMap.clear();
        const result = handleCellClicked(TEST_ID, { x: 2, y: 3 });
        checkErrorMessage(result, 'INVALID_GAME_ID', 'No active game found');
    });

    it('should return server error for invalid coordinates', () => {
        const result = handleCellClicked(TEST_ID, { x: undefined, y: 3 } as any);
        checkErrorMessage(result, 'INVALID_COORDINATES', 'Non-numeric coordinates');
        const result2 = handleCellClicked(TEST_ID, { x: 2 } as any);
        checkErrorMessage(result2, 'INVALID_COORDINATES', 'Non-numeric coordinates');
    });

    it('should reject out-of-bounds coordinates', () => {
        const result = handleCellClicked(TEST_ID, { x: 10, y: 10 });
        checkErrorMessage(result, 'INVALID_COORDINATES', 'Coordinates not in grid: 10, 10');
    });

    it('should reject negative coordinates', () => {
        const result = handleCellClicked(TEST_ID, { x: -1, y: 2 });
        checkErrorMessage(result, 'INVALID_COORDINATES', 'Out-of-bounds coordinates');
    });
    it('correctly handles Wumpus found click', () => {
        const result = handleCellClicked(TEST_ID, { x: 4, y: 4 });
        expect(result).toSatisfy(isValidServerMessage);
        expect(result.type).toBe(ServerMessageType.GAME_STATE);
        const state = result.payload.gameState;
        expect(state).toBeDefined();
        expect(state!.found).toBe(true);
    });
});

describe('handleResetGame', () => {
    beforeEach(() => {
        handleStartGame(TEST_ID, { gridSize: 5, fadeSteps: 4 });
        handleCellClicked(TEST_ID, { x: 2, y: 3 });
    });

    it('should reset game state and remove from map', () => {
        const result = handleResetGame(TEST_ID);
        expect(result.type).toBe(ServerMessageType.GAME_STATE);
        expect(gameMap.has(TEST_ID)).toBe(false);
    });

    it('should return server error when game not found', () => {
        gameMap.clear();
        const result = handleResetGame(TEST_ID);
        checkErrorMessage(result, 'INVALID_GAME_ID', 'No active game found');
    });
});