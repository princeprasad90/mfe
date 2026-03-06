/**
 * @mfe/platform-core — ApiClient
 *
 * Thin HTTP client that every MFE uses to call its BFF.
 * Built on top of fetch with interceptors, automatic JSON, auth header
 * injection, and error normalisation.
 */

import type {
  HttpInterceptor,
  RequestConfig,
  ApiResponse,
  ApiError,
} from "./http-interceptor";
import { tokenManager } from "./token-manager";

export interface ApiClientOptions {
  /** Base URL for all requests (e.g. "https://api.heydaygift.com") */
  baseUrl: string;
  /** Default headers merged into every request */
  defaultHeaders?: Record<string, string>;
  /** Request/response interceptors */
  interceptors?: HttpInterceptor[];
  /** Timeout in ms (default 30 000) */
  timeout?: number;
  /** Include cookies (default true — needed for HttpOnly JWT) */
  withCredentials?: boolean;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private interceptors: HttpInterceptor[];
  private timeout: number;
  private withCredentials: boolean;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.defaultHeaders,
    };
    this.interceptors = options.interceptors ?? [];
    this.timeout = options.timeout ?? 30_000;
    this.withCredentials = options.withCredentials ?? true;
  }

  // ── Public HTTP methods ─────────────────────────────────────────────────

  async get<T = unknown>(
    url: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  async post<T = unknown>(
    url: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "POST", url, body });
  }

  async put<T = unknown>(
    url: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "PUT", url, body });
  }

  async patch<T = unknown>(
    url: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "PATCH", url, body });
  }

  async delete<T = unknown>(
    url: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }

  // ── Core request ────────────────────────────────────────────────────────

  private async request<T>(
    config: RequestConfig & { method: string; url: string; body?: unknown },
  ): Promise<ApiResponse<T>> {
    let mergedConfig: RequestConfig = {
      ...config,
      headers: { ...this.defaultHeaders, ...config.headers },
    };

    // Run request interceptors
    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        mergedConfig = await interceptor.onRequest(mergedConfig);
      }
    }

    // Inject auth token if available
    const token = tokenManager.getAccessToken();
    if (token && mergedConfig.headers) {
      mergedConfig.headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const fetchUrl = `${this.baseUrl}${config.url.startsWith("/") ? "" : "/"}${config.url}`;
      const fetchInit: RequestInit = {
        method: config.method,
        headers: mergedConfig.headers,
        signal: mergedConfig.signal ?? controller.signal,
        credentials: this.withCredentials ? "include" : "same-origin",
      };

      if (config.body !== undefined && config.body !== null) {
        fetchInit.body =
          typeof config.body === "string"
            ? config.body
            : JSON.stringify(config.body);
      }

      const response = await fetch(fetchUrl, fetchInit);
      clearTimeout(timeoutId);

      let data: T | undefined;
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        data = (await response.json()) as T;
      }

      let result: ApiResponse<T> = {
        data: data as T,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok,
      };

      // Run response interceptors
      for (const interceptor of this.interceptors) {
        if (interceptor.onResponse) {
          result = await interceptor.onResponse(result);
        }
      }

      if (!response.ok) {
        const apiError: ApiError = {
          status: response.status,
          statusText: response.statusText,
          message: (data as any)?.message ?? response.statusText,
          data,
        };

        // Run error interceptors
        for (const interceptor of this.interceptors) {
          if (interceptor.onError) {
            await interceptor.onError(apiError);
          }
        }

        throw apiError;
      }

      return result;
    } catch (err) {
      clearTimeout(timeoutId);

      if ((err as any).status) throw err; // already an ApiError

      const apiError: ApiError = {
        status: 0,
        statusText: "Network Error",
        message:
          err instanceof Error
            ? err.message
            : "An unknown network error occurred",
      };

      for (const interceptor of this.interceptors) {
        if (interceptor.onError) {
          await interceptor.onError(apiError);
        }
      }

      throw apiError;
    }
  }
}
