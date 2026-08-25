import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// mock localStorage for tests
const store = {};
global.localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};

// suppress console error for expected 403 tests
vi.stubGlobal("fetch", vi.fn());
