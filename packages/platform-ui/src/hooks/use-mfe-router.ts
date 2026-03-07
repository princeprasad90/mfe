/**
 * @mfe/platform-ui — useMfeRouter
 *
 * React hook that eliminates the manual popstate listener + regex route
 * parsing pattern repeated in every MFE app component.
 *
 * @example
 * ```tsx
 * const { route, navigate, buildPath } = useMfeRouter({
 *   basePath: '/cbms',
 *   routes: [
 *     { pattern: '/create', name: 'create' },
 *     { pattern: '/details/:id', name: 'detail', params: { id: 'number' } },
 *     { pattern: '/', name: 'list', query: { page: 'number' } },
 *   ],
 * });
 *
 * // route.name === 'detail', route.params.id === 42
 * // navigate(buildPath('list', {}, { page: 2 }));
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  createRouteMatcher,
  type RouteDef,
  type MatchedRoute,
  type RouteMatcher,
} from "@mfe/platform-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseMfeRouterOptions<TName extends string = string> {
  /** The base path the shell mounts this MFE at (e.g. '/cbms') */
  basePath?: string;
  /** Declarative route table — see createRouteMatcher */
  routes?: RouteDef<TName>[];
}

export interface UseMfeRouterReturn<TName extends string = string> {
  /** Navigate to a path (pushState + dispatch popstate) */
  navigate: (path: string) => void;
  /** Go back in browser history */
  goBack: () => void;
  /** Current pathname */
  pathname: string;
  /** Current search string (including '?') */
  search: string;
  /** Current matched route (if routes were provided) */
  route: MatchedRoute<TName>;
  /** Build a URL from route name + params + query. Prepends basePath. */
  buildPath: (
    name: TName,
    params?: Record<string, string | number>,
    query?: Record<string, string | number>,
  ) => string;
  /** The MFE base path */
  basePath: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMfeRouter<TName extends string = string>(
  options: UseMfeRouterOptions<TName> = {},
): UseMfeRouterReturn<TName> {
  const { basePath = "/" } = options;

  // ── Track current location ───────────────────────────────────────────────
  const [location, setLocation] = useState({
    pathname: window.location.pathname,
    search: window.location.search,
  });

  useEffect(() => {
    const onNav = () => {
      setLocation({
        pathname: window.location.pathname,
        search: window.location.search,
      });
    };
    window.addEventListener("popstate", onNav);
    return () => window.removeEventListener("popstate", onNav);
  }, []);

  // ── Navigation helpers ───────────────────────────────────────────────────
  const navigate = useCallback(
    (path: string) => {
      // If already a full path (starts with /), use it directly
      // Otherwise, prepend basePath
      const fullPath = path.startsWith("/")
        ? path
        : `${basePath.replace(/\/$/, "")}/${path}`;
      window.history.pushState({}, "", fullPath);
      window.dispatchEvent(new PopStateEvent("popstate"));
    },
    [basePath],
  );

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  // ── Route matcher (memoized) ─────────────────────────────────────────────
  const matcher = useMemo<RouteMatcher<TName> | null>(() => {
    if (!options.routes || options.routes.length === 0) return null;
    return createRouteMatcher(options.routes);
    // Routes array identity is typically stable (const at module level)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Current route ────────────────────────────────────────────────────────
  const route = useMemo<MatchedRoute<TName>>(() => {
    if (!matcher) {
      return { name: "" as TName, params: {}, query: {} };
    }
    return matcher(location.pathname, location.search);
  }, [matcher, location.pathname, location.search]);

  // ── buildPath (prepends basePath to the relative path) ───────────────────
  const buildPath = useCallback(
    (
      name: TName,
      params?: Record<string, string | number>,
      query?: Record<string, string | number>,
    ): string => {
      if (!matcher) return basePath;
      const relative = matcher.buildPath(name, params, query);
      const base = basePath.replace(/\/$/, "");
      return relative === "/" ? base || "/" : `${base}${relative}`;
    },
    [matcher, basePath],
  );

  return {
    navigate,
    goBack,
    pathname: location.pathname,
    search: location.search,
    route,
    buildPath,
    basePath,
  };
}
