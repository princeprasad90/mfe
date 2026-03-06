/**
 * Payments BFF Client
 *
 * All HTTP calls for the payments domain go here.
 * Every request uses credentials: "include" so the auth cookie is sent automatically.
 *
 * Currently the app uses mock data (see services/payments.service.ts).
 * Replace the service layer with these API calls when a real backend is ready.
 */

const BFF = import.meta.env.VITE_CBMS_BFF_URL ?? "";

export const paymentsApi = {
  /** GET /payments?page=N */
  list: (page: number) =>
    fetch(`${BFF}/payments?page=${page}`, { credentials: "include" }).then(
      (r) => r.json(),
    ),

  /** GET /payments/:id */
  detail: (id: number) =>
    fetch(`${BFF}/payments/${id}`, { credentials: "include" }).then((r) =>
      r.json(),
    ),
};
