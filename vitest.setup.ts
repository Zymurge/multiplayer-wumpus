import { expect } from 'vitest';
import matchers from '@testing-library/jest-dom/matchers';

// Only extend if expect is defined (i.e., in jsdom environment)
if (typeof expect !== 'undefined' && typeof matchers !== 'undefined') {
  expect.extend(matchers);
}