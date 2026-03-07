/**
 * Products Route Definitions
 *
 * Single source of truth: add one entry to `routes` + one to `productsPath`.
 * TypeScript ensures they stay in sync via `satisfies Record<ProductsRouteName, …>`.
 */

import { createRouteMatcher, type RouteDef } from "@mfe/platform-utils";

// ─── Route table (single source of truth) ─────────────────────────────────────

const routes = [
  { pattern: "/details/:id", name: "detail", params: { id: "number" } },
  { pattern: "/", name: "list" },
] as const;

// ─── Derived types & matcher ──────────────────────────────────────────────────

/** Auto-derived union — never edit manually. */
export type ProductsRouteName = (typeof routes)[number]["name"];

export const productsRoutes =
  routes as unknown as RouteDef<ProductsRouteName>[];
export const productsMatcher = createRouteMatcher(productsRoutes);

// ─── Path builders (compiler-checked completeness) ────────────────────────────

export const productsPath = {
  detail: (id: number) => productsMatcher.buildPath("detail", { id }),
  list: () => productsMatcher.buildPath("list"),
} satisfies Record<ProductsRouteName, (...args: any[]) => string>;
