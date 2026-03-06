/**
 * Payments Service
 * Business logic and data access for the payments domain.
 * Replace mock data with paymentsApi calls (bff-client/payments.api.ts) when backend is ready.
 */

export type Payment = {
  id: number;
  customer: string;
  amount: number;
  status: string;
};

export const PAGE_SIZE = 5;

/** Mock dataset — swap with real API calls when backend is available. */
const allPayments: Payment[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  customer: `Customer ${i + 1}`,
  amount: 500 + (i + 1) * 35,
  status: i % 2 === 0 ? "Pending" : "Approved",
}));

export const getTotalPages = () => Math.ceil(allPayments.length / PAGE_SIZE);

export const getPaymentsPage = (page: number): Payment[] => {
  const start = (page - 1) * PAGE_SIZE;
  return allPayments.slice(start, start + PAGE_SIZE);
};

export const getPaymentById = (id: number): Payment | null =>
  allPayments.find((p) => p.id === id) ?? null;
