import { describe, expect, it } from 'vitest';
import { handleServerMessage } from './gameStateUtils.ts';
import { type ServerMessage, ServerMessageType, type GameState, type ErrorInfo } from '@shared/types.ts';

describe('handleServerMessage', () => {
    it('returns state for GAME_STATE message', () => {
        const msg: ServerMessage = {
            type: ServerMessageType.GAME_STATE,
            payload: {
                gameState: {
                    grid: [[{ value: '', color: 'red', showWumpus: false }]],
                    distance: 1,
                    found: false,
                    moves: 2
                }
            }
        };
        const result = handleServerMessage(msg);
        expect(result).toEqual({ gameState: msg.payload.gameState });
    });

    it('returns error for GAME_ERROR message', () => {
        const expected: ErrorInfo = { error: 'INVALID', message: 'bad stuff' };
        const msg: ServerMessage = {
            type: ServerMessageType.GAME_ERROR,
            payload: { errorInfo: expected }
        };
        const result = handleServerMessage(msg);
        expect(result).toEqual({ errorInfo: expected });
    });

    it('returns error for unknown type', () => {
        const expected = { error: 'UNKNOWN', message: 'Unknown message type' };
        const msg = {
            type: 'not_a_real_type',
            payload: {}
        } as any;
        const result = handleServerMessage(msg);
        expect(result).toEqual({ errorInfo: expected });
    });

    it('returns error for missing payload in GAME_STATE', () => {
        const expected = { error: 'INVALID_PAYLOAD', message: 'Game state is missing payload' };
        const msg = {
            type: ServerMessageType.GAME_STATE,
            payload: undefined
        } as any;
        const result = handleServerMessage(msg);
        expect(result).toEqual({ errorInfo: expected });
    });

    it('returns error for missing gameState in GAME_STATE', () => {
        const expected = { error: 'INVALID_PAYLOAD', message: 'Game state is missing payload' };
        const msg = {
            type: ServerMessageType.GAME_STATE,
            payload: {}
        } as any;
        const result = handleServerMessage(msg);
        expect(result).toEqual({ errorInfo: expected });
    });

    it('returns error for missing errorInfo in GAME_ERROR', () => {
        const expected = { error: 'INVALID_PAYLOAD', message: 'Error info is missing payload' };
        const msg = {
            type: ServerMessageType.GAME_ERROR,
            payload: {}
        } as any;
        const result = handleServerMessage(msg);
        expect(result).toEqual({ errorInfo: expected });
    });
});
