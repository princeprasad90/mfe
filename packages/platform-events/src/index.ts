/**
 * @mfe/platform-events
 *
 * Centralised event bus for cross-MFE communication.
 * The Shell creates one EventBus instance and injects `emitEvent` / `onEvent`
 * into every MFE via mount() props so MFEs stay decoupled and testable.
 *
 * Features:
 *  - Type-safe emit / on / off
 *  - Replay: stores the last payload per event name so a newly-mounted MFE
 *    can receive events emitted while it was off-screen.
 *  - Wildcard listeners via "*" (for logging / debugging)
 *  - Namespace convention: "<mfe>:<domain>:<action>" e.g. "cbms:payment:approved"
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type EventHandler<T = unknown> = (detail: T) => void;
export type UnsubscribeFn = () => void;

export interface IEventBus {
  emit<T = unknown>(event: string, detail: T): void;
  on<T = unknown>(event: string, handler: EventHandler<T>): UnsubscribeFn;
  off(event: string, handler: EventHandler): void;
  clear(event?: string): void;
}

// ── Well-known shell events ──────────────────────────────────────────────────

export const SHELL_EVENTS = {
  /** Shell notification toast */
  NOTIFICATION: "mfe:notification",
  /** Global loader start (key-based) */
  LOADING_START: "mfe:loading:start",
  /** Global loader stop (key-based) */
  LOADING_STOP: "mfe:loading:stop",
  /** Shell route changed */
  ROUTE_CHANGED: "shell:route:changed",
  /** User session expired / logged out */
  SESSION_EXPIRED: "shell:session:expired",
} as const;

// ── EventBus implementation ──────────────────────────────────────────────────

export class EventBus implements IEventBus {
  /** Registered listeners per event name ("*" = wildcard). */
  private listeners = new Map<string, Set<EventHandler<any>>>();

  /** Last emitted payload per event name — used for replay. */
  private lastPayloads = new Map<string, unknown>();

  // ── emit ────────────────────────────────────────────────────────────────

  emit<T = unknown>(event: string, detail: T): void {
    this.lastPayloads.set(event, detail);

    // Fire specific listeners
    this.listeners.get(event)?.forEach((h) => {
      try {
        h(detail);
      } catch (err) {
        console.error(`[EventBus] Error in handler for "${event}":`, err);
      }
    });

    // Fire wildcard listeners
    this.listeners.get("*")?.forEach((h) => {
      try {
        h({ event, detail });
      } catch (err) {
        console.error(`[EventBus] Error in wildcard handler:`, err);
      }
    });

    // Also dispatch on window so legacy code / non-JS MFEs can listen
    window.dispatchEvent(new CustomEvent(event, { detail }));
  }

  // ── on (subscribe) ──────────────────────────────────────────────────────

  on<T = unknown>(event: string, handler: EventHandler<T>): UnsubscribeFn {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Replay last payload so a newly-mounted MFE doesn't miss it
    if (event !== "*" && this.lastPayloads.has(event)) {
      const payload = this.lastPayloads.get(event) as T;
      Promise.resolve().then(() => {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[EventBus] Error replaying "${event}":`, err);
        }
      });
    }

    return () => this.off(event, handler);
  }

  // ── off (unsubscribe) ───────────────────────────────────────────────────

  off(event: string, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  // ── clear ───────────────────────────────────────────────────────────────

  /** Clear listeners (and replay cache) for one event or all events. */
  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      this.lastPayloads.delete(event);
    } else {
      this.listeners.clear();
      this.lastPayloads.clear();
    }
  }
}

// ── Singleton ────────────────────────────────────────────────────────────────

/** Default global instance — the Shell should import this and inject emit/on. */
export const eventBus = new EventBus();

// ── Convenience helpers (bound to singleton) ─────────────────────────────────

/** Emit a typed event on the platform bus. */
export const emitEvent = <T = unknown>(event: string, detail: T): void =>
  eventBus.emit(event, detail);

/** Subscribe to a typed event. Returns an unsubscribe function. */
export const onEvent = <T = unknown>(
  event: string,
  handler: EventHandler<T>,
): UnsubscribeFn => eventBus.on(event, handler);

// ── Shell notification helpers (re-exported for convenience) ─────────────────

export type NotifyPayload = {
  title: string;
  message: string;
  variant?: "info" | "success" | "warning" | "error";
  duration?: number;
};

export const shellNotify = (payload: NotifyPayload): void =>
  eventBus.emit(SHELL_EVENTS.NOTIFICATION, {
    type: payload.variant ?? "info",
    title: payload.title,
    message: payload.message,
    duration: payload.duration ?? 4000,
  });

export const showLoader = (key = "default"): void =>
  eventBus.emit(SHELL_EVENTS.LOADING_START, { key });

export const hideLoader = (key = "default"): void =>
  eventBus.emit(SHELL_EVENTS.LOADING_STOP, { key });
