export interface GridSquare {
	shade: number;
	val: number | null;
	clicked: boolean;
	fadeCounter: number; // Counts down from 3 to 0 with each click elsewhere
}

export interface WumpusPosition {
	x: number;
	y: number;
}

export class GameGrid {
	x: number;
	y: number;
	grid: GridSquare[][] = [];
	wumpus: WumpusPosition;
	last: { x: number; y: number; dist: number } | null;
	clickCount: number;
	
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.build();
		this.wumpus = this.initWumpus();
		this.last = null;
		this.clickCount = 0;
	}

	build() {
		console.log(`Building Grid ${this.x}x${this.y}`);
		this.grid = Array.from(
			{ length: this.y }, 
			() => Array.from(
				{ length: this.x },
				() => ({ shade: 100, val: null, clicked: false, fadeCounter: 0 })
			)
		);
	}

	fade(rate: number) {
		this.grid.forEach((row) => {
			row.forEach((sq) => {
				sq.shade = GameGrid.fadeVal(sq.shade, rate);
			});  
		});      
	}
	
	get(x: number, y: number): GridSquare | null {
		if (x >= 0 && x < this.x && y >= 0 && y < this.y) {
			return this.grid[y][x];
		}        
		return null;
	}

	initWumpus(): WumpusPosition {
		const rr = Math.floor(Math.random() * this.y);
		const rc = Math.floor(Math.random() * this.x);
		return { x: rc, y: rr };
	}

	moveWumpus(dist: number) {
		const moves = Math.floor(dist / 2);
		for (let i = moves; i > 0; i--) {
			const dx = Math.floor(Math.random() * 3) - 1;
			const dy = Math.floor(Math.random() * 3) - 1;
			console.log(`-- ${i}: wumpus moving ${dx},${dy} from ${this.wumpus.x},${this.wumpus.y}`);
			
			this.wumpus.x += dx;
			this.wumpus.x = Math.max(0, Math.min(this.x - 1, this.wumpus.x));
			this.wumpus.y += dy;
			this.wumpus.y = Math.max(0, Math.min(this.y - 1, this.wumpus.y));
		}
	}

	setClicked(x: number, y: number): { found: boolean; distance: number } {
		const distance = Math.floor(Math.sqrt((this.wumpus.x - x) ** 2 + (this.wumpus.y - y) ** 2));
		
		// Decrement fade counter for all other squares first
		this.fadeBasedOnClicks(x, y);
		
		// Set clicked square to start fading from 3 clicks
		this.grid[y][x].val = distance;
		this.grid[y][x].shade = 0;
		this.grid[y][x].clicked = true;
		this.grid[y][x].fadeCounter = 3;
		
		const found = distance === 0;
		
		if (this.last && !found) {
			const moveDist = Math.floor(Math.sqrt((this.last.x - x) ** 2 + (this.last.y - y) ** 2));
			this.last = { x, y, dist: moveDist };
			console.log(`The distance between clicks is ${moveDist}`);
			this.moveWumpus(moveDist);
		} else {
			this.last = { x, y, dist: 0 };
			console.log('First move, no previous distance');
		}
		
		return { found, distance };
	}

	fadeBasedOnClicks(clickedX: number, clickedY: number) {
		this.grid.forEach((row, y) => {
			row.forEach((sq, x) => {
				if (sq.clicked && sq.fadeCounter > 0) {
					// Decrement fade counter for all squares except the one just clicked
					if (x !== clickedX || y !== clickedY) {
						sq.fadeCounter--;
					}
					
					// If fade counter reaches 0, reset the square completely
					if (sq.fadeCounter === 0) {
						sq.shade = 100;
						sq.clicked = false;
						sq.val = null;
					} else {
						// Set shade based on fade counter: 3=0%, 2=33%, 1=66%
						sq.shade = (3 - sq.fadeCounter) * 33;
					}
				}
			});
		});
	}

	static fadeVal(curr: number, rate: number): number {
		const n = curr + rate;
		return n < 100 ? n : 100;
	}
}
