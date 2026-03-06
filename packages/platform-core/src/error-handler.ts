/**
 * @mfe/platform-core — ErrorHandler
 *
 * Centralised, pluggable error handler for the platform.
 * MFEs call `errorHandler.handle(err)` instead of littering try/catch logic.
 * The Shell can attach reporters (console, Sentry, shell-toast, etc.).
 */

import { emitEvent, SHELL_EVENTS } from "@mfe/platform-events";

export type ErrorSeverity = "info" | "warning" | "error" | "fatal";

export interface PlatformError {
  message: string;
  severity: ErrorSeverity;
  source?: string;
  code?: string;
  originalError?: unknown;
  timestamp: number;
}

export type ErrorReporter = (error: PlatformError) => void | Promise<void>;

export class ErrorHandler {
  private reporters: ErrorReporter[] = [];

  /** Register a reporter (e.g. Sentry, console logger, toast). */
  addReporter(reporter: ErrorReporter): () => void {
    this.reporters.push(reporter);
    return () => {
      this.reporters = this.reporters.filter((r) => r !== reporter);
    };
  }

  /** Handle an error — normalise it, run reporters, optionally show toast. */
  handle(
    err: unknown,
    options?: { severity?: ErrorSeverity; source?: string; silent?: boolean },
  ): PlatformError {
    const platformError = this.normalise(
      err,
      options?.severity,
      options?.source,
    );

    // Run all reporters
    for (const reporter of this.reporters) {
      try {
        reporter(platformError);
      } catch (reporterErr) {
        console.error("[ErrorHandler] Reporter failed:", reporterErr);
      }
    }

    // Show a shell toast unless silent
    if (!options?.silent) {
      emitEvent(SHELL_EVENTS.NOTIFICATION, {
        type: platformError.severity === "info" ? "info" : "error",
        title: platformError.severity === "fatal" ? "Critical Error" : "Error",
        message: platformError.message,
        duration: platformError.severity === "fatal" ? 0 : 4000,
      });
    }

    return platformError;
  }

  /** Normalise any thrown value into a PlatformError. */
  private normalise(
    err: unknown,
    severity: ErrorSeverity = "error",
    source?: string,
  ): PlatformError {
    if (err instanceof Error) {
      return {
        message: err.message,
        severity,
        source,
        originalError: err,
        timestamp: Date.now(),
      };
    }

    if (typeof err === "object" && err !== null && "message" in err) {
      return {
        message: String((err as any).message),
        severity,
        source,
        code: (err as any).code ?? (err as any).status?.toString(),
        originalError: err,
        timestamp: Date.now(),
      };
    }

    return {
      message: String(err),
      severity,
      source,
      originalError: err,
      timestamp: Date.now(),
    };
  }
}

/** Singleton instance. */
export const errorHandler = new ErrorHandler();

// ── Built-in reporters ───────────────────────────────────────────────────────

/** Logs all errors to the console. */
export const consoleReporter: ErrorReporter = (error) => {
  const tag = `[${error.severity.toUpperCase()}]${error.source ? ` (${error.source})` : ""}`;
  if (error.severity === "fatal" || error.severity === "error") {
    console.error(tag, error.message, error.originalError);
  } else if (error.severity === "warning") {
    console.warn(tag, error.message);
  } else {
    console.info(tag, error.message);
  }
};
