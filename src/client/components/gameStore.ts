import { writable } from 'svelte/store';
import type { GameState, ErrorInfo } from '../../shared/types.ts';

// The shape of the store: either a game state or an error
export type GameStoreState = {
  state: GameState | null;
  error: ErrorInfo | null;
};

// Initial state: no game, no error
const initialState: GameStoreState = {
  state: null,
  error: null
};

export const gameStore = writable<GameStoreState>(initialState);

// Helper to update the store from a handler result
export function setGameStore(result: { state?: GameState; error?: ErrorInfo }) {
  gameStore.set({
    state: result.state ?? null,
    error: result.error ?? null
  });
}
