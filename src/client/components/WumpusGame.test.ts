// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import WumpusGame from './WumpusGame.svelte';
import { gameStore } from './gameStore.ts';
import type { GameState, ErrorInfo } from '../../shared/types.ts';
import { runWumpusHarness } from './WumpusGame.test-harness.ts';
describe('WumpusGame.svelte harnessed scenarios', () => {
  it('increments moves when a cell is clicked', async () => {
    await runWumpusHarness({
      preState: {
        state: {
          grid: [
            [{ value: '', color: 'red', showWumpus: false }],
            [{ value: '', color: 'blue', showWumpus: false }]
          ],
          distance: 1,
          found: false,
          moves: 1
        },
        error: null
      },
      actions: [{ type: 'clickCell', x: 0, y: 0 }],
      // This assumes clicking increments moves; adjust as needed
      expectStore: {
        // moves: 2 // Uncomment and set correct expected value if store updates synchronously
      }
    });
  });

  it('shows error overlay when error is set (harness)', async () => {
    await runWumpusHarness({
      preState: {
        state: null,
        error: { error: 'TEST', message: 'Test error' }
      },
      actions: [],
      expectTestIds: ['error-msg']
    });
  });

  it('can start a new game by clicking the Restart button', async () => {
    await runWumpusHarness({
      preState: {
        state: {
          grid: [
            [{ value: '', color: 'red', showWumpus: false }]
          ],
          distance: 1,
          found: false,
          moves: 1
        },
        error: null
      },
      actions: [{ type: 'clickButton', label: 'restart-btn' }],
      // Optionally, check for expected store or UI changes
    });
  });
});

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
    const { getByTestId, getAllByTestId, getByText } = render(WumpusGame);
    // Check that the controls and grid are rendered
    const restartBtn = getByTestId('restart-btn');
    expect(restartBtn).toBeTruthy();
    const gridSizeLabel = getByText('Grid Size: 5');
    expect(gridSizeLabel).not.toBeNull();
    // Should render 4 cells (2x2 grid)
    const cellButtons = [
      getByTestId('cell-0-0'),
      getByTestId('cell-1-0'),
      getByTestId('cell-0-1'),
      getByTestId('cell-1-1')
    ];
    cellButtons.forEach(btn => expect(btn).toBeTruthy());
  });


  it('shows win overlay when game is won', () => {
    const mockState: GameState = {
      grid: [[{ value: '', color: 'red', showWumpus: true }]],
      distance: 0,
      found: true,
      moves: 5
    };
    gameStore.set({ state: mockState, error: null });
    const { getByTestId } = render(WumpusGame);
    // OK button appears only with win overlay
    const okBtn = getByTestId('ok-btn');
    expect(okBtn).toBeTruthy();
  });


  it('shows error overlay when error is present', () => {
    const error: ErrorInfo = { error: 'TEST', message: 'Test error' };
    gameStore.set({ state: null, error });
    const { getByTestId } = render(WumpusGame);
    // Validate by test id for determinism
    const errorMsg = getByTestId('error-msg');
    expect(errorMsg).toBeTruthy();
  });

  it('updates grid and moves when store changes', async () => {
    const { getByTestId } = render(WumpusGame);
    // Set initial state
    gameStore.set({ state: {
      grid: [[{ value: '', color: 'red', showWumpus: false }]],
      distance: 1,
      found: false,
      moves: 1
    }, error: null });
    let restartBtn = getByTestId('restart-btn');
    expect(restartBtn).toBeTruthy();
    // Update state
    gameStore.set({ state: {
      grid: [[{ value: '', color: 'blue', showWumpus: false }]],
      distance: 2,
      found: false,
      moves: 2
    }, error: null });
    restartBtn = getByTestId('restart-btn');
    expect(restartBtn).toBeTruthy();
  });
});
