import { describe, it, expect } from 'vitest';
import { ColorFader } from './ColorManager';

describe('ColorFader', () => {
    describe('constructor', () => {

        it('should successfully create ColorFader with valid string inputs', () => {
            expect(() => new ColorFader('#FF0000', '#0000FF', 10)).not.toThrow();
            const fader = new ColorFader('#FF0000', '#0000FF', 10);
            expect(fader.start.hex()).toBe('#ff0000'); // chroma.js normalizes to lowercase
            expect(fader.end.hex()).toBe('#0000ff');
            expect(fader.steps).toBe(10);
        });

        it('should throw an error for invalid start color string', () => {
            expect(() => new ColorFader('not-a-hex', '#112233', 1)).toThrow(/^Start color string invalid./);
            expect(() => new ColorFader('#0000', '#112233', 1)).toThrow(/^Start color string invalid./); // Too short hex
            expect(() => new ColorFader('#GG00FF', '#112233', 1)).toThrow(/^Start color string invalid./); // Invalid hex chars
        });

        it('should throw an error for invalid end color string', () => {
            expect(() => new ColorFader('#112233', 'invalid-hex', 4)).toThrow(/^End color string invalid./);
            expect(() => new ColorFader('#112233', '#F0F0F', 4)).toThrow(/^End color string invalid./); // Too short hex
            expect(() => new ColorFader('#112233', '#00HHFF', 4)).toThrow(/^End color string invalid./); // Invalid hex chars
        });

        it('should throw an error for negative steps', () => {
            expect(() => new ColorFader('#FF0000', '#0000FF', -5)).toThrow('Steps must be a non-negative integer');
        });

        it('should throw an error for non-integer steps', () => {
            expect(() => new ColorFader('#FF0000', '#0000FF', 10.5)).toThrow('Steps must be a non-negative integer');
        });
    });

    describe('color', () => {
        it('should return correct color for shade=0 (start color)', () => {
            const fader = new ColorFader('#0156AB', '#00000', 1);
            const color = fader.color();
            expect(color).toBe('#0156AB');
        });

        it('should return correct color for shade=100 (end color)', () => {
            const fader = new ColorFader('#0156AB', '#00000', 1);
            // run to last step
            fader.next();
            const color = fader.color();
            expect(color).toBe('#00000');
        });

        // it('should interpolate interim colors for 4 steps', () => {
        //     const fader = new ColorFader(100, 120, 200, 0, 0, 0, 4);
        //     // run through each step
        //     fader.next();
        //     let color = fader.color();
        //     // r = 100 - (100-0)*0.25 = 100 - 25 = 75
        //     // g = 120 - (120-0)*0.25 = 120 - 30 = 90
        //     // b = 200 - (200-0)*0.25 = 200 - 50 = 150
        //     expect(color).toBe('rgb(75,90,150)');

        //     fader.next();
        //     color = fader.color();
        //     // r = 100 - (100-0)*0.5 = 100 - 50 = 50
        //     // g = 120 - (120-0)*0.5 = 120 - 60 = 60
        //     // b = 200 - (200-0)*0.5 = 200 - 100 = 100
        //     expect(color).toBe('rgb(50,60,100)');

        //     fader.next();
        //     color = fader.color();
        //     // r = 100 - (100-0)*0.75 = 100 - 75 = 25
        //     // g = 120 - (120-0)*0.75 = 120 - 90 = 30
        //     // b = 200 - (200-0)*0.75 = 200 - 150 = 50
        //     expect(color).toBe('rgb(25,30,50)');

        //     fader.next();
        //     color = fader.color();
        //     // should be the end color on 4th step
        //     expect(color).toBe('rgb(0,0,0)');
        // });

        // it('should round computed fade RGB values', () => {
        //     const fader = new ColorFader(50, 60, 70, 25, 30, 35, 10);
        //     fader.next();
        //     const color = fader.color();
        //     // r = 50 - (50-25)*0.1 = 50 - 2.5 = 47.5
        //     // g = 60 - (60-30)*0.1 = 60 - 3 = 57
        //     // b = 70 - (70-35)*0.1 = 70 - 3.5 = 66.5
        //     // Final rounded values: r=48, g=57, b=67
        //     expect(color).toBe('rgb(48,57,67)');
        // });

        // it('should return correct color when start and end are equal', () => {
        //     const fader = new ColorFader(50, 50, 50, 50, 50, 50, 4);
        //     fader.next();
        //     const color = fader.color();
        //     expect(color).toBe('rgb(50,50,50)');
        // });
    });

    describe('next', () => {
        it('should increment current step correctly', () => {
            const fader = new ColorFader('#00000', '#FFFFFF', 4);
            expect(fader.currStep).toBe(0);
            fader.next();
            expect(fader.currStep).toBe(1);
            fader.next();
            expect(fader.currStep).toBe(2);
            fader.next();
            expect(fader.currStep).toBe(3);
        });

        it('should not exceed total steps', () => {
            const fader = new ColorFader('#00000', '#FFFFFF', 4);
            for (let i = 0; i < 5; i++) {
                fader.next();
            }
            expect(fader.currStep).toBe(4); // Should stay at max step
        });

        it('should always return 0 when steps is 0', () => {
            const fader = new ColorFader('#00000', '#00000', 0);
            expect(fader.next()).toBe(0); // Should always return 0
        });
    });
});

