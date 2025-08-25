import { describe, it, expect } from 'vitest';
import { GameError } from './types.js';

describe('GameError', () => {
    it('should create error with message and code', () => {
        const error = new GameError('Invalid move', 'INVALID_MOVE');
        expect(error.message).toBe('Invalid move');
        expect(error.code).toBe('INVALID_MOVE');
        expect(error.name).toBe('GameError');
    });
});