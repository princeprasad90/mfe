import React, { useEffect } from "react";
import { getPaymentById } from "../../services/payments.service";
import { shellNotify } from "@mfe/platform-events";

// Event payload shapes for events emitted by this page.
// These types stay inside CBMS — other MFEs define their own matching types.
type PaymentSelectedPayload = { paymentId: number; customer: string; amount: number };
type PaymentApprovedPayload = { paymentId: number; customer: string; amount: number };

type Props = {
  basePath: string;
  paymentId: number;
  currentPage: number;
  goTo: (path: string) => void;
  emitEvent?: <T>(event: string, detail: T) => void;
};

export default function PaymentDetailPage({ basePath, paymentId, currentPage, goTo, emitEvent }: Props) {
  const payment = getPaymentById(paymentId);

  // ─── EMIT: broadcast that a payment detail was opened ────────────────────
  // Any listening MFE (e.g. an audit log MFE) can react to this event.
  useEffect(() => {
    if (!payment || !emitEvent) return;
    emitEvent<PaymentSelectedPayload>("cbms:payment:selected", {
      paymentId: payment.id,
      customer: payment.customer,
      amount: payment.amount,
    });
  }, [payment?.id]); // re-emit when navigating to a different detail page
  // ─────────────────────────────────────────────────────────────────────────

  const handleApprove = () => {
    if (!payment) return;

    // ─── EMIT: broadcast that a payment was approved ─────────────────────
    // Example: an orders MFE listening on "cbms:payment:approved" could
    // automatically mark a related order as paid.
    if (emitEvent) {
      emitEvent<PaymentApprovedPayload>("cbms:payment:approved", {
        paymentId: payment.id,
        customer: payment.customer,
        amount: payment.amount,
      });
    }
    // ─────────────────────────────────────────────────────────────────────

    shellNotify({ title: "Approved", message: `Payment #${payment.id} approved.`, variant: "success" });
  };

  if (!payment) {
    return (
      <div className="mfe">
        <h2>Payment Not Found</h2>
        <button className="button" onClick={() => goTo(`${basePath}?page=${currentPage}`)}>Back to Listing</button>
      </div>
    );
  }

  return (
    <div className="mfe">
      <h2>Payment Details</h2>
      <p><strong>ID:</strong> {payment.id}</p>
      <p><strong>Customer:</strong> {payment.customer}</p>
      <p><strong>Amount:</strong> ${payment.amount}</p>
      <p><strong>Status:</strong> {payment.status}</p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        {/* Approve triggers cbms:payment:approved on the event bus */}
        <button className="button button--success" onClick={handleApprove}>
          Approve Payment
        </button>
        <button className="button" onClick={() => goTo(`${basePath}?page=${currentPage}`)}>
          Back to Listing
        </button>
      </div>
    </div>
  );
}
