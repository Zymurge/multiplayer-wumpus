<script lang="ts">
	import { onMount } from 'svelte';
	import { GameGrid } from '../../../game/WumpusGame.js';
	import { ColorFader } from '../../../game/ColorManager.js';
	import GridSquare from './GridSquare.svelte';

	export const gameId = 'single-player';

	let sliderGridSize = 10;
	let currentGameGridSize = sliderGridSize;
	let sliderFadeSteps = 4;
	
	let game: GameGrid;
	let gameRunning = false;
	let gameWon = false;
	let moves = 0;

	let gridUpdate = 0; // Force reactivity
	
	// const fader = new ColorFader(0, 255, 0, 255, 0, 0); // Green to Red gradient
	
	// Get color based on distance (0=green, half board=yellow, max=red)
	function getDistanceColor(distance: number, shade: number): string {
		if (shade >= 100) return '#333'; // Fully faded
		
		const maxDistance = Math.sqrt(2) * currentGameGridSize; // Max possible distance
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

	// Create reactive display data
	$: displayGrid = game && gridUpdate >= 0 ? Array.from({ length: currentGameGridSize }, (_, y) => 
		Array.from({ length: currentGameGridSize }, (_, x) => {
			const square = game.get(x, y);
			const isWumpus = square?.clicked && square.value === 0;
			return {
				value: square?.clicked && square.value !== null && square.shade < 100 && !isWumpus ? square.value.toString() : '',
				color: isWumpus ? '#FFD700' : (square?.clicked ? getDistanceColor(square.value || 0, square.shade) : '#333'),
				showWumpus: isWumpus
			};
		})
	) : [];

	onMount(() => {
		startNewGame();
	});

	function startNewGame() {
		currentGameGridSize = sliderGridSize;
		game = new GameGrid(currentGameGridSize, currentGameGridSize, sliderFadeSteps);
		gameWon = false;
		moves = 0;
		gameRunning = true;
		gridUpdate++; // Force reactivity to refresh display
	}

	function handleSquareClick(x: number, y: number) {
		if (gameWon || !game) return;
		
		const result = game.setClicked(x, y);
		moves++;
		
		console.log(`Clicked ${x},${y}: distance=${result.distance}, found=${result.found}`);
		console.log(`Square after click:`, game.get(x, y));
		
		if (result.found) {
			gameWon = true;
			gameRunning = false;
		}
		
		// Trigger reactivity
		gridUpdate++;
	}

</script>

<div class="controls">
    <label>
        Grid Size: {sliderGridSize}
        <input type="range" min="4" max="20" bind:value={sliderGridSize} />
    </label>
    <label>
        Results Lifetime: {sliderFadeSteps}
        <input type="range" min="1" max="10" bind:value={sliderFadeSteps} />
    </label>
	<button on:click={startNewGame}>
        {gameRunning ? 'Restart' : 'New Game'}
    </button>
</div>

<div class="game-container">
	<div class="game-info">
		<h1>Hunt the Wumpus</h1>
		<p>Moves: {moves}</p>
	</div>
	
	<div class="game-board">
		{#if displayGrid.length > 0}
			{#each displayGrid as row, y}
				<div class="board-row">
					{#each row as cell, x}
						<GridSquare
							{x}
							{y}
							value={cell.value}
							backgroundColor={cell.color}
							showWumpus={cell.showWumpus}
							on:click={() => handleSquareClick(x, y)}
						/>
					{/each}
				</div>
			{/each}
		{/if}
	</div>
	
	{#if gameWon}
		<div class="win-overlay">
			<div class="win-message">
				<p>🎉 You found the Wumpus in {moves} moves!</p>
  		        <button on:click={() => (gameWon = false)}>OK</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.controls {
		display: flex;
		gap: 20px;
		margin-top: 40px;
		margin-bottom: 20px;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
	}

	.controls label {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #b71f3b;
		font-weight: bold;
	}

	.game-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px;
		padding-top: 64px;
		font-family: Arial, sans-serif;
		position: relative;
		min-height: 100vh;
	}

	.game-info {
		text-align: center;
		margin-bottom: 20px;
		height: 80px; /* Fixed height to prevent layout shifts */
	}

	.game-info h1 {
		color: #0b460b;
		margin-bottom: 10px;
	}

	.win-overlay {
		position: absolute;
		top: 10px;
		left: 50%;
		transform: translateX(-50%);
		width: 400px;
		height: 145px;
		background-color: rgba(0, 0, 0, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
		border-radius: 14px;
		border: 3px solid #66d169;
	}

	.win-message {
		background-color: #2a2a2a;
		color: #4CAF50;
		font-weight: bold;
		font-size: 1.2em;
		padding: 20px;
		border-radius: 10px;
		text-align: center;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
	}

	.win-message p {
		margin: 0 0 15px 0;
	}

	.game-board {
		display: flex;
		flex-direction: column;
		gap: 2px;
		background: #666;
		padding: 10px;
		border-radius: 8px;
		overflow: visible;
	}

	.board-row {
		display: flex;
		gap: 2px;
		overflow: visible;
	}

	button {
		background: #4CAF50;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
	}

	button:hover {
		background: #45a049;
	}
</style>
