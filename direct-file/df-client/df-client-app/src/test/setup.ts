// needed for expect matcher functions
import '@testing-library/jest-dom';

// happy-dom localStorage can be present but missing Storage methods in some CI environments.
if (typeof globalThis.localStorage === `undefined` || typeof globalThis.localStorage.getItem !== `function`) {
  let store: Record<string, string> = {};
  Object.defineProperty(globalThis, `localStorage`, {
    configurable: true,
    value: {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = String(value);
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    },
  });
}
