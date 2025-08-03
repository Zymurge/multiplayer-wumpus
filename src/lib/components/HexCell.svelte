<!-- src/lib/components/HexCell.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import WumpusSprite from './WumpusSprite.svelte';
  import { COLORS } from '../game/colors.js';

  export let x: number;
  export let y: number;
  export let value: string = '';
  export let backgroundColor: string = COLORS.unclicked;
  export let showWumpus: boolean = false;
  export let size: number = 80;

  const dispatch = createEventDispatcher<{ click: { x: number; y: number } }>();

  // hex metrics for pointy-top even-q
  //const height = 2 * size / Math.sqrt(3);
  const height = 1.15 * size;
  const xPad = 0
  const yPad = 2; // slight vertical padding for better click area

  // Calculate the position based on hex grid layout
  $: left = x * size + (y % 2 === 1 ? size * 0.5 : 0) + x * xPad;
  $: top  = y * (height * 0.75) + (y * yPad);

  function handleClick() {
    dispatch('click', { x, y });
  }
</script>

<button
  class="hex-cell"
  style:width="{size}px"
  style:height="{height}px"
  style:left="{left}px"
  style:top="{top}px"
  style:background-color={backgroundColor}
  on:click={handleClick}
>
  {#if showWumpus}
    <WumpusSprite />
  {:else}
    {#if value}
      <span class="value">{value}</span>
    {/if}
  {/if}
</button>

<style>
  button.hex-cell {
    position: absolute;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    /* shape into hexagon */
    clip-path: polygon(
      50% 0%,
      100% 25%,
      100% 75%,
      50% 100%,
      0% 75%,
      0% 25%
    );
    user-select: none;
    transition: background-color 0.2s ease;
  }

  .value {
    font-weight: bold;
    color: var(--text-primary, #333);
    user-select: none;
  }
</style>

