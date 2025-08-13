import type { Color } from 'chroma-js';
import chroma from 'chroma-js';

// Re-export centralized colors
export { COLORS } from './colors.ts';

/* ColorFader class to handle color transitions
 * This class allows you to create a color fader that transitions between two RGB colors.
 * It provides a method to get the interpolated color based on a fade amount (0-100).
 * 
 * Start and end RGB values must each be between 0-255. End values must be less than or equal to
 * start values for the fade to work correctly -- things get darker as values approach 0.
 */
export class ColorFader {
	start: Color;
	end:   Color;
	steps: number;
	currStep: number = 0;

	/**
	 * Create a ColorFader instance. Enforces that start and end RGB values are valid.
	 * @param {string} start - Start color, in the hex string form (ie ; '#0022FF')
	 * @param {string} end - Start color, in the hex string form (ie ; '#FE102C')
	 * @param {number} steps - Number of steps for the fade (default is 0, meaning no steps).
	 * @throws {Error} If any RGB value is out of range or if end values are greater than start values.
	 */
	constructor(
		start: string, 
		end: string,
		steps: number = 0
	) {
		if (!chroma.valid(start)) {
			throw new Error('Start color string invalid. Must be of the form "#A0B1C2"');
		}
		this.start = chroma(start);

		if (!chroma.valid(end)) {
			throw new Error('End color string invalid. Must be of the form "#A0B1C2"');
		}
		this.end = chroma(end);

		// If steps is set, ensure it's a positive integer
		if (steps < 0 || !Number.isInteger(steps)) {
			throw new Error('Steps must be a non-negative integer');
		}
		this.steps = steps;
	}

    /**
     * Get the color for a given fadeAmount (0-100):
     * 0 returns start color
     * 100 returns end color.
     * 1-99 Interpolates between start and end colors based on the shade percentage.
     * @param {number} fadeAmount - The percentage (0-100) to fade from start to end.
     * @returns {string} The interpolated color as a hex string.
     */
    colorAtFadeAmount(fadeAmount: number): string {
        // Clamp fadeAmount to be within 0-100
        const clampedFadeAmount = Math.max(0, Math.min(100, fadeAmount));
        const ratio = clampedFadeAmount / 100; // Convert percentage to a 0-1 ratio for chroma.mix

        // Use chroma.js mix function for interpolation
        // 'rgb' is a common and usually desired interpolation space for visual smoothness
        const interpolatedColor = chroma.mix(this.start, this.end, ratio, 'rgb');
        return interpolatedColor.hex(); // Return the color as a hex string
    }

    /**
     * Get the current color based on the current step.
     * If steps is 0, it returns the start color.
     * @returns {string} The color as a hex string for the current step.
     */
    color(): string {
        // Calculate the fade percentage based on current step
        const fadePercentage = this.steps > 0 ? (this.currStep / this.steps) * 100 : 0;
        return this.colorAtFadeAmount(fadePercentage);
    }

	/**
	 * Decrement the current step and return the new step value.
	 * If steps is 0, it returns 0.
	 * @returns {number} The current step value after decrementing.
	 */
	next(): number {
		this.currStep = Math.min(this.steps, this.currStep + 1);
		return this.currStep;
	}
}

// Get color based on distance (0=green, half board=yellow, max=red)
// Returns the color as a hex string
export function getDistanceColor(distance: number, maxDistance: number): string {	
	const ratio = distance / maxDistance;
	let r, g, b;
	if (ratio < 0.5) {
		// Green to Yellow (0 to 0.5)
		const t = ratio * 2;
		r = Math.round(255 * t);
		g = 255;
		b = 0;
	} else {
		// Yellow to Red (0.5 to 1)
		const t = (ratio - 0.5) * 2;
		r = 255;
		g = Math.round(255 * (1 - t));
		b = 0;
	}
	// Use chroma-js to convert RGB to hex
	return chroma.rgb(r, g, b).hex();
}