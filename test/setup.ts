import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Reset the DOM + persisted store between tests for isolation.
afterEach(() => {
  cleanup();
  try {
    localStorage.clear();
  } catch {
    /* jsdom may not expose localStorage in every environment */
  }
});

// jsdom doesn't implement these APIs used by the components under test.
if (!('IntersectionObserver' in globalThis)) {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  // @ts-expect-error - assigning a minimal mock for tests
  globalThis.IntersectionObserver = MockIntersectionObserver;
}

if (!('matchMedia' in window)) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
