import React, { useState, useMemo } from "react";
import "@mfe/platform-ui/src/theme.css";
import {
  FormBuilder,
  Tabs,
  Table,
  Loader,
  showToast,
  ToastContainer,
  Button,
} from "@mfe/platform-ui";
import type { TableColumn, FieldLayout } from "@mfe/platform-ui";
import type { FormConfig } from "@mfe/platform-utils";

// ── Static data ──────────────────────────────────────────────────────────────

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const tagOptions = [
  { value: "urgent", label: "Urgent" },
  { value: "recurring", label: "Recurring" },
  { value: "international", label: "International" },
  { value: "domestic", label: "Domestic" },
  { value: "high-value", label: "High Value" },
];

const countryData = [
  { id: "1", name: "United States" },
  { id: "2", name: "United Kingdom" },
  { id: "3", name: "Canada" },
];

const cityData = [
  { id: "10", name: "New York", country: "1" },
  { id: "11", name: "Los Angeles", country: "1" },
  { id: "12", name: "Chicago", country: "1" },
  { id: "20", name: "London", country: "2" },
  { id: "21", name: "Manchester", country: "2" },
  { id: "30", name: "Toronto", country: "3" },
  { id: "31", name: "Vancouver", country: "3" },
];

// ── Submitted entries table ──────────────────────────────────────────────────

interface PaymentEntry {
  id: number;
  customer: string;
  amount: string;
  status: string;
  country: string;
  city: string;
  date: string;
  tags: string;
}

const columns: TableColumn<PaymentEntry>[] = [
  { key: "id", header: "#", width: "50px" },
  { key: "customer", header: "Customer" },
  { key: "amount", header: "Amount", align: "right" },
  { key: "status", header: "Status" },
  { key: "country", header: "Country" },
  { key: "city", header: "City" },
  { key: "date", header: "Date" },
  { key: "tags", header: "Tags" },
];

// ── Component ────────────────────────────────────────────────────────────────

type Props = {
  basePath: string;
  goTo: (path: string) => void;
  emitEvent?: <T>(event: string, detail: T) => void;
};

const CreatePaymentPage: React.FC<Props> = ({ basePath, goTo }) => {
  const [entries, setEntries] = useState<PaymentEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // ── Form config (declarative) ─────────────────────────────────────────

  const formConfig = useMemo<FormConfig>(
    () => ({
      fields: {
        customer: {
          type: "text",
          label: "Customer Name",
          placeholder: "e.g. Acme Corp",
          rules: [
            { rule: "required" },
            { rule: "minLength", params: 2, message: "Customer name must be at least 2 characters" },
          ],
        },
        amount: {
          type: "number",
          label: "Amount ($)",
          placeholder: "0.00",
          rules: [
            { rule: "required" },
            {
              rule: "custom",
              validate: (v) => {
                const num = Number(v);
                if (isNaN(num) || num <= 0) return "Enter a valid positive amount";
                return true;
              },
            },
          ],
        },
        status: {
          type: "select",
          label: "Status",
          placeholder: "Select status",
          rules: [{ rule: "required", message: "Select a status" }],
          componentProps: { options: statusOptions },
        },
        dueDate: {
          type: "date",
          label: "Due Date",
          rules: [{ rule: "required" }],
        },
        country: {
          type: "smartselect",
          label: "Country",
          placeholder: "Select country",
          rules: [{ rule: "required", message: "Select a country" }],
          componentProps: {
            dataSource: { type: "static", data: countryData },
            valueField: "id",
            textField: "name",
          },
        },
        city: {
          type: "smartselect",
          label: "City",
          placeholder: "Select city",
          rules: [{ rule: "required", message: "Select a city" }],
          visibleWhen: { field: "country", operator: "truthy" },
          componentProps: {
            dataSource: { type: "static", data: cityData },
            dependsOn: "country",
            valueField: "id",
            textField: "name",
          },
        },
        tags: {
          type: "multiselect",
          label: "Tags",
          placeholder: "Select tags…",
          componentProps: { options: tagOptions },
        },
        notes: {
          type: "textarea",
          label: "Notes",
          placeholder: "Optional notes…",
        },
      },
      submit: {
        confirmMessage: "Are you sure you want to create this payment?",
        action: async (values) => {
          setSubmitting(true);
          // Simulate API delay
          await new Promise((r) => setTimeout(r, 1200));
          return values;
        },
        onSuccess: (result, helpers) => {
          const vals = result as Record<string, unknown>;
          const countryName = countryData.find((c) => c.id === vals.country)?.name ?? "";
          const cityName = cityData.find((c) => c.id === vals.city)?.name ?? "";
          const tagsArr = vals.tags as string[] | undefined;

          const entry: PaymentEntry = {
            id: entries.length + 1,
            customer: String(vals.customer),
            amount: `$${Number(vals.amount || 0).toFixed(2)}`,
            status: String(vals.status),
            country: countryName,
            city: cityName,
            date: String(vals.dueDate),
            tags: tagsArr?.join(", ") || "—",
          };

          setEntries((prev) => [entry, ...prev]);
          setSubmitting(false);
          helpers.reset();
          helpers.showToast({
            variant: "success",
            title: "Payment Created",
            message: `Payment for ${entry.customer} has been saved.`,
          });
        },
        onError: (_err, helpers) => {
          setSubmitting(false);
          helpers.showToast({
            variant: "error",
            title: "Error",
            message: "Failed to create payment.",
          });
        },
      },
    }),
    [entries.length],
  );

  // ── Layout: which fields go in which rows ─────────────────────────────

  const layout: FieldLayout[] = [
    ["customer", "amount"],
    ["status", "dueDate"],
    ["country", "city"],
    ["tags", "notes"],
  ];

  // ── Tabs ──────────────────────────────────────────────────────────────

  const formTab = (
    <FormBuilder
      config={formConfig}
      layout={layout}
      submitLabel="Create Payment"
      submittingLabel="Saving…"
      onCancel={() => goTo(`${basePath}`)}
      cancelLabel="Cancel"
      showToast={(opts) => showToast({ ...opts, message: opts.message ?? "" })}
      style={{ maxWidth: 720 }}
    />
  );

  const historyTab =
    entries.length === 0 ? (
      <div style={{ padding: 32, textAlign: "center", color: "var(--pui-text-muted)" }}>
        No payments created yet. Use the form tab to add one.
      </div>
    ) : (
      <Table
        columns={columns}
        data={entries}
        rowKey={(r) => r.id}
        striped
        emptyMessage="No entries yet."
      />
    );

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0 }}>Create Payment</h2>
          <p style={{ margin: "4px 0 0", color: "var(--pui-text-muted)", fontSize: 14 }}>
            Fill out the form below to register a new payment entry.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => goTo(`${basePath}`)}>
          ← Back to List
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: "form", label: "Payment Form", content: formTab },
          { id: "history", label: `Submitted (${entries.length})`, content: historyTab },
        ]}
        defaultTab="form"
      />

      {/* Loader overlay while submitting */}
      {submitting && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.7)",
            zIndex: 1500,
          }}
        >
          <Loader size="lg" label="Saving payment…" overlay />
        </div>
      )}

      {/* Toast container */}
      <ToastContainer />
    </div>
  );
};

export default CreatePaymentPage;
