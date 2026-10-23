const memoryStorage = {};
let storageAdapter = null;

function resolveStorage() {
  if (storageAdapter) return storageAdapter;

  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  if (typeof globalThis !== "undefined" && globalThis.localStorage) {
    return globalThis.localStorage;
  }

  return memoryStorage;
}

export function setStorageAdapter(adapter) {
  storageAdapter = adapter || null;
}

export function getStorageAdapter() {
  return resolveStorage();
}

function readStorage(key) {
  const storage = resolveStorage();
  if (!storage) return null;

  try {
    return typeof storage.getItem === "function" ? storage.getItem(key) : storage[key] ?? null;
  } catch {
    return null;
  }
}

async function writeStorage(key, value) {
  const storage = resolveStorage();
  if (!storage) return;

  try {
    if (typeof storage.setItem === "function") {
      const result = storage.setItem(key, value);
      if (result && typeof result.then === "function") {
        await result;
      }
      return;
    }

    storage[key] = value;
  } catch {
    // ignore write failures for non-browser or locked storage
  }
}

async function removeStorage(key) {
  const storage = resolveStorage();
  if (!storage) return;

  try {
    if (typeof storage.removeItem === "function") {
      const result = storage.removeItem(key);
      if (result && typeof result.then === "function") {
        await result;
      }
      return;
    }

    delete storage[key];
  } catch {
    // ignore cleanup failures
  }
}

export async function saveAuthSession(token, user) {
  if (token) {
    await writeStorage("seis_token", token);
  }

  if (user) {
    await writeStorage("seis_user", JSON.stringify(user));
  }
}

export async function clearAuthSession() {
  await removeStorage("seis_token");
  await removeStorage("seis_user");
}

export function getToken() {
  return readStorage("seis_token");
}

export function getStoredUser() {
  const raw = readStorage("seis_user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function hasValidSession() {
  return Boolean(getToken());
}
