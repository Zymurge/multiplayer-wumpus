import { describe, it, expect } from 'vitest';
import { ColorFader } from './ColorManager.js';

describe('ColorFader', () => {
    describe('constructor', () => {

        it('should successfully create ColorFader with valid string inputs', () => {
            expect(() => new ColorFader('#ff0000', '#0000ff', 10)).not.toThrow();
            const fader = new ColorFader('#ff0000', '#0000ff', 10);
            expect(fader.start.hex()).toBe('#ff0000'); // chroma.js normalizes to lowercase
            expect(fader.end.hex()).toBe('#0000ff');
            expect(fader.steps).toBe(10);
        });

        it('should throw an error for invalid start color string', () => {
            expect(() => new ColorFader('not-a-hex', '#112233', 1)).toThrow(/^Start color string invalid./);
            expect(() => new ColorFader('#12345', '#112233', 1)).toThrow(/^Start color string invalid./); // 5 char hex is not valid
            expect(() => new ColorFader('#GG00FF', '#112233', 1)).toThrow(/^Start color string invalid./); // Invalid hex chars
        });

        it('should throw an error for invalid end color string', () => {
            expect(() => new ColorFader('#112233', 'invalid-hex', 4)).toThrow(/^End color string invalid./);
            expect(() => new ColorFader('#112233', '#F0F0F', 4)).toThrow(/^End color string invalid./); // Too short hex
            expect(() => new ColorFader('#112233', '#00HHFF', 4)).toThrow(/^End color string invalid./); // Invalid hex chars
        });

        it('should throw an error for negative steps', () => {
            expect(() => new ColorFader('#ff0000', '#0000ff', -5)).toThrow('Steps must be a non-negative integer');
        });

        it('should throw an error for non-integer steps', () => {
            expect(() => new ColorFader('#ff0000', '#0000ff', 10.5)).toThrow('Steps must be a non-negative integer');
        });
    });

    describe('color', () => {
        it('should return correct color for shade=0 (start color)', () => {
            const fader = new ColorFader('#0156ab', '#000000', 1);
            const color = fader.color();
            expect(color).toBe('#0156ab');
        });

        it('should return correct color for shade=100 (end color)', () => {
            const fader = new ColorFader('#0156ab', '#000000', 1);
            // run to last step
            fader.next();
            const color = fader.color();
            expect(color).toBe('#000000');
        });

        it('should interpolate interim colors for 4 steps', () => {
            const fader = new ColorFader('#6478c8', '#000000', 4);
            fader.next();
            let color = fader.color();
            // Step 1: 100 - (100-0)*0.25 = 75, 120 - (120-0)*0.25 = 90, 200 - (200-0)*0.25 = 150
            expect(color).toBe('#4b5a96');

            fader.next();
            color = fader.color();
            // Step 2: 100 - (100-0)*0.5 = 50, 120 - (120-0)*0.5 = 60, 200 - (200-0)*0.5 = 100
            expect(color).toBe('#323c64');

            fader.next();
            color = fader.color();
            // Step 3: 100 - (100-0)*0.75 = 25, 120 - (120-0)*0.75 = 30, 200 - (200-0)*0.75 = 50
            expect(color).toBe('#191e32');

            fader.next();
            color = fader.color();
            // Step 4: should be the end color
            expect(color).toBe('#000000');
        });

        it('should round computed fade RGB values', () => {
            const fader = new ColorFader('#323c46', '#191e23', 10);
            fader.next();
            const color = fader.color();
            // Step 1: 50 - (50-25)*0.1 = 47.5, 60 - (60-30)*0.1 = 57, 70 - (70-35)*0.1 = 66.5
            // Rounded: 48, 57, 67
            expect(color).toBe('#303943');
        });

        it('should return correct color when start and end are equal', () => {
            const fader = new ColorFader('#323232', '#323232', 4);
            fader.next();
            const color = fader.color();
            expect(color).toBe('#323232');
        });
    });

    describe('next', () => {
        it('should increment current step correctly', () => {
            const fader = new ColorFader('#000000', '#FFFFFF', 4);
            expect(fader.currStep).toBe(0);
            fader.next();
            expect(fader.currStep).toBe(1);
            fader.next();
            expect(fader.currStep).toBe(2);
            fader.next();
            expect(fader.currStep).toBe(3);
        });

        it('should not exceed total steps', () => {
            const fader = new ColorFader('#000000', '#FFFFFF', 4);
            for (let i = 0; i < 5; i++) {
                fader.next();
            }
            expect(fader.currStep).toBe(4); // Should stay at max step
        });

        it('should always return 0 when steps is 0', () => {
            const fader = new ColorFader('#000000', '#000000', 0);
            expect(fader.next()).toBe(0); // Should always return 0
        });
    });
});

