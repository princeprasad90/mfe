/**
 * @mfe/platform-utils — Route Matcher
 *
 * Declarative route definition and matching for MFEs.
 * Replaces manual if/else + regex route parsing with a simple route table.
 *
 * @example
 * ```ts
 * const matcher = createRouteMatcher([
 *   { pattern: '/create', name: 'create' },
 *   { pattern: '/details/:id', name: 'detail', params: { id: 'number' } },
 *   { pattern: '/', name: 'list', query: { page: 'number' } },
 * ]);
 *
 * const route = matcher('/cbms/details/42', '?page=2');
 * // { name: 'detail', params: { id: 42 }, query: {} }
 *
 * matcher.buildPath('detail', { id: 42 }, { page: 2 });
 * // '/details/42?page=2'
 * ```
 */

// ─── Public Types ─────────────────────────────────────────────────────────────

export type ParamType = "string" | "number";

export interface RouteDef<TName extends string = string> {
  /** URL pattern with :param placeholders, e.g. '/details/:id' */
  pattern: string;
  /** Route name — the discriminant in matched routes */
  name: TName;
  /** Param types for :param placeholders (default: "string") */
  params?: Record<string, ParamType>;
  /** Query params to extract automatically */
  query?: Record<string, ParamType>;
}

export interface MatchedRoute<TName extends string = string> {
  name: TName;
  params: Record<string, string | number>;
  query: Record<string, string | number>;
}

export interface RouteMatcher<TName extends string = string> {
  /** Match a pathname + search string against the route table */
  (pathname: string, search?: string): MatchedRoute<TName>;
  /** Build a URL from route name + params + query (reverse routing) */
  buildPath: (
    name: TName,
    params?: Record<string, string | number>,
    query?: Record<string, string | number>,
  ) => string;
  /** The original route definitions */
  routes: ReadonlyArray<RouteDef<TName>>;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

interface CompiledRoute<TName extends string> {
  def: RouteDef<TName>;
  regex: RegExp;
  paramNames: string[];
}

function compilePattern(pattern: string): {
  regex: RegExp;
  paramNames: string[];
} {
  const paramNames: string[] = [];
  // Escape special regex chars, then replace :param with capture groups
  const regexStr = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    });

  // Match at end of pathname, optional trailing slash, ignore query string
  return {
    regex: new RegExp(`${regexStr}/?$`),
    paramNames,
  };
}

function castValue(raw: string, type: ParamType): string | number {
  if (type === "number") {
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  return raw;
}

function parseQueryString(search: string): Record<string, string> {
  const result: Record<string, string> = {};
  const qs = search.startsWith("?") ? search.slice(1) : search;
  if (!qs) return result;

  for (const pair of qs.split("&")) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) {
      result[decodeURIComponent(pair)] = "";
    } else {
      result[decodeURIComponent(pair.slice(0, eqIdx))] = decodeURIComponent(
        pair.slice(eqIdx + 1),
      );
    }
  }
  return result;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Creates a type-safe route matcher from a declarative route table.
 *
 * Routes are matched **in order** — put specific routes before catch-all routes.
 * The last route typically has pattern `'/'` as the fallback.
 */
export function createRouteMatcher<TName extends string>(
  routes: RouteDef<TName>[],
): RouteMatcher<TName> {
  if (routes.length === 0) {
    throw new Error(
      "createRouteMatcher requires at least one route definition",
    );
  }

  // Pre-compile all patterns once
  const compiled: CompiledRoute<TName>[] = routes.map((def) => ({
    def,
    ...compilePattern(def.pattern),
  }));

  // ── Matcher function ────────────────────────────────────────────────────

  const match = (
    pathname: string,
    search: string = "",
  ): MatchedRoute<TName> => {
    const queryRaw = parseQueryString(search);

    for (const { def, regex, paramNames } of compiled) {
      const m = pathname.match(regex);
      if (!m) continue;

      // Extract path params
      const params: Record<string, string | number> = {};
      paramNames.forEach((name, i) => {
        params[name] = castValue(
          m[i + 1] ?? "",
          def.params?.[name] ?? "string",
        );
      });

      // Extract declared query params
      const query: Record<string, string | number> = {};
      if (def.query) {
        for (const [key, type] of Object.entries(def.query)) {
          if (queryRaw[key] !== undefined) {
            query[key] = castValue(queryRaw[key], type as ParamType);
          }
        }
      }

      return { name: def.name, params, query };
    }

    // Fallback to last route
    const fallback = routes[routes.length - 1];
    const query: Record<string, string | number> = {};
    if (fallback.query) {
      for (const [key, type] of Object.entries(fallback.query)) {
        if (queryRaw[key] !== undefined) {
          query[key] = castValue(queryRaw[key], type as ParamType);
        }
      }
    }
    return { name: fallback.name, params: {}, query };
  };

  // ── Reverse routing ─────────────────────────────────────────────────────

  match.buildPath = (
    name: TName,
    params: Record<string, string | number> = {},
    query: Record<string, string | number> = {},
  ): string => {
    const def = routes.find((r) => r.name === name);
    if (!def) throw new Error(`Unknown route: "${name}"`);

    let path = def.pattern;
    for (const [key, val] of Object.entries(params)) {
      path = path.replace(`:${key}`, String(val));
    }

    const entries = Object.entries(query).filter(
      ([, v]) => v !== undefined && v !== "",
    );
    if (entries.length) {
      path +=
        "?" +
        entries
          .map(
            ([k, v]) =>
              `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
          )
          .join("&");
    }

    return path;
  };

  match.routes = routes;

  return match;
}
