import React, { useEffect } from "react";
import { PageLayout, DetailView } from "@mfe/platform-ui";
import type { DetailField, DetailAction } from "@mfe/platform-ui";
import { getPaymentById, type Payment } from "../../services/payments.service";
import { shellNotify } from "@mfe/platform-events";

type PaymentSelectedPayload = { paymentId: number; customer: string; amount: number };
type PaymentApprovedPayload = { paymentId: number; customer: string; amount: number };

type Props = {
  basePath: string;
  paymentId: number;
  currentPage: number;
  goTo: (path: string) => void;
  emitEvent?: <T>(event: string, detail: T) => void;
};

// ─── Field definitions (declared once) ────────────────────────────────────────

const fields: DetailField<Payment>[] = [
  { key: "id", label: "Payment ID" },
  { key: "customer", label: "Customer" },
  { key: "amount", label: "Amount", format: "currency" },
  {
    key: "status",
    label: "Status",
    render: (value) => {
      const v = String(value);
      const color = v === "Approved" ? "#16a34a" : "#d97706";
      return (
        <span
          style={{
            color,
            fontWeight: 600,
            background: v === "Approved" ? "#f0fdf4" : "#fffbeb",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {v}
        </span>
      );
    },
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PaymentDetailPage({
  basePath,
  paymentId,
  currentPage,
  goTo,
  emitEvent,
}: Props) {
  const payment = getPaymentById(paymentId);

  // Emit "payment selected" event when detail page mounts
  useEffect(() => {
    if (!payment || !emitEvent) return;
    emitEvent<PaymentSelectedPayload>("cbms:payment:selected", {
      paymentId: payment.id,
      customer: payment.customer,
      amount: payment.amount,
    });
  }, [payment?.id]);

  // ─── Action buttons ──────────────────────────────────────────────────────

  const actions: DetailAction<Payment>[] = [
    {
      label: "Approve Payment",
      variant: "success",
      onClick: (data) => {
        if (emitEvent) {
          emitEvent<PaymentApprovedPayload>("cbms:payment:approved", {
            paymentId: data.id,
            customer: data.customer,
            amount: data.amount,
          });
        }
        shellNotify({
          title: "Approved",
          message: `Payment #${data.id} approved.`,
          variant: "success",
        });
      },
    },
  ];

  return (
    <PageLayout
      title="Payment Details"
      breadcrumbs={[
        { label: "CBMS", path: basePath },
        { label: "Payments", path: `${basePath}?page=${currentPage}` },
        { label: `#${paymentId}` },
      ]}
      navigate={goTo}
    >
      <DetailView<Payment>
        data={payment}
        fields={fields}
        actions={actions}
        columns={2}
        backLink={{
          label: "← Back to Payments",
          path: `${basePath}?page=${currentPage}`,
        }}
        navigate={goTo}
      />
    </PageLayout>
  );
}
