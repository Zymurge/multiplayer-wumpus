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
