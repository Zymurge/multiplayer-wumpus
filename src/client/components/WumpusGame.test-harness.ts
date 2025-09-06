import { render, fireEvent } from '@testing-library/svelte';
import { expect } from 'vitest';
import { get } from 'svelte/store';
import WumpusGame from './WumpusGame.svelte';
import { gameStore, type GameStoreState } from './gameStore.ts';

export type Action =
  | { type: 'clickCell'; x: number; y: number }
  | { type: 'clickButton'; label: string };

export type HarnessConfig = {
  preState: GameStoreState;
  actions: Action[];
  expectStore?: Partial<GameStoreState>;
  expectText?: string[];
  expectTestIds?: string[];
};

export async function runWumpusHarness(config: HarnessConfig) {
  // Set up initial state
  gameStore.set(config.preState);

  // Render the component
  const utils = render(WumpusGame);

  // Perform actions
  for (const action of config.actions) {
    if (action.type === 'clickCell') {
      const cell = utils.getByTestId(`cell-${action.x}-${action.y}`);
      await fireEvent.click(cell);
    } else if (action.type === 'clickButton') {
      const btn = utils.getByTestId(action.label);
      await fireEvent.click(btn);
    }
  }

  // Validate store state
  if (config.expectStore) {
    const value = get(gameStore);
    for (const key of Object.keys(config.expectStore)) {
      expect(value[key as keyof GameStoreState]).toEqual(
        config.expectStore[key as keyof GameStoreState]
      );
    }
  }

  // Validate UI text
  if (config.expectText) {
    for (const text of config.expectText) {
      expect(utils.getByText(text)).toBeTruthy();
    }
  }

  // Validate elements by test ids
  if (config.expectTestIds) {
    for (const id of config.expectTestIds) {
      expect(utils.getByTestId(id)).toBeTruthy();
    }
  }

  return utils;
}
