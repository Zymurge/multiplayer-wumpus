<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import WumpusSprite from './WumpusSprite.svelte';
	
	export let x: number;
	export let y: number;
	export let value: string = '';
	export let backgroundColor: string = '#333';
	export let showWumpus: boolean = false;
	
	const dispatch = createEventDispatcher();
	
	function handleClick() {
		dispatch('click', { x, y });
	}
</script>

<button 
	class="square" 
	class:wumpus-found={showWumpus}
	style="background-color: {backgroundColor};" 
	on:click={handleClick}
>
	{#if showWumpus}
		<WumpusSprite />
	{:else}
		{value}
	{/if}
</button>

<style>
	.square {
		width: 40px;
		height: 40px;
		border: 1px solid #999;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 14px;
		color: white;
		text-shadow: 1px 1px 2px black;
		transition: all 0.2s ease;
		outline: none !important;
	}

	.square:hover {
		border-color: #fff;
		transform: scale(1.05);
	}

	.square:active {
		transform: scale(0.95);
	}

	.square:focus:not(.wumpus-found) {
		outline: none !important;
		border-color: #999 !important;
		box-shadow: none;
	}
	
	.square:focus-visible:not(.wumpus-found) {
		outline: none !important;
		border-color: #999 !important;
		box-shadow: none;
	}

	.wumpus-found {
		box-shadow: 0 0 20px #FFD700, 0 0 30px #FFD700, 0 0 40px #FFD700 !important;
		border: 2px solid #FFD700 !important;
		animation: pulse 2s infinite;
		z-index: 5;
		position: relative;
	}

	@keyframes pulse {
		0% { box-shadow: 0 0 20px #FFD700, 0 0 30px #FFD700, 0 0 40px #FFD700 !important; }
		50% { box-shadow: 0 0 30px #FFD700, 0 0 40px #FFD700, 0 0 60px #FFD700 !important; }
		100% { box-shadow: 0 0 20px #FFD700, 0 0 30px #FFD700, 0 0 40px #FFD700 !important; }
	}
</style>
