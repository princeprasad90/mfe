/**
 * @mfe/platform-core — HttpInterceptor
 *
 * Types for request/response interceptors used by ApiClient.
 */

export interface RequestConfig {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  params?: Record<string, string | number | boolean>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  ok: boolean;
}

export interface ApiError {
  status: number;
  statusText: string;
  message: string;
  data?: unknown;
}

export interface HttpInterceptor {
  /** Modify the request config before it is sent. */
  onRequest?(config: RequestConfig): RequestConfig | Promise<RequestConfig>;
  /** Modify the response after it arrives. */
  onResponse?<T>(
    response: ApiResponse<T>,
  ): ApiResponse<T> | Promise<ApiResponse<T>>;
  /** Handle errors (e.g. redirect on 401). */
  onError?(error: ApiError): void | Promise<void>;
}

// ── Built-in interceptors ────────────────────────────────────────────────────

/**
 * Redirects to the login page when the server returns 401 Unauthorized.
 */
export function createAuthRedirectInterceptor(
  loginUrl = "/login",
): HttpInterceptor {
  return {
    onError(error: ApiError) {
      if (error.status === 401) {
        window.location.href = loginUrl;
      }
    },
  };
}

/**
 * Logs requests and responses to the console in development.
 */
export function createLoggingInterceptor(): HttpInterceptor {
  return {
    onRequest(config) {
      console.log(`[HTTP] → ${config.method} ${config.url}`);
      return config;
    },
    onResponse(response) {
      console.log(`[HTTP] ← ${response.status} ${response.statusText}`);
      return response;
    },
    onError(error) {
      console.error(`[HTTP] ✗ ${error.status} ${error.message}`);
    },
  };
}
