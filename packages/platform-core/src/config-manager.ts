/**
 * @mfe/platform-core — ConfigManager
 *
 * Runtime configuration manager.
 * The Shell loads config once (from /config.json or env vars) and makes it
 * available to every MFE via `configManager.get("key")`.
 */

type ConfigValue = string | number | boolean | null | Record<string, unknown>;

export class ConfigManager {
  private config = new Map<string, ConfigValue>();
  private loaded = false;

  /** Bulk-set configuration (called by Shell at startup). */
  load(entries: Record<string, ConfigValue>): void {
    for (const [key, value] of Object.entries(entries)) {
      this.config.set(key, value);
    }
    this.loaded = true;
  }

  /** Get a typed config value. */
  get<T extends ConfigValue = string>(key: string, fallback?: T): T {
    if (this.config.has(key)) return this.config.get(key) as T;
    if (fallback !== undefined) return fallback;
    throw new Error(`[ConfigManager] Missing config key: "${key}"`);
  }

  /** Set a single config value at runtime. */
  set(key: string, value: ConfigValue): void {
    this.config.set(key, value);
  }

  /** Whether config has been loaded at least once. */
  get isLoaded(): boolean {
    return this.loaded;
  }

  /** Return all config as a plain object (for debugging). */
  toJSON(): Record<string, ConfigValue> {
    return Object.fromEntries(this.config);
  }
}

/** Singleton instance. */
export const configManager = new ConfigManager();
