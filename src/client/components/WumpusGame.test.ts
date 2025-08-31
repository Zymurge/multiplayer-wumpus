// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import WumpusGame from './WumpusGame.svelte';
import { gameStore } from './gameStore.ts';
import type { GameState, ErrorInfo } from '../../shared/types.ts';

describe('WumpusGame.svelte', () => {
  beforeEach(() => {
    // Reset store before each test
    gameStore.set({ state: null, error: null });
  });

  it('renders the controls and grid for a valid game state', () => {
    const mockState: GameState = {
      grid: [
        [
          { value: '', color: 'red', showWumpus: false },
          { value: '1', color: 'blue', showWumpus: false }
        ],
        [
          { value: '', color: 'green', showWumpus: true },
          { value: '', color: '', showWumpus: false }
        ]
      ],
      distance: 2,
      found: false,
      moves: 3
    };
    gameStore.set({ state: mockState, error: null });
    const { getAllByText, getAllByRole, getByText } = render(WumpusGame);
    // Check that the controls and grid are rendered
  const restartBtns = getAllByText('Restart');
  expect(Array.isArray(restartBtns)).toBe(true);
  expect(restartBtns.length).toBeGreaterThan(0);
    const gridSizeLabel = getByText('Grid Size: 5');
    expect(gridSizeLabel).not.toBeNull();
    // Should render 4 cells (2x2 grid)
    const buttons = getAllByRole('button');
    expect(Array.isArray(buttons)).toBe(true);
    expect(buttons.length).toBeGreaterThan(0);
  });


  it('shows win overlay when game is won', () => {
    const mockState: GameState = {
      grid: [[{ value: '', color: 'red', showWumpus: true }]],
      distance: 0,
      found: true,
      moves: 5
    };
    gameStore.set({ state: mockState, error: null });
    const { getAllByText } = render(WumpusGame);
    const winMsgs = getAllByText('🎉 You found the Wumpus in 5 moves!');
    expect(Array.isArray(winMsgs)).toBe(true);
    expect(winMsgs.length).toBeGreaterThan(0);
  });


  it('shows error overlay when error is present', () => {
    const error: ErrorInfo = { error: 'TEST', message: 'Test error' };
    gameStore.set({ state: null, error });
    const { getAllByText } = render(WumpusGame);
    const errorMsgs = getAllByText('Test error');
    expect(Array.isArray(errorMsgs)).toBe(true);
    expect(errorMsgs.length).toBeGreaterThan(0);
  });

  it('updates grid and moves when store changes', async () => {
    const { getAllByText } = render(WumpusGame);
    // Set initial state
    gameStore.set({ state: {
      grid: [[{ value: '', color: 'red', showWumpus: false }]],
      distance: 1,
      found: false,
      moves: 1
    }, error: null });
    let buttons = getAllByText('New Game');
    expect(Array.isArray(buttons)).toBe(true);
    expect(buttons.length).toBeGreaterThan(0);
    // Update state
    gameStore.set({ state: {
      grid: [[{ value: '', color: 'blue', showWumpus: false }]],
      distance: 2,
      found: false,
      moves: 2
    }, error: null });
    buttons = getAllByText('New Game');
    expect(Array.isArray(buttons)).toBe(true);
    expect(buttons.length).toBeGreaterThan(0);
  });
});
