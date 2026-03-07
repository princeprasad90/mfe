/**
 * @mfe/platform-ui — useApi & useApiMutation
 *
 * React hooks for data fetching that eliminate the repeated
 * useState/useEffect/try-catch pattern from every MFE page.
 *
 * @example
 * ```tsx
 * // URL-based (real API)
 * const { data, loading, error, refetch } = useApi<Payment[]>('/api/payments', {
 *   query: { page, status },
 *   cacheKey: `payments-${page}`,
 * });
 *
 * // Fetcher-based (mock services / custom logic)
 * const { data, loading } = useApi<Payment[]>({
 *   fetcher: () => Promise.resolve(getPaymentsPage(page)),
 *   deps: [page],
 * });
 *
 * // Mutations
 * const { execute, loading: saving } = useApiMutation<PaymentInput, Payment>('/api/payments');
 * await execute({ customer: 'Acme', amount: 100 });
 * ```
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Simple in-memory cache ──────────────────────────────────────────────────

const cache = new Map<string, { data: unknown; ts: number }>();

function getCached<T>(key: string, ttl: number): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > ttl) {
    cache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, ts: Date.now() });
}

/** Clear the API cache. Pass a prefix to clear only matching keys. */
export function clearApiCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) cache.delete(key);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUrl(
  url: string,
  query?: Record<string, string | number | boolean | undefined>,
): string {
  if (!query) return url;
  const entries = Object.entries(query).filter(
    ([, v]) => v !== undefined && v !== "",
  );
  if (!entries.length) return url;
  const qs = entries
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join("&");
  return `${url}${url.includes("?") ? "&" : "?"}${qs}`;
}

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries: number,
  delay: number,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseApiOptions<T = unknown> {
  /** HTTP method (default: "GET") */
  method?: string;
  /** Extra request headers */
  headers?: Record<string, string>;
  /** Request body (auto-serialized to JSON) */
  body?: unknown;
  /** Query parameters appended to URL */
  query?: Record<string, string | number | boolean | undefined>;
  /** Transform raw response before storing */
  transform?: (raw: unknown) => T;
  /** Fetch immediately on mount (default: true) */
  immediate?: boolean;
  /** Dependencies that trigger refetch when changed */
  deps?: unknown[];
  /** Cache key — enables in-memory caching */
  cacheKey?: string;
  /** Cache time-to-live in ms (default: 30000) */
  cacheTtl?: number;
  /** Number of retries on failure (default: 0) */
  retryCount?: number;
  /** Delay between retries in ms (default: 1000) */
  retryDelay?: number;
  /** Called on successful fetch */
  onSuccess?: (data: T) => void;
  /** Called on fetch error */
  onError?: (error: Error) => void;
}

export interface UseApiFetcherOptions<T = unknown> {
  /** Custom async function that returns data */
  fetcher: () => Promise<T>;
  /** Fetch immediately on mount (default: true) */
  immediate?: boolean;
  /** Dependencies that trigger refetch when changed */
  deps?: unknown[];
  /** Cache key */
  cacheKey?: string;
  /** Cache TTL in ms */
  cacheTtl?: number;
  /** Retries on failure */
  retryCount?: number;
  /** Retry delay in ms */
  retryDelay?: number;
  /** Called on success */
  onSuccess?: (data: T) => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

export interface UseApiReturn<T> {
  /** Fetched data (null until loaded) */
  data: T | null;
  /** Whether a request is in progress */
  loading: boolean;
  /** Error from the last request */
  error: Error | null;
  /** Manually trigger a refetch */
  refetch: () => Promise<void>;
  /** Optimistically update the local data */
  mutate: (data: T | null) => void;
}

// ─── useApi ───────────────────────────────────────────────────────────────────

export function useApi<T = unknown>(
  url: string,
  options?: UseApiOptions<T>,
): UseApiReturn<T>;
export function useApi<T = unknown>(
  options: UseApiFetcherOptions<T>,
): UseApiReturn<T>;
export function useApi<T = unknown>(
  urlOrOptions: string | UseApiFetcherOptions<T>,
  maybeOptions?: UseApiOptions<T>,
): UseApiReturn<T> {
  const isUrlBased = typeof urlOrOptions === "string";
  const url = isUrlBased ? urlOrOptions : undefined;
  const opts = isUrlBased
    ? (maybeOptions ?? ({} as UseApiOptions<T>))
    : urlOrOptions;

  const immediate = opts.immediate !== false;
  const deps = opts.deps ?? (url ? [url] : []);
  const retries = (opts as UseApiOptions<T>).retryCount ?? 0;
  const retryDelay = (opts as UseApiOptions<T>).retryDelay ?? 1000;
  const cacheKey = opts.cacheKey;
  const cacheTtl = opts.cacheTtl ?? 30_000;

  const [data, setData] = useState<T | null>(() => {
    if (cacheKey) {
      const cached = getCached<T>(cacheKey, cacheTtl);
      if (cached !== undefined) return cached;
    }
    return null;
  });
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const optsRef = useRef(opts);
  optsRef.current = opts;

  const doFetch = useCallback(async () => {
    const currentOpts = optsRef.current as UseApiOptions<T> &
      UseApiFetcherOptions<T>;

    // Check cache
    if (cacheKey) {
      const cached = getCached<T>(cacheKey, cacheTtl);
      if (cached !== undefined) {
        setData(cached);
        setLoading(false);
        currentOpts.onSuccess?.(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchWithRetry(
        async () => {
          // Fetcher-based
          if (
            "fetcher" in currentOpts &&
            typeof currentOpts.fetcher === "function"
          ) {
            return await currentOpts.fetcher();
          }

          // URL-based
          if (!url) throw new Error("useApi: no url or fetcher provided");
          const apiOpts = currentOpts as UseApiOptions<T>;
          const fullUrl = buildUrl(url, apiOpts.query);

          const init: RequestInit = {
            method: apiOpts.method ?? "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              ...apiOpts.headers,
            },
            credentials: "include",
          };

          if (apiOpts.body !== undefined) {
            init.body =
              typeof apiOpts.body === "string"
                ? apiOpts.body
                : JSON.stringify(apiOpts.body);
          }

          const res = await fetch(fullUrl, init);

          if (!res.ok) {
            const text = await res.text().catch(() => res.statusText);
            throw new Error(`HTTP ${res.status}: ${text}`);
          }

          const contentType = res.headers.get("content-type") ?? "";
          const raw = contentType.includes("json")
            ? await res.json()
            : await res.text();
          return apiOpts.transform ? apiOpts.transform(raw) : (raw as T);
        },
        retries,
        retryDelay,
      );

      setData(result);
      setLoading(false);
      if (cacheKey) setCache(cacheKey, result);
      currentOpts.onSuccess?.(result);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      setLoading(false);
      currentOpts.onError?.(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, cacheKey, cacheTtl, retries, retryDelay]);

  useEffect(() => {
    if (!immediate) return;
    doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, doFetch, ...deps]);

  const mutate = useCallback(
    (d: T | null) => {
      setData(d);
      if (cacheKey && d !== null) setCache(cacheKey, d);
    },
    [cacheKey],
  );

  return { data, loading, error, refetch: doFetch, mutate };
}

// ─── useApiMutation ───────────────────────────────────────────────────────────

export interface UseApiMutationOptions<TResult = unknown> {
  /** HTTP method (default: "POST") */
  method?: string;
  /** Extra request headers */
  headers?: Record<string, string>;
  /** Transform raw response */
  transform?: (raw: unknown) => TResult;
  /** Called on success */
  onSuccess?: (result: TResult) => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Show window.confirm before executing */
  confirm?: string;
}

export interface UseApiMutationReturn<TBody, TResult> {
  /** Execute the mutation. Pass body directly, or override URL + body. */
  execute: (
    urlOrBody?: string | TBody,
    body?: TBody,
  ) => Promise<TResult | undefined>;
  /** Whether the mutation is in progress */
  loading: boolean;
  /** Error from the last mutation */
  error: Error | null;
  /** Reset error + loading state */
  reset: () => void;
}

export function useApiMutation<TBody = unknown, TResult = unknown>(
  url: string,
  options?: UseApiMutationOptions<TResult>,
): UseApiMutationReturn<TBody, TResult>;
export function useApiMutation<TBody = unknown, TResult = unknown>(
  options: UseApiMutationOptions<TResult>,
): UseApiMutationReturn<TBody, TResult>;
export function useApiMutation<TBody = unknown, TResult = unknown>(
  urlOrOptions: string | UseApiMutationOptions<TResult>,
  maybeOptions?: UseApiMutationOptions<TResult>,
): UseApiMutationReturn<TBody, TResult> {
  const defaultUrl =
    typeof urlOrOptions === "string" ? urlOrOptions : undefined;
  const opts =
    typeof urlOrOptions === "string"
      ? (maybeOptions ?? ({} as UseApiMutationOptions<TResult>))
      : urlOrOptions;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const optsRef = useRef(opts);
  optsRef.current = opts;

  const execute = useCallback(
    async (
      urlOrBody?: string | TBody,
      body?: TBody,
    ): Promise<TResult | undefined> => {
      const currentOpts = optsRef.current;

      // Resolve URL and body
      let resolvedUrl = defaultUrl;
      let resolvedBody: TBody | undefined = body;

      if (typeof urlOrBody === "string") {
        resolvedUrl = urlOrBody;
      } else if (urlOrBody !== undefined) {
        resolvedBody = urlOrBody;
      }

      // Confirmation
      if (currentOpts.confirm) {
        const ok = window.confirm(currentOpts.confirm);
        if (!ok) return undefined;
      }

      setLoading(true);
      setError(null);

      try {
        if (!resolvedUrl) throw new Error("useApiMutation: no URL provided");

        const init: RequestInit = {
          method: currentOpts.method ?? "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...currentOpts.headers,
          },
          credentials: "include",
        };

        if (resolvedBody !== undefined) {
          init.body =
            typeof resolvedBody === "string"
              ? resolvedBody
              : JSON.stringify(resolvedBody);
        }

        const res = await fetch(resolvedUrl, init);

        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText);
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const contentType = res.headers.get("content-type") ?? "";
        const raw: unknown = contentType.includes("json")
          ? await res.json()
          : await res.text();

        const result = currentOpts.transform
          ? currentOpts.transform(raw)
          : (raw as TResult);

        setLoading(false);
        currentOpts.onSuccess?.(result);
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        setLoading(false);
        currentOpts.onError?.(e);
        throw e;
      }
    },
    [defaultUrl],
  );

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { execute, loading, error, reset };
}
