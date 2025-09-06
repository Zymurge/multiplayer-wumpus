import { get } from 'svelte/store';
import { describe, it, expect, beforeEach } from 'vitest';
import { gameStore, setGameStore, type GameStoreState } from './gameStore.ts';

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    gameStore.set({ state: null, error: null });
  });

  it('should initialize with null state and error', () => {
    const value = get(gameStore) as GameStoreState;
    expect(value).toEqual({ state: null, error: null });
  });

  it('should set state via setGameStore', () => {
    const mockState = { grid: [], distance: 0, found: false, moves: 0 };
    setGameStore({ state: mockState });
    const value = get(gameStore);
    expect(value.state).toEqual(mockState);
    expect(value.error).toBeNull();
  });

  it('should set error via setGameStore', () => {
    const mockError = { error: 'ERR', message: 'Something went wrong' };
    setGameStore({ error: mockError });
    const value = get(gameStore);
    expect(value.error).toEqual(mockError);
    expect(value.state).toBeNull();
  });

  it('should set both state and error to null if not provided', () => {
    setGameStore({});
    const value = get(gameStore);
    expect(value).toEqual({ state: null, error: null });
  });
});
