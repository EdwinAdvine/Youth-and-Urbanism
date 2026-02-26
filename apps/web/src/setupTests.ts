import '@testing-library/jest-dom';

// Provide a minimal matchMedia mock for jsdom environments.
// Several stores (e.g. useThemeStore) register media-query listeners at
// module-level, which fail without this stub.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
