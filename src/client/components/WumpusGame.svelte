<!-- src/routes/+page.svelte -->
<script lang="ts">
  //import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { mergeTheme, type ColorTheme } from '@shared/colors.js';
  import { gameStore } from './gameStore.ts';
  import HexCell from '@client/components/HexCell.svelte';
  import { wsClient } from '@client/ws/wsClient.ts';

  // Props for customizing colors
  export let colorTheme: ColorTheme = {};
  $: colors = mergeTheme(colorTheme);
  
  // Use sliderCellSize for rendering calculations
  let sliderCellSize = 80; // default cell size
  let sliderGridSize = 5;  // default grid size
  let sliderFadeSteps = 4; // default fade steps
  // cache to prevent midgame slider changes from affecting the game
  let currentGameGridSize = sliderGridSize; 

  $: HEXSIZE = sliderCellSize;
  $: HEXHEIGHT = 2 * sliderCellSize / Math.sqrt(3);
  $: GRIDWIDTH = (sliderCellSize + padding) * (currentGameGridSize + 0.5);
  $: GRIDHEIGHT = currentGameGridSize * HEXHEIGHT * 0.76 + HEXHEIGHT / 4;

  // Game state vars
  let displayGrid: any[] = [];
  let moves = 0;
  let gameRunning = false;
  let gameWon = false;
  let errorMsg = '';

  // Subscribe to the gameStore and update local state
  gameStore.subscribe(($gameStore) => {
    if ($gameStore.state) {
      displayGrid = $gameStore.state.grid;
      moves = $gameStore.state.moves;
      gameWon = $gameStore.state.found;
      gameRunning = !$gameStore.state.found;
      errorMsg = '';
    } else if ($gameStore.error) {
      errorMsg = $gameStore.error.message || $gameStore.error.error;
      displayGrid = [];
      moves = 0;
      gameWon = false;
      gameRunning = false;
    } else {
      displayGrid = [];
      moves = 0;
      gameWon = false;
      gameRunning = false;
      errorMsg = '';
    }
  });
  const padding = 0;

  /**
   * Original in browser implementation. Keep for refence until ws is working
  
   // TODO: Get all this state from the websocket
   $: if (game && gridUpdate >= 0) {
      const { width, height } = game.getDimensions();
    
    $: if (gridUpdate >= 0) {
        const width = currentGameGridSize;
        const height = currentGameGridSize;
        displayGrid = Array.from({ length: height }, (_, y) => {return []}
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
          
          Placeholder: WebSocket integration will go here
          onMount(() => { ... });
  */
          
  function startNewGame() {
    // Lazy-connect and request a new game
    // Use current slider values for grid size and fade steps; cell size is visual only
    wsClient.startGame(currentGameGridSize, sliderFadeSteps);
  }

  function handleClick(x: number, y: number) {
  // Send a click to the server; no-op if not connected yet
  wsClient.clickCell(x, y);
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
	<button data-testid="restart-btn" on:click={startNewGame}>
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

{#if errorMsg}
  <div class="error-overlay">
    <p data-testid="error-msg">{errorMsg}</p>
  </div>
{:else if gameWon}
  <div class="win-overlay">
    <p>🎉 You found the Wumpus in {moves} moves!</p>
    <button data-testid="ok-btn" on:click={startNewGame}>OK</button>
  </div>
{/if}

<style>
  .error-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(200,0,0,0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 2rem;
    z-index: 10;
  }

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
