/**
 * CBMS Route Definitions
 * Parses the current URL into a typed route match.
 * All route logic lives here — pages/components don't parse URLs directly.
 */

export type CbmsRoute =
  | { name: "detail"; paymentId: number; page: number }
  | { name: "list"; page: number };

const parsePage = (search: string): number => {
  const match = search.match(/[?&]page=(\d+)/);
  return Math.max(1, Number(match?.[1] ?? 1));
};

export const matchRoute = (pathname: string, search: string): CbmsRoute => {
  const detailMatch = pathname.match(/\/details\/(\d+)/);
  if (detailMatch) {
    return {
      name: "detail",
      paymentId: Number(detailMatch[1]),
      page: parsePage(search),
    };
  }
  return { name: "list", page: parsePage(search) };
};
