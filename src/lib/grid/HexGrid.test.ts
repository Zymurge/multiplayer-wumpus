import { describe, it, expect } from 'vitest';
import { HexGrid, EVEN_Q_DELTAS, ODD_Q_DELTAS } from './HexGrid.js';
import type { Position } from './IGridSystem.js';

describe('HexGrid', () => {
    describe('constructor and basic properties', () => {
        it('should create a hex grid with specified dimensions', () => {
            const grid = new HexGrid(7, 4);
            const dims = grid.getDimensions();

            expect(dims.width).toBe(7);
            expect(dims.height).toBe(4);
        });

        it('should return all valid positions within bounds', () => {
            const grid = new HexGrid(3, 2);
            const positions = grid.getAllPositions();

            expect(positions).toHaveLength(6); // 3 columns × 2 rows
            for (const pos of positions) {
                expect(grid.isValidPosition(pos)).toBe(true);
            }
        });

        it('should return empty array for 0x0 grid', () => {
            const grid = new HexGrid(0, 0);
            const positions = grid.getAllPositions();

            expect(positions).toHaveLength(0);
        });
    });

    describe('position validation', () => {
        const grid = new HexGrid(3, 4);

        it('should validate positions within boundaries', () => {
            expect(grid.isValidPosition({ x: 0, y: 0 })).toBe(true);
            expect(grid.isValidPosition({ x: 2, y: 3 })).toBe(true);
            expect(grid.isValidPosition({ x: 1, y: 2 })).toBe(true);
        });

        it('should reject positions outside boundaries', () => {
            expect(grid.isValidPosition({ x: -1, y: 0 })).toBe(false);
            expect(grid.isValidPosition({ x: 0, y: -1 })).toBe(false);
            expect(grid.isValidPosition({ x: 3, y: 0 })).toBe(false);
            expect(grid.isValidPosition({ x: 0, y: 4 })).toBe(false);
            expect(grid.isValidPosition({ x: 3, y: 4 })).toBe(false);
        });
    });

    describe('distance calculation', () => {
        describe('offset validations', () => {
            it('should calculate correct distance between hexes 3 apart in same even row', () => {
                const grid = new HexGrid(6, 5); // even-q layout assumed
                const a: Position = { x: 1, y: 2 }; // y = 2 is even
                const b: Position = { x: 4, y: 2 };

                // In even-q layout, horizontal distance is not purely |x2 - x1|
                expect(grid.distance(a, b)).toBe(3);
            });

            it('should calculate correct distance between hexes 4 apart in same odd row', () => {
                const grid = new HexGrid(6, 5); // even-q layout assumed
                const a: Position = { x: 0, y: 3 }; // y = 3 is odd
                const b: Position = { x: 4, y: 3 };

                // Should still be 4 in axial space, but offset affects axial conversion
                expect(grid.distance(a, b)).toBe(4);
            });

            it('should calculate correct distance between hexes 3 apart in same col', () => {
                const grid = new HexGrid(6, 5); // even-q layout assumed
                const a: Position = { x: 2, y: 3 };
                const b: Position = { x: 2, y: 1 };

                // Should always be 2, since offset doesn't come into play
                expect(grid.distance(a, b)).toBe(2);
            });

            it('should calculate correct distance from top-left to bottom-right corner', () => {
            const grid = new HexGrid(5, 5);
            const topLeft: Position = { x: 0, y: 0 };
            const bottomRight: Position = { x: 4, y: 4 };

            // Expected distance depends on offset layout; for even-q, this should be 6
            expect(grid.distance(topLeft, bottomRight)).toBe(6);
            });

            it('should calculate correct distance from top-right to bottom-left corner', () => {
                const grid = new HexGrid(5, 5);
                const topRight: Position = { x: 4, y: 0 };
                const bottomLeft: Position = { x: 0, y: 4 };

                // Expected distance for this diagonal in even-q layout is also 6
                expect(grid.distance(topRight, bottomLeft)).toBe(6);
            });
        });
        
        describe('basic functionality', () => {
            it('should return 0 for the same position', () => {
                const grid = new HexGrid(5, 5);
                const pos: Position = { x: 2, y: 2 };
                expect(grid.distance(pos, pos)).toBe(0);
            });

            it('should return 1 for adjacent hexes', () => {
                const grid = new HexGrid(5, 5);
                const center: Position = { x: 2, y: 2 };
                const neighbors = grid.getAdjacentPositions(center);

                for (const neighbor of neighbors) {
                    expect(grid.distance(center, neighbor)).toBe(1);
                }
            });

            it('should be symmetric', () => {
                const grid = new HexGrid(5, 5);
                const a: Position = { x: 1, y: 1 };
                const b: Position = { x: 3, y: 2 };
                expect(grid.distance(a, b)).toBe(grid.distance(b, a));
            });

            it('should calculate correct distance between two positions', () => {
                const grid = new HexGrid(5, 5);
                const a: Position = { x: 0, y: 0 };
                const b: Position = { x: 3, y: 2 };

                // Expected distance using axial conversion and hex distance formula
                expect(grid.distance(a, b)).toBe(4);
            });

            it('should handle positions outside grid boundaries', () => {
                const grid = new HexGrid(5, 5);
                const a: Position = { x: 2, y: 2 };
                const b: Position = { x: 10, y: 10 };

                // Still computes distance even if b is out of bounds
                expect(typeof grid.distance(a, b)).toBe('number');
            });
        });
    });

    describe('adjacent positions', () => {
        // Helper function for validating neighbors
        function expectAdjacent(grid: HexGrid, center: Position, expected: Position[]) {
            const actual = grid.getAdjacentPositions(center);

            expect(actual.length, 
                `Expected ${expected.length} adjacent positions for (${center.x},${center.y}), but got ${actual.length}.\nActual: ${JSON.stringify(actual)}\nExpected: ${JSON.stringify(expected)}`
            ).toBe(expected.length);

            for (const pos of expected) {
                expect(actual,
                    `Missing expected neighbor (${pos.x},${pos.y}) for center (${center.x},${center.y}).\nActual: ${JSON.stringify(actual)}`
                ).toContainEqual(pos);
            }

            for (const pos of actual) {
                expect(expected, 
                    `Unexpected neighbor (${pos.x},${pos.y}) returned for center (${center.x},${center.y}).\nExpected: ${JSON.stringify(expected)}`
                ).toContainEqual(pos);
            }

            for (const pos of actual) {
                expect(grid.isValidPosition(pos), 
                    `Invalid position returned: (${pos.x},${pos.y}) for center (${center.x},${center.y})`
                ).toBe(true);
            }
        }

        describe('validate core functionality', () => {
            it('should return 6 adjacent positions for center hex', () => {
                const grid = new HexGrid(5, 5);
                const center: Position = { x: 2, y: 2 };
                const adjacent = grid.getAdjacentPositions(center);

                expect(adjacent).toHaveLength(6);
                for (const pos of adjacent) {
                    expect(grid.isValidPosition(pos)).toBe(true);
                    expect(grid.distance(center, pos), `distance is not 1 between ${center.x},${center.y} and ${pos.x},${pos.y}`).toBe(1);
                }
            });

            it('should return fewer than 6 adjacent positions for corner hex', () => {
                const grid = new HexGrid(5, 5);
                const corner: Position = { x: 0, y: 0 };
                const adjacent = grid.getAdjacentPositions(corner);

                expect(adjacent.length).toBeLessThan(6);
                for (const pos of adjacent) {
                    expect(grid.isValidPosition(pos)).toBe(true);
                }
            });

            it('should return only valid positions for all hexes', () => {
                const grid = new HexGrid(3, 3);
                const all = grid.getAllPositions();

                for (const pos of all) {
                    const neighbors = grid.getAdjacentPositions(pos);
                    for (const n of neighbors) {
                        expect(grid.isValidPosition(n)).toBe(true);
                    }
                }
            });
        });

        describe('validate all edges', () => {
            const gridEven = new HexGrid(6, 5);
            const gridOdd = new HexGrid(5, 5);

            it('left edge: top, middle, bottom', () => {
                expectAdjacent(gridOdd, { x: 0, y: 0 }, [
                    { x: 1, y: 0 }, { x: 0, y: 1 }
                ]);

                expectAdjacent(gridOdd, { x: 0, y: 2 }, [
                    { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 3 }
                ]);

                expectAdjacent(gridOdd, { x: 0, y: 4 }, [
                    { x: 1, y: 4 }, { x: 1, y: 3 }, { x: 0, y: 3 }
                ]);
            });

            it('right edge (even width): top, middle, bottom', () => {
                expectAdjacent(gridEven, { x: 5, y: 0 }, [
                    { x: 4, y: 0 }, { x: 4, y: 1 }, { x: 5, y: 1 }
                ]);

                expectAdjacent(gridEven, { x: 5, y: 2 }, [
                    { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 5, y: 1 }, { x: 5, y: 3 }
                ]);

                expectAdjacent(gridEven, { x: 5, y: 4 }, [
                    { x: 4, y: 4 }, { x: 5, y: 3 }
                ]);
            });

            it('right edge (odd width): top, middle, bottom', () => {
                expectAdjacent(gridOdd, { x: 4, y: 0 }, [
                    { x: 3, y: 0 }, { x: 4, y: 1 }
                ]);

                expectAdjacent(gridOdd, { x: 4, y: 2 }, [
                    { x: 4, y: 1 },
                    { x: 3, y: 1 },
                    { x: 3, y: 2 },
                    { x: 4, y: 3 }
                ]);

                expectAdjacent(gridOdd, { x: 4, y: 4 }, [
                    { x: 4, y: 3 },
                    { x: 3, y: 3 },
                    { x: 3, y: 4 }
                ]);
            });

            it('top and bottom row centers (even and odd x)', () => {
                expectAdjacent(gridOdd, { x: 2, y: 0 }, [
                    { x: 3, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1 }
                ]);

                expectAdjacent(gridOdd, { x: 3, y: 0 }, [
                    { x: 4, y: 0 }, { x: 4, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 0 }, { x: 2, y: 1 }
                ]);

                // Bottom row, x even (2,4)
                expectAdjacent(gridOdd, { x: 2, y: 4 }, [
                { x: 3, y: 4 },
                { x: 3, y: 3 },
                { x: 2, y: 3 },
                { x: 1, y: 3 },
                { x: 1, y: 4 }
                ]);

                // Bottom row, x odd (3,4)
                expectAdjacent(gridOdd, { x: 3, y: 4 }, [
                { x: 4, y: 4 },
                { x: 3, y: 3 },
                { x: 2, y: 4 }
                ]);
            });
        });

        describe('validate corners and interior', () => {
            const grid = new HexGrid(5, 5);

            it('should return correct adjacent positions for top-left corner', () => {
                expectAdjacent(grid, { x: 0, y: 0 }, [
                { x: 1, y: 0 },
                { x: 0, y: 1 }
                ]);
            });

            it('should return correct adjacent positions for top-right corner', () => {
                expectAdjacent(grid, { x: 4, y: 0 }, [
                { x: 3, y: 0 },
                { x: 4, y: 1 }
                ]);
            });

            it('should return correct adjacent positions for bottom-left corner', () => {
                expectAdjacent(grid, { x: 0, y: 4 }, [
                { x: 1, y: 4 },
                { x: 1, y: 3 },
                { x: 0, y: 3 }
                ]);
            });

            it('should return correct adjacent positions for bottom-right corner', () => {
                expectAdjacent(grid, { x: 4, y: 4 }, [
                { x: 4, y: 3 },
                { x: 3, y: 3 },
                { x: 3, y: 4 }
                ]);
            });

            it('should return correct adjacent positions for interior cell in even column', () => {
                expectAdjacent(grid, { x: 2, y: 2 }, [
                { x: 3, y: 2 },
                { x: 3, y: 1 },
                { x: 2, y: 1 },
                { x: 1, y: 1 },
                { x: 1, y: 2 },
                { x: 2, y: 3 }
                ]);
            });

            it('should return correct adjacent positions for interior cell in odd column', () => {
                expectAdjacent(grid, { x: 3, y: 2 }, [
                { x: 4, y: 3 },
                { x: 4, y: 2 },
                { x: 3, y: 1 },
                { x: 2, y: 2 },
                { x: 2, y: 3 },
                { x: 3, y: 3 }
                ]);
            });
        });
    });

    describe('getRandomPosition()', () => {
        const grid = new HexGrid(10, 8);

        it('always returns a valid position', () => {
            for (let i = 0; i < 100; i++) {
            const pos = grid.getRandomPosition();
            expect(grid.isValidPosition(pos), `returned out-of-bounds pos ${JSON.stringify(pos)}`).toBe(true);
            }
        });

        it('eventually covers all cells (statistical smoke test)', () => {
            const seen = new Set<string>();
            const { width, height } = grid.getDimensions();
            for (let i = 0; i < 5000; i++) {
                const { x, y } = grid.getRandomPosition();
                seen.add(`${x},${y}`);
                if (seen.size === width * height) break;
            }
            expect(seen.size, `only saw ${seen.size}/${width * height} unique cells`).toBe(width * height);
        });
    });

    describe('getAllPositions()', () => {
        const grid = new HexGrid(3, 2);

        it('returns width*height positions in correct order', () => {
            const all = grid.getAllPositions();
            expect(all).toHaveLength(6);

            expect(all).toEqual([
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
            { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
            ]);
        });
    });

    describe('getMaxDistance()', () => {
        it('1×1 grid → max distance 0', () => {
            expect(new HexGrid(1, 1).maxDistance()).toBe(0);
        });

        it('2×2 grid → max distance 2', () => {
            // corners are (0,0)↔(1,1) distance=2 in even-q
            expect(new HexGrid(2, 2).maxDistance()).toBe(2);
        });

        it('5×5 grid → max distance 6', () => {
            // opposite corners (0,4)↔(4,0) distance=6
            expect(new HexGrid(5, 5).maxDistance()).toBe(6);
        });

        it('max distance from center matches expected radius', () => {
            const grid = new HexGrid(5, 5);
            const all = grid.getAllPositions();
            const center = { x: 2, y: 2 };

            // brute-force radius from center
            const radius = Math.max(
            ...all.map((pos: any) => grid.distance(center, pos))
            );
            expect(radius).toBe(3);
        });
    });

    describe('random movement generation', () => {
        const grid = new HexGrid(5, 5);
        const origin: Position = { x: 2, y: 2 };
        const destination = grid.getRandomMovement(origin);

        it('should generate movement within 1 cell, but can be the origin cell as well', () => {
            expect(grid.distance(origin, destination)).toBeLessThanOrEqual(1);
        });

        it('should be a valid cell', () => {
            expect(grid.isValidPosition(destination)).toBe(true);
        });
    });    
});