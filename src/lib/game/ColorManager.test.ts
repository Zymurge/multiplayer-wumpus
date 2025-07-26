import { describe, it, expect } from 'vitest';
import { ColorFader } from './ColorManager';

describe('ColorFader', () => {
    describe('constructor', () => {
        it('should initialize with valid correct start and end RGB values and steps', () => {
            const fader = new ColorFader(100, 50, 200, 0, 40, 200, 8);
            expect(fader.stR).toBe(100);
            expect(fader.stG).toBe(50);
            expect(fader.stB).toBe(200);
            expect(fader.enR).toBe(0);
            expect(fader.enG).toBe(40);
            expect(fader.enB).toBe(200);
            expect(fader.steps).toBe(8);
            expect(fader.currStep).toBe(0);
        });

        it('should throw an error for invalid RGB values', () => {
            expect(() => new ColorFader(256, 0, 0, 100, 100, 100, 1)).toThrow('RGB values must be between 0-255');
            expect(() => new ColorFader(0, -1, 0, 100, 100, 100, 1)).toThrow('RGB values must be between 0-255');
            expect(() => new ColorFader(0, 0, 0, -10, 100, 100, 1)).toThrow('RGB values must be between 0-255');
        });

        it('should throw an error if any end RGB values are greater than its start RGB values', () => {
            expect(() => new ColorFader(100, 100, 100, 200, 90, 90, 1)).toThrow('End RGB values must be less than or equal to start RGB values');
            expect(() => new ColorFader(100, 100, 100, 90, 110, 90, 1)).toThrow('End RGB values must be less than or equal to start RGB values');
            expect(() => new ColorFader(100, 100, 100, 90, 90, 110, 1)).toThrow('End RGB values must be less than or equal to start RGB values');
        });

        it('should throw an error if the steps is not a non-negative integer', () => {
            expect(() => new ColorFader(100, 50, 200, 0, 40, 200, -1)).toThrow('Steps must be a non-negative integer');
            expect(() => new ColorFader(100, 50, 200, 0, 40, 200, 1.5)).toThrow('Steps must be a non-negative integer');
        });

        it('should round inputed fractional RGB values', () => {
            const fader = new ColorFader(100.5, 50.2, 200.8, 0.3, 40.7, 200.1, 2);
            expect(fader.stR).toBe(101);
            expect(fader.stG).toBe(50);
            expect(fader.stB).toBe(201);
            expect(fader.enR).toBe(0);
            expect(fader.enG).toBe(41);
            expect(fader.enB).toBe(200);
        });
    });

    describe('color', () => {
        it('should return correct color for shade=0 (start color)', () => {
            const fader = new ColorFader(100, 150, 200, 0, 0, 0, 1);
            const color = fader.color();
            expect(color).toBe('rgb(100,150,200)');
        });

        it('should return correct color for shade=100 (end color)', () => {
            const fader = new ColorFader(100, 150, 200, 0, 0, 0, 1);
            // run to last step
            fader.next();
            const color = fader.color();
            expect(color).toBe('rgb(0,0,0)');
        });

        it('should interpolate interim colors for 4 steps', () => {
            const fader = new ColorFader(100, 120, 200, 0, 0, 0, 4);
            // run through each step
            fader.next();
            let color = fader.color();
            // r = 100 - (100-0)*0.25 = 100 - 25 = 75
            // g = 120 - (120-0)*0.25 = 120 - 30 = 90
            // b = 200 - (200-0)*0.25 = 200 - 50 = 150
            expect(color).toBe('rgb(75,90,150)');

            fader.next();
            color = fader.color();
            // r = 100 - (100-0)*0.5 = 100 - 50 = 50
            // g = 120 - (120-0)*0.5 = 120 - 60 = 60
            // b = 200 - (200-0)*0.5 = 200 - 100 = 100
            expect(color).toBe('rgb(50,60,100)');

            fader.next();
            color = fader.color();
            // r = 100 - (100-0)*0.75 = 100 - 75 = 25
            // g = 120 - (120-0)*0.75 = 120 - 90 = 30
            // b = 200 - (200-0)*0.75 = 200 - 150 = 50
            expect(color).toBe('rgb(25,30,50)');

            fader.next();
            color = fader.color();
            // should be the end color on 4th step
            expect(color).toBe('rgb(0,0,0)');
        });

        it('should round computed fade RGB values', () => {
            const fader = new ColorFader(50, 60, 70, 25, 30, 35, 10);
            fader.next();
            const color = fader.color();
            // r = 50 - (50-25)*0.1 = 50 - 2.5 = 47.5
            // g = 60 - (60-30)*0.1 = 60 - 3 = 57
            // b = 70 - (70-35)*0.1 = 70 - 3.5 = 66.5
            // Final rounded values: r=48, g=57, b=67
            expect(color).toBe('rgb(48,57,67)');
        });

        it('should return correct color when start and end are equal', () => {
            const fader = new ColorFader(50, 50, 50, 50, 50, 50, 4);
            fader.next();
            const color = fader.color();
            expect(color).toBe('rgb(50,50,50)');
        });
    });

    describe('next', () => {
        it('should increment current step correctly', () => {
            const fader = new ColorFader(100, 50, 200, 0, 40, 200, 4);
            expect(fader.currStep).toBe(0);
            fader.next();
            expect(fader.currStep).toBe(1);
            fader.next();
            expect(fader.currStep).toBe(2);
            fader.next();
            expect(fader.currStep).toBe(3);
        });

        it('should not exceed total steps', () => {
            const fader = new ColorFader(100, 50, 200, 0, 40, 200, 4);
            for (let i = 0; i < 5; i++) {
                fader.next();
            }
            expect(fader.currStep).toBe(4); // Should stay at max step
        });

        it('should always return 0 when steps is 0', () => {
            const fader = new ColorFader(100, 50, 200, 0, 40, 200, 0);
            expect(fader.next()).toBe(0); // Should always return 0
        });
    });
});

