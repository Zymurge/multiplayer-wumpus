<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { WumpusGame } from '$lib/game/WumpusGame';
  import HexCell from '$lib/components/HexCell.svelte';
  import { ColorFader, getDistanceColor } from '../game/ColorManager.js';

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
  let gameWon = false;
  let gridUpdate = 0;

  const fader = new ColorFader(0, 255, 0, 255, 0, 0);
  const size = 80;
  const padding = 2;

  $: if (game) {
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
            ? '#FFD700'
            : clicked
              ? getDistanceColor(dist, shade, max)
              : '#333',
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
    gridUpdate++;
  }

  function handleClick(x: number, y: number) {
    if (gameWon) return;
    const res = game.setClicked(x, y);
    moves++;
    if (res.found) gameWon = true;
    gridUpdate++;
  }
</script>

<div class="controls">
  <!-- sliders and buttons -->
</div>

<div
  class="hex-grid"
  style="
    position: relative;
	width:
	  { ( size + padding ) * ( currentGameGridSize + 0.5 ) }px;
    height:
      {currentGameGridSize * size + size / 2}px;
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
    background: #666;
    border-radius: 8px;
    overflow: visible;
  }
  /* ... other styles ... */
</style>
