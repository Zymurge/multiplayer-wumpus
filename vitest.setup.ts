import { expect, afterEach } from 'vitest';
import matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/svelte';

// Only extend if expect is defined (i.e., in jsdom environment)
if (typeof expect !== 'undefined' && typeof matchers !== 'undefined') {
  expect.extend(matchers);
}

// Ensure we clean up the DOM between tests to avoid duplicate elements
afterEach(() => {
  cleanup();
});