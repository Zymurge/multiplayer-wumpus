export class ColorFader {
	stR: number;
	stG: number;
	stB: number;
	enR: number;
	enG: number;
	enB: number;

	constructor(sr: number, sg: number, sb: number, er: number, eg: number, eb: number) {
		this.stR = sr;
		this.stG = sg;
		this.stB = sb;
		this.enR = er;
		this.enG = eg;
		this.enB = eb;
	}

	color(shade: number): string {
		const r = this.enR + (this.enR - this.stR) * shade / 100;
		const g = this.enG + (this.enG - this.stG) * shade / 100;
		const b = this.enB + (this.enB - this.stB) * shade / 100;
		return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
	}
}

// Get color based on distance (0=green, half board=yellow, max=red)
export function getDistanceColor(distance: number, shade: number, maxDistance: number): string {
	if (shade >= 100) return '#333'; // Fully faded
	
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
	
	// Apply fade (make darker as shade increases)
	const fadeMultiplier = (100 - shade) / 100;
	r = Math.round(r * fadeMultiplier);
	g = Math.round(g * fadeMultiplier);
	b = Math.round(b * fadeMultiplier);
	
	return `rgb(${r},${g},${b})`;
}