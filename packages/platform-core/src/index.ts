/**
 * @mfe/platform-core
 *
 * Core frontend infrastructure shared across all MFEs.
 * Provides ApiClient, AuthManager, TokenManager, HttpInterceptor,
 * ConfigManager and ErrorHandler.
 */

// ── ApiClient ─────────────────────────────────────────────────────────────────
export { ApiClient } from "./api-client";
export type { ApiClientOptions } from "./api-client";

// ── HttpInterceptor ───────────────────────────────────────────────────────────
export type {
  RequestConfig,
  ApiResponse,
  ApiError,
  HttpInterceptor,
} from "./http-interceptor";
export {
  createAuthRedirectInterceptor,
  createLoggingInterceptor,
} from "./http-interceptor";

// ── TokenManager ──────────────────────────────────────────────────────────────
export { TokenManager, tokenManager } from "./token-manager";
export type { DecodedToken } from "./token-manager";

// ── AuthManager ───────────────────────────────────────────────────────────────
export { AuthManager, authManager } from "./auth-manager";
export type { AuthUser, AuthState } from "./auth-manager";

// ── ConfigManager ─────────────────────────────────────────────────────────────
export { ConfigManager, configManager } from "./config-manager";

// ── ErrorHandler ──────────────────────────────────────────────────────────────
export { ErrorHandler, errorHandler, consoleReporter } from "./error-handler";
export type {
  PlatformError,
  ErrorSeverity,
  ErrorReporter,
} from "./error-handler";
