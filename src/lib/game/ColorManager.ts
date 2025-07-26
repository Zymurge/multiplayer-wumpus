// Re-export centralized colors
export { COLORS } from './colors.js';

/* ColorFader class to handle color transitions
 * This class allows you to create a color fader that transitions between two RGB colors.
 * It provides a method to get the interpolated color based on a fade amount (0-100).
 * 
 * Start and end RGB values must each be between 0-255. End values must be less than or equal to
 * start values for the fade to work correctly -- things get darker as values approach 0.
 */
export class ColorFader {
	stR: number;
	stG: number;
	stB: number;
	enR: number;
	enG: number;
	enB: number;
	steps: number;
	currStep: number = 0;

	/**
	 * Create a ColorFader instance. Enforces that start and end RGB values are between 0-255 and that
	 * end values are less than or equal to start values. Rounds input RGB values to the nearest integer.
	 * @param {number} sr - Start red value (0-255).
	 * @param {number} sg - Start green value (0-255).
	 * @param {number} sb - Start blue value (0-255).
	 * @param {number} er - End red value (0-255).
	 * @param {number} eg - End green value (0-255).
	 * @param {number} eb - End blue value (0-255).
	 * @param {number} steps - Number of steps for the fade (default is 0, meaning no steps).
	 * @throws {Error} If any RGB value is out of range or if end values are greater than start values.
	 */
	constructor(
		sr: number, sg: number, sb: number, 
		er: number, eg: number, eb: number,
		steps: number = 0
	) {
		this.stR = Math.round(sr);
		this.stG = Math.round(sg);
		this.stB = Math.round(sb);
		this.enR = Math.round(er);
		this.enG = Math.round(eg);
		this.enB = Math.round(eb);
		this.steps = steps;

		// validated ranges
		if (this.stR < 0 || this.stR > 255 || this.stG < 0 || this.stG > 255 || this.stB < 0 || this.stB > 255 ||
			this.enR < 0 || this.enR > 255 || this.enG < 0 || this.enG > 255 || this.enB < 0 || this.enB > 255) {
			throw new Error('RGB values must be between 0-255');
		}

		// validate end values are less than or equal to start values
		if (this.enR > this.stR || this.enG > this.stG || this.enB > this.stB) {
			throw new Error('End RGB values must be less than or equal to start RGB values');
		}

		// If steps is set, ensure it's a positive integer
		if (steps < 0 || !Number.isInteger(steps)) {
			throw new Error('Steps must be a non-negative integer');
		}
		this.steps = steps;
	}

	/**
	 * Get the color for a given fadeAmount (0-100):
	 *     0 returns start color
	 *   100 returns end color.
	 *  1-99 Interpolates between start and end colors based on the shade percentage.
	 * @param {number} fadeAmount - The percentage (0-100) to fade from start to end.
	 * @returns {string} The RGB color string.
	 */
	colorAtFadeAmount(fadeAmount: number): string {
		const r = this.stR - (this.stR - this.enR) * fadeAmount / 100;
		const g = this.stG - (this.stG - this.enG) * fadeAmount / 100;
		const b = this.stB - (this.stB - this.enB) * fadeAmount / 100;
		return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
	}

	/**
	 * Get the current color based on the current step.
	 * If steps is 0, it returns the start color.
	 * @returns {string} The RGB color string for the current step.
	 */
	color() {
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

import { COLORS as CENTRALIZED_COLORS } from './colors.js';

// Get color based on distance (0=green, half board=yellow, max=red)
export function getDistanceColor(distance: number, shade: number, maxDistance: number): string {
	if (shade >= 100) return CENTRALIZED_COLORS.unclicked; // Fully faded
	
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
	
	return `rgb(${r},${g},${b})`;
}