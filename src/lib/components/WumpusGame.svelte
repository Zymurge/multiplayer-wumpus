<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { WumpusGame } from '$lib/game/WumpusGame';
  import HexCell from '$lib/components/HexCell.svelte';
  import { COLORS, mergeTheme, type ColorTheme } from '../game/colors.js';
  import { ColorFader, getDistanceColor } from '../game/ColorManager.js';

  // Props for customizing colors
  export let colorTheme: ColorTheme = {};

  // Merge theme with defaults
  $: colors = mergeTheme(colorTheme);

  let sliderGridSize = 5;
  let currentGameGridSize = sliderGridSize;
  let sliderFadeSteps = 4;
  let displayGrid: {
	  value: string;
	  color: string;
	  showWumpus: boolean;
	}[][] = [];

  let game: WumpusGame;
  let moves = 0;
  let gameRunning = false;
  let gameWon = false;
  // Used for reactivity in the grid display
  let gridUpdate = 0;

  const fader = new ColorFader(0, 255, 0, 255, 0, 0);
  const size = 80;
  const padding = 0;

  $: if (game && gridUpdate >= 0) {
    const { width, height } = game.getDimensions();
    const max = game.getMaxDistance();

    displayGrid = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        const cell = game.get(x, y);
        const clicked = cell.clicked;
		const isWumpus = clicked && cell.value === 0;
        const dist = cell.value ?? 0;
        const shade = cell.shade;

        return {
          // distance string only when clicked and not Wumpus
          value: !isWumpus && clicked ? dist.toString() : '',
          // Wumpus gold or distance‐fade color
          color: isWumpus
            ? colors.wumpus
            : clicked
              ? getDistanceColor(dist, shade, max)
              : colors.unclicked,
          showWumpus: isWumpus
        };
      })
    );
  }

  onMount(() => startNewGame());

  function startNewGame() {
	currentGameGridSize = sliderGridSize;
    game = new WumpusGame(currentGameGridSize, currentGameGridSize, sliderFadeSteps);
    moves = 0;
    gameWon = false;
	gameRunning = true;
    gridUpdate++;
  }

  function handleClick(x: number, y: number) {
    if (gameWon || !game) return;

    const res = game.setClicked(x, y);
    moves++;
	console.log(`Clicked ${x},${y}: distance=${res.distance}, found=${res.found}`);
	

    if (res.found) {
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

<div
  class="hex-grid"
  style="
    position: relative;
	width:
	  { ( size + padding ) * ( currentGameGridSize + 0.5 ) }px;
    height:
      {currentGameGridSize * size + size / 2}px;
    --grid-background: {colors.gridBackground};
    --wumpus-color: {colors.wumpus};
    --unclicked-color: {colors.unclicked};
    --hex-border: {colors.hexBorder};
    --text-primary: {colors.textPrimary};
  "
>
  {#each displayGrid as row, y}
    {#each row as cell, x}
      <HexCell
        {x}
        {y}
        value={cell.value}
        backgroundColor={cell.color}
        showWumpus={cell.showWumpus}
        {size}
        on:click={() => handleClick(x, y)}
      />
    {/each}
  {/each}
</div>

{#if gameWon}
  <div class="win-overlay">
    <p>🎉 You found the Wumpus in {moves} moves!</p>
    <button on:click={startNewGame}>OK</button>
  </div>
{/if}

<style>
  .hex-grid {
    margin: 0 auto;
    background: var(--grid-background, #6b1f1f);
    border-radius: 8px;
    overflow: visible;
  }
/* ... other styles ... */
	.win-overlay {
		position: absolute;
		top: 0; left: 0; right: 0; bottom: 0;
		background: rgba(0,0,0,0.7);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 2rem;
		z-index: 10;
	}

	button:hover {
		background: #45a049;
	}
</style>
