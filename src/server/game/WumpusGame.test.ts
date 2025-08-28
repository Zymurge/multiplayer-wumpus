import { describe, it, expect, beforeEach } from 'vitest';
import { WumpusGame } from './WumpusGame.js';

class TestGame extends WumpusGame {
    constructor(width: number = 5, height: number = 5, fadeSteps: number = 3) {
        super(width, height, fadeSteps);
    }

    setWumpus(x: number, y: number) {
        this.wumpus = { x, y };
    }

    getWumpusPosition() {
        return this.wumpus;
    }
}

describe('WumpusGame', () => {
    let game: TestGame;

    beforeEach(() => {
        game = new TestGame(5, 5, 3);
    });

    describe('initialization', () => {
        it('should create game with correct dimensions', () => {
            expect(game.getDimensions()).toEqual({ width: 5, height: 5 });
        });

        it('should start with zero clicks', () => {
            expect(game.clickCount).toBe(0);
        });

        it('should start with wumpus not found', () => {
            expect(game.isWumpusFound).toBe(false);
        });

        it('should have no last click initially', () => {
            expect(game.lastClick).toBeNull();
        });

        it('should create different sized grids', () => {
            const smallGame = new TestGame(3, 3);
            expect(smallGame.getDimensions()).toEqual({ width: 3, height: 3 });
            
            const largeGame = new TestGame(7, 7);
            expect(largeGame.getDimensions()).toEqual({ width: 7, height: 7 });
        });
    });

    describe('cell access', () => {
        it('should return valid cell for in-bounds coordinates', () => {
            const cell = game.get(0, 0);
            expect(cell).toBeDefined();
            expect(cell.clicked).toBe(false);
        });

        it('should return 2D array representation', () => {
            const grid = game.getCellsAs2DArray();
            expect(grid).toHaveLength(5);
            expect(grid[0]).toHaveLength(5);
        });
    });

    describe('wumpus detection', () => {
        beforeEach(() => {
            game.setWumpus(3, 2);
        });

        it('should detect wumpus at correct position', () => {
            expect(game.isWumpusAt({ x: 3, y: 2 })).toBe(true);
        });

        it('should not detect wumpus at wrong position', () => {
            expect(game.isWumpusAt({ x: 2, y: 3 })).toBe(false);
            expect(game.isWumpusAt({ x: 0, y: 0 })).toBe(false);
        });

        it('should find wumpus when clicked directly', () => {
            game.setClicked(3, 2);
            
            expect(game.isWumpusFound).toBe(true);
            expect(game.clickCount).toBe(1);
            expect(game.lastClick?.dist).toBe(0);
        });
    });

    describe('click handling', () => {
        beforeEach(() => {
            game.setWumpus(4, 4);
        });

        it('should increment click count on valid click', () => {
            game.setClicked(0, 0);
            expect(game.clickCount).toBe(1);
            
            game.setClicked(1, 1);
            expect(game.clickCount).toBe(2);
        });

        it('should calculate correct distance to wumpus', () => {
            // Wumpus at (4,4), click at (4,3) should be distance 1
            game.setClicked(4, 3);
            expect(game.lastClick?.dist).toBe(1);
            
            // Click at (4,2) should be distance 2
            game.setClicked(4, 2);
            expect(game.lastClick?.dist).toBe(2);
        });

        it('should track last click information', () => {
            game.setClicked(2, 3);
            
            const lastClick = game.lastClick;
            expect(lastClick).toBeDefined();
            expect(lastClick?.x).toBe(2);
            expect(lastClick?.y).toBe(3);
            expect(lastClick?.dist).toBeGreaterThanOrEqual(0);
        });

        it('should throw error for out-of-bounds coordinates', () => {
            expect(() => game.setClicked(-1, 0)).toThrow('Coordinates not in grid');
            expect(() => game.setClicked(0, -1)).toThrow('Coordinates not in grid');
            expect(() => game.setClicked(5, 0)).toThrow('Coordinates not in grid');
            expect(() => game.setClicked(0, 5)).toThrow('Coordinates not in grid');
            expect(() => game.setClicked(10, 10)).toThrow('Coordinates not in grid');
        });

        it('should update cell state when clicked', () => {
            game.setClicked(1, 1);
            const cell = game.get(1, 1);
            expect(cell.clicked).toBe(true);
            expect(cell.value).toBeDefined();
        });
    });

    describe('wumpus movement', () => {
        beforeEach(() => {
            game.setWumpus(2, 2);
        });

        it('should not move wumpus on first click', () => {
            const initialPos = game.getWumpusPosition();
            game.setClicked(0, 0);
            const afterFirstClick = game.getWumpusPosition();
            
            expect(afterFirstClick).toEqual(initialPos);
        });

        it('should potentially move wumpus on subsequent clicks', () => {
            // First click
            game.setClicked(0, 0);
            const posAfterFirst = game.getWumpusPosition();
            
            // Second click - wumpus might move depending on distance
            game.setClicked(4, 4);
            const posAfterSecond = game.getWumpusPosition();
            
            // Can't guarantee movement, but position should be valid
            const dims = game.getDimensions();
            expect(posAfterSecond.x).toBeGreaterThanOrEqual(0);
            expect(posAfterSecond.x).toBeLessThan(dims.width);
            expect(posAfterSecond.y).toBeGreaterThanOrEqual(0);
            expect(posAfterSecond.y).toBeLessThan(dims.height);
        });
    });

    describe('game reset', () => {
        it('should reset all game state', () => {
            // Make some moves first
            game.setWumpus(3, 3);
            game.setClicked(0, 0);
            game.setClicked(1, 1);
            
            // Reset
            game.reset();
            
            expect(game.clickCount).toBe(0);
            expect(game.isWumpusFound).toBe(false);
            expect(game.lastClick).toBeNull();
        });

        it('should reset cell states', () => {
            game.setClicked(2, 2);
            let cell = game.get(2, 2);
            expect(cell.clicked).toBe(true);
            
            game.reset();
            
            cell = game.get(2, 2);
            expect(cell.clicked).toBe(false);
        });

        it('should generate new wumpus position after reset', () => {
            game.setWumpus(2, 2);
            const oldPos = game.getWumpusPosition();
            
            game.reset();
            
            const newPos = game.getWumpusPosition();
            // Wumpus should be repositioned (though could theoretically be same spot)
            expect(newPos.x).toBeGreaterThanOrEqual(0);
            expect(newPos.y).toBeGreaterThanOrEqual(0);
        });
    });

    describe('edge cases', () => {
        it('should handle clicking same cell multiple times', () => {
            game.setWumpus(4, 4);
            
            game.setClicked(0, 0);
            const firstClickCount = game.clickCount;
            
            game.setClicked(0, 0);
            const secondClickCount = game.clickCount;
            
            expect(secondClickCount).toBe(firstClickCount + 1);
        });

        it('should handle small grid sizes', () => {
            const tinyGame = new TestGame(2, 2);
            tinyGame.setWumpus(1, 1);
            
            tinyGame.setClicked(0, 0);
            expect(tinyGame.clickCount).toBe(1);
            expect(tinyGame.lastClick?.dist).toBe(2); // Max distance on 2x2 hex grid
        });

        it('should calculate max distance correctly', () => {
            const maxDist = game.getMaxDistance();
            expect(maxDist).toBeGreaterThan(0);
            expect(typeof maxDist).toBe('number');
        });
    });
});