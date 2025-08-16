<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { WumpusGame } from '@shared/game/WumpusGame.js';
  import HexCell from '@client/components/HexCell.svelte';
  //import { HEXHEIGHT, HEXSIZE } from '@client/components/HexCell.svelte';
  import { mergeTheme, type ColorTheme } from '@shared/game/colors.js';

  // Props for customizing colors
  export let colorTheme: ColorTheme = {};
  // Merge theme with defaults
  $: colors = mergeTheme(colorTheme);
    // Use sliderCellSize for calculations
  $: HEXSIZE = sliderCellSize;
  $: HEXHEIGHT = 2 * sliderCellSize / Math.sqrt(3);
  $: gridWidth = (sliderCellSize + padding) * (currentGameGridSize + 0.5);
  $: gridHeight = currentGameGridSize * HEXHEIGHT * 0.76 + HEXHEIGHT / 4;

  
  let sliderGridSize = 5;
  let currentGameGridSize = sliderGridSize;
  let sliderCellSize = 80; // default cell size
  let sliderFadeSteps = 4;
  let game: WumpusGame | undefined;
  let displayGrid: {
    value: string;
    color: string;
    showWumpus: boolean;
  }[][] = [];
  let moves = 0;
  let gameRunning = false;
  let gameWon = false;
  // Used for reactivity in the grid display
  let gridUpdate = 0;
  const padding = 0;

  $: if (game && gridUpdate >= 0) {
    const { width, height } = game.getDimensions();

    displayGrid = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        const cell = game!.get(x, y);
        // Assume cell.setColorManager is called by BoardState internally
        // and cell.colorManager provides the correct color for this cell
        const clicked = cell.clicked;
        const isWumpus = clicked && cell.value === 0;

        return {
          value: !isWumpus && clicked ? cell.value?.toString() ?? '' : '',
          color: cell.fader?.color() ?? '', // color logic handled by ColorFader/ColorManager
          showWumpus: isWumpus
        };
      })
    );
  }

  onMount(() => startNewGame());

  function startNewGame() {
	  currentGameGridSize = sliderGridSize;console.log(`Starting new game with grid size ${currentGameGridSize} and cell size ${sliderCellSize}`);
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
        Cell Size: {sliderCellSize}
        <input type="range" min="24" max="120" bind:value={sliderCellSize} />
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
      {(HEXSIZE + padding) * (currentGameGridSize + 0.5)}px;
    height:
      {currentGameGridSize * HEXHEIGHT * 0.76 + HEXHEIGHT / 4}px;
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
        hexSize={sliderCellSize}
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
