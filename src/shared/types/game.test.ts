import { describe, it, expect } from 'vitest';
import { type ClientMessage, type ServerMessage, type GameCell, type GameState, GameError } from './game.js';

describe('Game Types', () => {
    describe('ClientMessage', () => {
        it('should validate start_game message', () => {
            const message: ClientMessage = {
                type: 'start_game',
                payload: {
                    gridSize: 5,
                    difficulty: 4
                }
            };
            expect(message.type).toBe('start_game');
            expect(message.payload?.gridSize).toBe(5);
            expect(message.payload?.difficulty).toBe(4);
        });

        it('should validate click_cell message', () => {
            const message: ClientMessage = {
                type: 'click_cell',
                payload: {
                    x: 2,
                    y: 3
                }
            };
            expect(message.type).toBe('click_cell');
            expect(message.payload?.x).toBe(2);
            expect(message.payload?.y).toBe(3);
        });
    });

    describe('ServerMessage', () => {
        it('should validate game_state message', () => {
            const message: ServerMessage = {
                type: 'game_state',
                payload: {
                    grid: [[{ value: '3', color: '#ff0000', showWumpus: false }]],
                    moves: 1,
                    found: false,
                    distance: 3
                }
            };
            expect(message.type).toBe('game_state');
            expect(message.payload.moves).toBe(1);
            expect(message.payload.grid?.[0][0].value).toBe('3');
        });

        it('should validate game_error message', () => {
            const message: ServerMessage = {
                type: 'game_error',
                payload: {
                    error: 'Invalid move',
                    message: 'Cell already clicked'
                }
            };
            expect(message.type).toBe('game_error');
            expect(message.payload.error).toBe('Invalid move');
        });
    });

    describe('GameError', () => {
        it('should create error with message and code', () => {
            const error = new GameError('Invalid move', 'INVALID_MOVE');
            expect(error.message).toBe('Invalid move');
            expect(error.code).toBe('INVALID_MOVE');
            expect(error.name).toBe('GameError');
        });
    });
});