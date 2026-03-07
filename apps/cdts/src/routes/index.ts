/**
 * CDTS Route Definitions
 *
 * Single source of truth: add one entry to `routes` + one to `cdtsPath`.
 * TypeScript ensures they stay in sync via `satisfies Record<CdtsRouteName, …>`.
 */

import { createRouteMatcher, type RouteDef } from "@mfe/platform-utils";

// ─── Route table (single source of truth) ─────────────────────────────────────

const routes = [
  {
    pattern: "/details/:id",
    name: "detail",
    params: { id: "number" },
    query: { page: "number" },
  },
  { pattern: "/", name: "list", query: { page: "number" } },
] as const;

// ─── Derived types & matcher ──────────────────────────────────────────────────

/** Auto-derived union — never edit manually. */
export type CdtsRouteName = (typeof routes)[number]["name"];

export const cdtsRoutes = routes as unknown as RouteDef<CdtsRouteName>[];
export const cdtsMatcher = createRouteMatcher(cdtsRoutes);

// ─── Path builders (compiler-checked completeness) ────────────────────────────

export const cdtsPath = {
  detail: (id: number, page?: number) =>
    cdtsMatcher.buildPath("detail", { id }, page && page > 1 ? { page } : {}),
  list: (page?: number) =>
    cdtsMatcher.buildPath("list", {}, page && page > 1 ? { page } : {}),
} satisfies Record<CdtsRouteName, (...args: any[]) => string>;
