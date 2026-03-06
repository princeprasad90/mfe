/**
 * @mfe/platform-utils — StorageUtils
 *
 * Safe wrappers around localStorage / sessionStorage with JSON serialisation,
 * expiry support, and key-prefix namespacing.
 */

type StorageType = "local" | "session";

function getStorage(type: StorageType): Storage {
  return type === "session" ? sessionStorage : localStorage;
}

// ── Basic get / set / remove ─────────────────────────────────────────────────

/** Read a value from storage, deserialised from JSON. Returns `fallback` on miss or error. */
export function storageGet<T = unknown>(
  key: string,
  fallback?: T,
  type: StorageType = "local",
): T | undefined {
  try {
    const raw = getStorage(type).getItem(key);
    if (raw === null) return fallback;

    const wrapper = JSON.parse(raw) as { value: T; expiresAt?: number };

    // Check expiry
    if (wrapper.expiresAt && Date.now() > wrapper.expiresAt) {
      getStorage(type).removeItem(key);
      return fallback;
    }

    return wrapper.value;
  } catch {
    return fallback;
  }
}

/** Write a value to storage, serialised as JSON. Optional TTL in milliseconds. */
export function storageSet<T = unknown>(
  key: string,
  value: T,
  options?: { ttl?: number; type?: StorageType },
): void {
  try {
    const wrapper: { value: T; expiresAt?: number } = { value };
    if (options?.ttl) {
      wrapper.expiresAt = Date.now() + options.ttl;
    }
    getStorage(options?.type ?? "local").setItem(key, JSON.stringify(wrapper));
  } catch (err) {
    console.warn("[StorageUtils] Failed to write:", key, err);
  }
}

/** Remove a key from storage. */
export function storageRemove(key: string, type: StorageType = "local"): void {
  try {
    getStorage(type).removeItem(key);
  } catch {
    /* silently ignore */
  }
}

/** Clear all keys that start with a prefix. */
export function storageClearByPrefix(
  prefix: string,
  type: StorageType = "local",
): void {
  try {
    const storage = getStorage(type);
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(prefix)) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => storage.removeItem(k));
  } catch {
    /* silently ignore */
  }
}

/** Check if a key exists and is not expired. */
export function storageHas(key: string, type: StorageType = "local"): boolean {
  return storageGet(key, undefined, type) !== undefined;
}
