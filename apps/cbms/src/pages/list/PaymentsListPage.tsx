import React, { useEffect, useState } from "react";
import { PageLayout, TableBuilder } from "@mfe/platform-ui";
import type { TableBuilderColumn, TableRowAction } from "@mfe/platform-ui";
import { getAllPayments, type Payment } from "../../services/payments.service";
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

// ─── Column config (declared once, no rebuild) ────────────────────────────────

const columns: TableBuilderColumn<Payment>[] = [
  { key: "id", label: "ID", width: "60px", sortable: true, align: "center" },
  { key: "customer", label: "Customer", sortable: true, filterable: true },
  {
    key: "amount",
    label: "Amount",
    format: "currency",
    sortable: true,
    align: "right",
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    filterable: true,
    filterType: "select",
    filterOptions: [
      { value: "Pending", label: "Pending" },
      { value: "Approved", label: "Approved" },
    ],
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

export default function PaymentsListPage({
  basePath,
  currentPage,
  goTo,
  onEvent,
}: Props) {
  const allPayments = getAllPayments();

  // ─── RECEIVE: listen for events from other MFEs ───────────────────────────
  const [highlightedCustomer, setHighlightedCustomer] = useState<
    string | null
  >(null);

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
        setTimeout(() => setHighlightedCustomer(null), 5000);
      },
    );

    return cleanup;
  }, [onEvent]);

  // ─── Row actions ────────────────────────────────────────────────────────────

  const rowActions: TableRowAction<Payment>[] = [
    {
      label: "Details",
      variant: "primary",
      onClick: (row) =>
        goTo(`${basePath}/details/${row.id}?page=${currentPage}`),
    },
  ];

  return (
    <PageLayout
      title="Payments"
      breadcrumbs={[{ label: "CBMS", path: basePath }, { label: "Payments" }]}
      navigate={goTo}
      toolbar={
        <>
          <button
            className="button"
            style={{
              background: "#1a73e8",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 16px",
              cursor: "pointer",
            }}
            onClick={() => goTo(`${basePath}/demo`)}
          >
            🧩 FormBuilder Demo
          </button>
          <button
            className="button"
            style={{
              background: "#de1621",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 16px",
              cursor: "pointer",
            }}
            onClick={() => goTo(`${basePath}/create`)}
          >
            + Create Payment
          </button>
        </>
      }
    >
      {highlightedCustomer && (
        <div
          style={{
            background: "#fffbe6",
            padding: "8px 12px",
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          <span>
            ⚡ Task assigned — highlighting payments for{" "}
            <strong>{highlightedCustomer}</strong>
          </span>
        </div>
      )}

      <TableBuilder<Payment>
        columns={columns}
        data={allPayments}
        rowKey="id"
        searchable
        searchPlaceholder="Search payments…"
        pageSize={5}
        defaultSort={{ key: "id", direction: "asc" }}
        rowActions={rowActions}
        onRowClick={(row) =>
          goTo(`${basePath}/details/${row.id}?page=${currentPage}`)
        }
        emptyMessage="No payments found."
      />

      {/* Shell integration demo */}
      <div className="demo-section" style={{ marginTop: 24 }}>
        <h3>Shell Integration Demo</h3>
        <div className="demo-row">
          <span className="demo-label">Notifications:</span>
          <button
            className="button button--success"
            onClick={() =>
              shellNotify({
                title: "Success!",
                message: "Payment processed successfully.",
                variant: "success",
              })
            }
          >
            Success
          </button>
          <button
            className="button button--error"
            onClick={() =>
              shellNotify({
                title: "Error",
                message: "Payment failed. Please try again.",
                variant: "error",
              })
            }
          >
            Error
          </button>
          <button
            className="button button--warning"
            onClick={() =>
              shellNotify({
                title: "Warning",
                message: "Session will expire in 5 minutes.",
                variant: "warning",
              })
            }
          >
            Warning
          </button>
          <button
            className="button button--info"
            onClick={() =>
              shellNotify({
                title: "Info",
                message: "New features are available.",
                variant: "info",
              })
            }
          >
            Info
          </button>
        </div>
        <div className="demo-row">
          <span className="demo-label">Loading:</span>
          <button
            className="button"
            onClick={() => {
              showLoader("cbms");
              setTimeout(() => hideLoader("cbms"), 2000);
            }}
          >
            Show Loader (2s)
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
