import React, { useState } from "react";
import "@mfe/platform-ui/src/theme.css";
import {
  Form,
  FormGroup,
  FormRow,
  FormActions,
  Input,
  Select,
  SmartSelect,
  MultiSelect,
  DatePicker,
  Button,
  Tabs,
  Table,
  Modal,
  Loader,
  showToast,
  ToastContainer,
} from "@mfe/platform-ui";
import type { SelectOption, MultiSelectOption, TableColumn } from "@mfe/platform-ui";

// ── Static data ──────────────────────────────────────────────────────────────

const statusOptions: SelectOption[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const tagOptions: MultiSelectOption[] = [
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
  // Form fields
  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Submitted list
  const [entries, setEntries] = useState<PaymentEntry[]>([]);

  // Modal
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Loading demo
  const [submitting, setSubmitting] = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!customer.trim()) e.customer = "Customer name is required";
    if (!amount.trim()) e.amount = "Amount is required";
    else if (isNaN(Number(amount)) || Number(amount) <= 0) e.amount = "Enter a valid positive amount";
    if (!status) e.status = "Select a status";
    if (!dueDate) e.dueDate = "Due date is required";
    if (!country) e.country = "Select a country";
    if (!city) e.city = "Select a city";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!validate()) return;
    setConfirmOpen(true); // Open confirmation modal
  };

  const confirmSubmit = async () => {
    setConfirmOpen(false);
    setSubmitting(true);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1200));

    const countryName = countryData.find((c) => c.id === country)?.name ?? "";
    const cityName = cityData.find((c) => c.id === city)?.name ?? "";

    const entry: PaymentEntry = {
      id: entries.length + 1,
      customer,
      amount: `$${Number(amount).toFixed(2)}`,
      status,
      country: countryName,
      city: cityName,
      date: dueDate,
      tags: tags.join(", ") || "—",
    };

    setEntries((prev) => [entry, ...prev]);
    setSubmitting(false);

    // Reset form
    setCustomer("");
    setAmount("");
    setStatus("");
    setTags([]);
    setDueDate("");
    setCountry("");
    setCity("");
    setNotes("");
    setErrors({});

    showToast({
      variant: "success",
      title: "Payment Created",
      message: `Payment for ${entry.customer} has been saved.`,
    });
  };

  // ── Tabs config ─────────────────────────────────────────────────────────

  const formTab = (
    <Form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
      {/* Row 1 — Customer + Amount */}
      <FormRow>
        <FormGroup>
          <Input
            label="Customer Name"
            placeholder="e.g. Acme Corp"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            error={errors.customer}
          />
        </FormGroup>
        <FormGroup>
          <Input
            label="Amount ($)"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
          />
        </FormGroup>
      </FormRow>

      {/* Row 2 — Status + Due Date */}
      <FormRow>
        <FormGroup>
          <Select
            label="Status"
            options={statusOptions}
            placeholder="Select status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            error={errors.status}
          />
        </FormGroup>
        <FormGroup>
          <DatePicker
            label="Due Date"
            value={dueDate}
            onChange={setDueDate}
            error={errors.dueDate}
          />
        </FormGroup>
      </FormRow>

      {/* Row 3 — Country → City (cascading SmartSelect) */}
      <FormRow>
        <FormGroup>
          <SmartSelect
            label="Country"
            dataSource={{ type: "static", data: countryData }}
            valueField="id"
            textField="name"
            placeholder="Select country"
            value={country}
            onChange={(val) => {
              setCountry(val);
              setCity(""); // reset city when country changes
            }}
            error={errors.country}
          />
        </FormGroup>
        <FormGroup>
          <SmartSelect
            label="City"
            dataSource={{ type: "static", data: cityData }}
            dependsOn="country"
            dependencyValues={{ country }}
            exclude={[]}
            valueField="id"
            textField="name"
            placeholder="Select city"
            value={city}
            onChange={(val) => setCity(val)}
            disabled={!country}
            error={errors.city}
          />
        </FormGroup>
      </FormRow>

      {/* Row 4 — Tags + Notes */}
      <FormRow>
        <FormGroup>
          <MultiSelect
            label="Tags"
            options={tagOptions}
            value={tags}
            onChange={setTags}
            placeholder="Select tags…"
          />
        </FormGroup>
        <FormGroup>
          <Input
            label="Notes"
            placeholder="Optional notes…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormGroup>
      </FormRow>

      {/* Actions */}
      <FormActions>
        <Button variant="secondary" type="button" onClick={() => goTo(`${basePath}`)}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {submitting ? "Saving…" : "Create Payment"}
        </Button>
      </FormActions>
    </Form>
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

  // ── Render ──────────────────────────────────────────────────────────────

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

      {/* Confirmation Modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Payment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSubmit}>Yes, Create</Button>
          </>
        }
      >
        <p style={{ margin: 0 }}>
          Are you sure you want to create a <strong>${Number(amount || 0).toFixed(2)}</strong>{" "}
          payment for <strong>{customer || "—"}</strong>?
        </p>
      </Modal>

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

      {/* Toast container (renders toasts from showToast calls) */}
      <ToastContainer />
    </div>
  );
};

export default CreatePaymentPage;
