import { describe, it, expect } from 'vitest';
import { ColorFader } from './ColorManager';

describe('ColorFader', () => {
    describe('constructor', () => {
        it('should initialize with valid correct start and end RGB values', () => {
            const fader = new ColorFader(100, 50, 200, 0, 40, 200);
            expect(fader.stR).toBe(100);
            expect(fader.stG).toBe(50);
            expect(fader.stB).toBe(200);
            expect(fader.enR).toBe(0);
            expect(fader.enG).toBe(40);
            expect(fader.enB).toBe(200);
        });

        it('should throw an error for invalid RGB values', () => {
            expect(() => new ColorFader(256, 0, 0, 100, 100, 100)).toThrow('RGB values must be between 0-255');
            expect(() => new ColorFader(0, -1, 0, 100, 100, 100)).toThrow('RGB values must be between 0-255');
            expect(() => new ColorFader(0, 0, 0, -10, 100, 100)).toThrow('RGB values must be between 0-255');
        });

        it('should throw an error if any end RGB values are greater than its start RGB values', () => {
            expect(() => new ColorFader(100, 100, 100, 200, 90, 90)).toThrow('End RGB values must be less than or equal to start RGB values');
            expect(() => new ColorFader(100, 100, 100, 90, 110, 90)).toThrow('End RGB values must be less than or equal to start RGB values');
            expect(() => new ColorFader(100, 100, 100, 90, 90, 110)).toThrow('End RGB values must be less than or equal to start RGB values');
        });

        it('should round inputed fractional RGB values', () => {
            const fader = new ColorFader(100.5, 50.2, 200.8, 0.3, 40.7, 200.1);
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
            const fader = new ColorFader(100, 150, 200, 0, 0, 0);
            const color = fader.color(0);
            expect(color).toBe('rgb(100,150,200)');
        });

        it('should return correct color for shade=100 (end color)', () => {
            const fader = new ColorFader(100, 150, 200, 0, 0, 0);
            const color = fader.color(100);
            expect(color).toBe('rgb(0,0,0)');
        });

        it('should interpolate color for shade=50', () => {
            const fader = new ColorFader(100, 150, 200, 0, 0, 0);
            const color = fader.color(50);
            // r = 100 - (100-0)*0.5 = 100 - 50 = 50
            // g = 150 - (150-0)*0.5 = 150 - 75 = 75
            // b = 200 - (200-0)*0.5 = 200 - 100 = 100
            expect(color).toBe('rgb(50,75,100)');
        });

        it('should round computed fade RGB values', () => {
            const fader = new ColorFader(50, 60, 70, 10, 10, 10);
            const color = fader.color(24);
            // r = 50 - (50-10)*0.24 = 50 - 9.6 = 40.4
            // g = 60 - (60-10)*0.24 = 60 - 12 = 48
            // b = 70 - (70-10)*0.24 = 70 - 14.4 = 55.6
            // Final rounded values: r=40, g=48, b=56
            expect(color).toBe('rgb(40,48,56)');
        });

        it('should return correct color for fadeAmount=100 when start and end are equal', () => {
            const fader = new ColorFader(50, 50, 50, 50, 50, 50);
            const color = fader.color(100);
            expect(color).toBe('rgb(50,50,50)');
        });

        it('should return correct color for fadeAmount=0 when start and end are equal', () => {
            const fader = new ColorFader(80, 90, 100, 80, 90, 100);
            const color = fader.color(0);
            expect(color).toBe('rgb(80,90,100)');
        });
    });
});

