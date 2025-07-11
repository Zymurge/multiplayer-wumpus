<!-- src/lib/components/HexCell.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import WumpusSprite from './WumpusSprite.svelte';

  export let x: number;
  export let y: number;
  export let value: string = '';
  export let backgroundColor: string = '#333';
  export let showWumpus: boolean = false;
  export let size: number = 80;

  const dispatch = createEventDispatcher<{ click: { x: number; y: number } }>();

  // hex metrics for pointy-top even-q
  //const height = Math.sqrt(3) / 2 * size;
  const height = 1.03 * size;
  const padding = 2
  $: left = x * size + (y % 2 === 1 ? size * 0.5 : 0) + x * padding;
  $: top  = y * (height * 0.73) + (y * padding);

  function handleClick() {
    dispatch('click', { x, y });
  }
</script>

<button
  class="hex-cell"
  style="
    width: {size}px;
    height: {height}px;
    left: {left}px;
    top: {top}px;
    background-color: {backgroundColor};
  "
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
    box-sizing: border-box;        /* include borders in width/height */
    border: 2px solid #b5e6cd;        /* visualize the edges */
    padding: 0;
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
    color: #333;
    user-select: none;
  }
</style>

