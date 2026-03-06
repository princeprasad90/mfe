import React, { useMemo, useEffect, useState } from "react";
import { getPaymentsPage, getTotalPages } from "../../services/payments.service";
import { shellNotify, showLoader, hideLoader } from "@mfe/platform-events";

// Event payload type for an incoming cross-MFE event.
// Define the shape here — no import from the other MFE.
type TaskAssignedPayload = {
  taskId: number;
  customer: string;
};

type Props = {
  basePath: string;
  currentPage: number;
  goTo: (path: string) => void;
  onEvent?: <T>(event: string, handler: (detail: T) => void) => () => void;
};

export default function PaymentsListPage({ basePath, currentPage, goTo, onEvent }: Props) {
  const items = useMemo(() => getPaymentsPage(currentPage), [currentPage]);
  const totalPages = getTotalPages();

  // ─── RECEIVE: listen for events from other MFEs ───────────────────────────
  // Example: CDTS (task MFE) emits "cdts:task:assigned" when a task is linked
  // to a customer. CBMS listens and highlights the relevant payment.
  const [highlightedCustomer, setHighlightedCustomer] = useState<string | null>(null);

  useEffect(() => {
    if (!onEvent) return;

    const cleanup = onEvent<TaskAssignedPayload>(
      "cdts:task:assigned",
      ({ customer }) => {
        setHighlightedCustomer(customer);
        shellNotify({
          title: "Task Assigned",
          message: `A task was linked to ${customer} — payment highlighted.`,
          variant: "info",
        });
        // Auto-clear highlight after 5s
        setTimeout(() => setHighlightedCustomer(null), 5000);
      }
    );

    return cleanup; // unsubscribe when component unmounts
  }, [onEvent]);
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="mfe">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Payments Listing</h2>
        <button
          className="button"
          style={{ background: "#de1621", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer" }}
          onClick={() => goTo(`${basePath}/create`)}
        >
          + Create Payment
        </button>
      </div>

      {highlightedCustomer && (
        <div className="demo-row" style={{ background: "#fffbe6", padding: "8px 12px", borderRadius: 6, marginBottom: 12 }}>
          <span>⚡ Task assigned — highlighting payments for <strong>{highlightedCustomer}</strong></span>
        </div>
      )}

      <ul className="list">
        {items.map((payment) => (
          <li
            key={payment.id}
            className="list-item"
            style={payment.customer === highlightedCustomer
              ? { outline: "2px solid #de1621", borderRadius: 6 }
              : undefined}
          >
            <span>{payment.customer} — ${payment.amount}</span>
            <button
              className="ghost"
              onClick={() => goTo(`${basePath}/details/${payment.id}?page=${currentPage}`)}
            >
              Details
            </button>
          </li>
        ))}
      </ul>

      <div className="pager">
        <button
          className="ghost"
          disabled={currentPage <= 1}
          onClick={() => goTo(`${basePath}?page=${currentPage - 1}`)}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          className="ghost"
          disabled={currentPage >= totalPages}
          onClick={() => goTo(`${basePath}?page=${currentPage + 1}`)}
        >
          Next
        </button>
      </div>

      {/* Shell integration demo */}
      <div className="demo-section">
        <h3>Shell Integration Demo</h3>
        <div className="demo-row">
          <span className="demo-label">Notifications:</span>
          <button className="button button--success" onClick={() => shellNotify({ title: "Success!", message: "Payment processed successfully.", variant: "success" })}>Success</button>
          <button className="button button--error"   onClick={() => shellNotify({ title: "Error",    message: "Payment failed. Please try again.",   variant: "error" })}>Error</button>
          <button className="button button--warning" onClick={() => shellNotify({ title: "Warning",  message: "Session will expire in 5 minutes.",   variant: "warning" })}>Warning</button>
          <button className="button button--info"    onClick={() => shellNotify({ title: "Info",     message: "New features are available.",         variant: "info" })}>Info</button>
        </div>
        <div className="demo-row">
          <span className="demo-label">Loading:</span>
          <button className="button" onClick={() => { showLoader("cbms"); setTimeout(() => hideLoader("cbms"), 2000); }}>
            Show Loader (2s)
          </button>
        </div>
      </div>
    </div>
  );
}
