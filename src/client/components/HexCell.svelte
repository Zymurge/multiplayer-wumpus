<!-- src/lib/components/HexCell.svelte -->
<!-- <script context="module">
  export const HEXSIZE: number = 80;
  // hex metrics for pointy-top even-q
  export const HEXHEIGHT = 2 * HEXSIZE / Math.sqrt(3);
  //export const HEXHEIGHT = 1.15 * HEXSIZE;
</script> -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import WumpusSprite from './WumpusSprite.svelte';
  import { COLORS } from '@shared/colors.js';

  export let x: number;
  export let y: number;
  export let value: string = '';
  export let backgroundColor: string = COLORS.unclicked;
  export let showWumpus: boolean = false;
  export let hexSize: number;

  const dispatch = createEventDispatcher<{ click: { x: number; y: number } }>();

  const xPad = 0
  const yPad = 2; // slight vertical padding for better click area

    // Calculate hexHeight dynamically based on hexSize
  $: hexHeight = 2 * hexSize / Math.sqrt(3);

  // Calculate the position based on hex grid layout
  $: left = x * hexSize + (y % 2 === 1 ? hexSize * 0.5 : 0) + x * xPad;
  $: top  = y * (hexHeight * 0.75) + (y * yPad);

  function handleClick() {
    dispatch('click', { x, y });
  }
</script>

<button
  class="hex-cell"
  data-testid={`cell-${x}-${y}`}
  style:width="{hexSize}px"
  style:height="{hexHeight}px"
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

