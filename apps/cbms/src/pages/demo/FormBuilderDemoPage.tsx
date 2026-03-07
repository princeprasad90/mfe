import React, { useState, useMemo } from "react";
import "@mfe/platform-ui/src/theme.css";
import {
  FormBuilder,
  useFormBuilder,
  FormField,
  Form,
  FormGroup,
  FormRow,
  FormActions,
  Button,
  Tabs,
  Table,
  Modal,
  showToast,
  ToastContainer,
  Loader,
} from "@mfe/platform-ui";
import type { FormConfig } from "@mfe/platform-utils";
import type { FieldLayout, TableColumn } from "@mfe/platform-ui";

// ══════════════════════════════════════════════════════════════════════════
//  Shared static data
// ══════════════════════════════════════════════════════════════════════════

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

const departmentOptions = [
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "hr", label: "Human Resources" },
];

const skillOptions = [
  { value: "react", label: "React" },
  { value: "angular", label: "Angular" },
  { value: "vue", label: "Vue" },
  { value: "node", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
];

const countryData = [
  { id: "us", name: "United States" },
  { id: "uk", name: "United Kingdom" },
  { id: "ca", name: "Canada" },
  { id: "de", name: "Germany" },
  { id: "in", name: "India" },
];

const cityData = [
  { id: "nyc", name: "New York", country: "us" },
  { id: "la", name: "Los Angeles", country: "us" },
  { id: "sf", name: "San Francisco", country: "us" },
  { id: "lon", name: "London", country: "uk" },
  { id: "man", name: "Manchester", country: "uk" },
  { id: "tor", name: "Toronto", country: "ca" },
  { id: "van", name: "Vancouver", country: "ca" },
  { id: "ber", name: "Berlin", country: "de" },
  { id: "mun", name: "Munich", country: "de" },
  { id: "mum", name: "Mumbai", country: "in" },
  { id: "blr", name: "Bangalore", country: "in" },
];

// ══════════════════════════════════════════════════════════════════════════
//  DEMO 1 — Fully declarative <FormBuilder> (Registration Form)
// ══════════════════════════════════════════════════════════════════════════

const registrationConfig: FormConfig = {
  fields: {
    firstName: {
      type: "text",
      label: "First Name",
      placeholder: "e.g. John",
      rules: [
        { rule: "required" },
        { rule: "minLength", params: 2, message: "Name must be at least 2 characters" },
        { rule: "maxLength", params: 50 },
      ],
    },
    lastName: {
      type: "text",
      label: "Last Name",
      placeholder: "e.g. Doe",
      rules: [{ rule: "required" }, { rule: "minLength", params: 2 }],
    },
    email: {
      type: "email",
      label: "Email Address",
      placeholder: "john.doe@example.com",
      rules: [{ rule: "required" }, { rule: "email" }],
      asyncValidation: {
        validate: async (value) => {
          await new Promise((r) => setTimeout(r, 800));
          const taken = ["admin@example.com", "test@example.com"];
          return taken.includes(String(value).toLowerCase())
            ? "This email is already registered."
            : true;
        },
        debounceMs: 500,
      },
    },
    phone: {
      type: "text",
      label: "Phone Number",
      placeholder: "+1 (555) 000-0000",
      rules: [{ rule: "phone" }],
    },
    password: {
      type: "password",
      label: "Password",
      placeholder: "Minimum 8 characters",
      rules: [
        { rule: "required" },
        { rule: "minLength", params: 8 },
        {
          rule: "pattern",
          params: /(?=.*[A-Z])(?=.*\d)/,
          message: "Must contain at least 1 uppercase letter and 1 number",
        },
      ],
    },
    confirmPassword: {
      type: "password",
      label: "Confirm Password",
      placeholder: "Re-enter password",
      rules: [{ rule: "required" }],
      dependsOn: {
        field: "password",
        rule: "matchField",
        message: "Passwords do not match.",
      },
    },
    role: {
      type: "select",
      label: "Role",
      placeholder: "Choose your role",
      rules: [{ rule: "required" }],
      componentProps: { options: roleOptions },
    },
    department: {
      type: "select",
      label: "Department",
      placeholder: "Select department",
      rules: [{ rule: "required" }],
      componentProps: { options: departmentOptions },
    },
    skills: {
      type: "multiselect",
      label: "Skills",
      placeholder: "Select your skills…",
      componentProps: { options: skillOptions },
    },
    startDate: {
      type: "date",
      label: "Start Date",
      rules: [{ rule: "required" }],
    },
    endDate: {
      type: "date",
      label: "End Date (optional)",
      dependsOn: {
        field: "startDate",
        rule: "afterDate",
        message: "End date must be after start date.",
      },
    },
    country: {
      type: "smartselect",
      label: "Country",
      placeholder: "Select country",
      rules: [{ rule: "required" }],
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
      rules: [{ rule: "required" }],
      visibleWhen: { field: "country", operator: "truthy" },
      componentProps: {
        dataSource: { type: "static", data: cityData },
        dependsOn: "country",
        valueField: "id",
        textField: "name",
      },
    },
    salary: {
      type: "number",
      label: "Expected Salary ($)",
      placeholder: "e.g. 80000",
      rules: [
        { rule: "required" },
        { rule: "min", params: 1000, message: "Salary must be at least $1,000" },
        { rule: "max", params: 1000000 },
      ],
    },
    website: {
      type: "text",
      label: "Personal Website",
      placeholder: "https://example.com",
      rules: [{ rule: "url" }],
    },
    agreeTerms: {
      type: "checkbox",
      label: "I agree to the Terms & Conditions",
      rules: [
        {
          rule: "custom",
          validate: (v) => (v === true ? true : "You must agree to the terms."),
        },
      ],
    },
    bio: {
      type: "textarea",
      label: "Bio",
      placeholder: "Tell us about yourself…",
      rules: [{ rule: "maxLength", params: 500 }],
    },
    referralCode: {
      type: "text",
      label: "Referral Code (Admin only)",
      placeholder: "Enter referral code",
      visibleWhen: { field: "role", operator: "eq", value: "admin" },
      rules: [{ rule: "minLength", params: 4 }],
    },
  },
  submit: {
    confirmMessage: "Are you sure you want to submit this registration?",
    action: async (values) => {
      await new Promise((r) => setTimeout(r, 1500));
      return values;
    },
    onSuccess: (_result, helpers) => {
      helpers.reset();
      helpers.showToast({
        variant: "success",
        title: "Registration Successful",
        message: "The user account has been created.",
      });
    },
    onError: (_err, helpers) => {
      helpers.showToast({
        variant: "error",
        title: "Registration Failed",
        message: "Something went wrong. Please try again.",
      });
    },
  },
};

const registrationLayout: FieldLayout[] = [
  ["firstName", "lastName"],
  ["email", "phone"],
  ["password", "confirmPassword"],
  ["role", "department"],
  "skills",
  ["startDate", "endDate"],
  ["country", "city"],
  ["salary", "website"],
  "agreeTerms",
  "bio",
  "referralCode",
];

// ══════════════════════════════════════════════════════════════════════════
//  DEMO 2 — Hook-based useFormBuilder (Contact Form with custom layout)
// ══════════════════════════════════════════════════════════════════════════

const contactConfig: FormConfig = {
  fields: {
    name: {
      type: "text",
      label: "Full Name",
      placeholder: "Your name",
      rules: [{ rule: "required" }],
    },
    email: {
      type: "email",
      label: "Email",
      placeholder: "you@example.com",
      rules: [{ rule: "required" }, { rule: "email" }],
    },
    subject: {
      type: "select",
      label: "Subject",
      placeholder: "What is this about?",
      rules: [{ rule: "required" }],
      componentProps: {
        options: [
          { value: "general", label: "General Inquiry" },
          { value: "support", label: "Technical Support" },
          { value: "billing", label: "Billing Question" },
          { value: "feedback", label: "Feedback" },
          { value: "other", label: "Other" },
        ],
      },
    },
    otherSubject: {
      type: "text",
      label: "Please specify",
      placeholder: "Describe your subject",
      rules: [{ rule: "required" }],
      visibleWhen: { field: "subject", operator: "eq", value: "other" },
    },
    priority: {
      type: "select",
      label: "Priority",
      defaultValue: "normal",
      componentProps: {
        options: [
          { value: "low", label: "Low" },
          { value: "normal", label: "Normal" },
          { value: "high", label: "High" },
          { value: "critical", label: "Critical" },
        ],
      },
    },
    message: {
      type: "textarea",
      label: "Message",
      placeholder: "Tell us more…",
      rules: [
        { rule: "required" },
        { rule: "minLength", params: 20, message: "Please provide at least 20 characters" },
      ],
    },
    attachUrl: {
      type: "text",
      label: "Attachment URL (optional)",
      placeholder: "https://drive.google.com/...",
      rules: [{ rule: "url" }],
      visibleWhen: { field: "subject", operator: "in", value: ["support", "billing"] },
    },
  },
  submit: {
    action: async (values) => {
      await new Promise((r) => setTimeout(r, 1000));
      return { ticketId: `TKT-${Math.floor(Math.random() * 10000)}`, ...values };
    },
    onSuccess: (result, helpers) => {
      const res = result as Record<string, unknown>;
      helpers.reset();
      helpers.showToast({
        variant: "success",
        title: "Ticket Created",
        message: `Your ticket ${res.ticketId} has been submitted.`,
      });
    },
  },
};

// ══════════════════════════════════════════════════════════════════════════
//  DEMO 3 — Minimal form (3 fields, no layout config)
// ══════════════════════════════════════════════════════════════════════════

const feedbackConfig: FormConfig = {
  fields: {
    rating: {
      type: "select",
      label: "Rating",
      rules: [{ rule: "required" }],
      componentProps: {
        options: [
          { value: "1", label: "⭐ 1 — Poor" },
          { value: "2", label: "⭐⭐ 2 — Fair" },
          { value: "3", label: "⭐⭐⭐ 3 — Good" },
          { value: "4", label: "⭐⭐⭐⭐ 4 — Great" },
          { value: "5", label: "⭐⭐⭐⭐⭐ 5 — Excellent" },
        ],
      },
    },
    comment: {
      type: "textarea",
      label: "Comments",
      placeholder: "Share your feedback…",
    },
    followUp: {
      type: "checkbox",
      label: "I'd like a follow-up email",
    },
  },
  submit: {
    action: async (values) => {
      await new Promise((r) => setTimeout(r, 500));
      return values;
    },
    onSuccess: (_result, helpers) => {
      helpers.reset();
      helpers.showToast({ variant: "success", title: "Thanks!", message: "Feedback submitted." });
    },
  },
};

// ══════════════════════════════════════════════════════════════════════════
//  Submissions table
// ══════════════════════════════════════════════════════════════════════════

interface SubmissionEntry {
  id: number;
  form: string;
  data: string;
  time: string;
}

const submissionColumns: TableColumn<SubmissionEntry>[] = [
  { key: "id", header: "#", width: "50px" },
  { key: "form", header: "Form" },
  { key: "data", header: "Data" },
  { key: "time", header: "Submitted At" },
];

// ══════════════════════════════════════════════════════════════════════════
//  Hook-based Contact Form sub-component
// ══════════════════════════════════════════════════════════════════════════

const ContactFormDemo: React.FC<{
  onSubmitted: (formName: string, data: Record<string, unknown>) => void;
}> = ({ onSubmitted }) => {
  const fb = useFormBuilder(contactConfig, {
    showToast: (opts) => showToast({ ...opts, message: opts.message ?? "" }),
  });

  // Custom submit wrapper that also logs to parent
  const handleSubmit = (e?: React.BaseSyntheticEvent) => {
    fb.form.handleSubmit(async (values) => {
      await new Promise((r) => setTimeout(r, 1000));
      onSubmitted("Contact Form", values);
      fb.reset();
      showToast({
        variant: "success",
        title: "Ticket Created",
        message: `Ticket TKT-${Math.floor(Math.random() * 10000)} submitted.`,
      });
    })(e);
  };

  return (
    <Form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <h4 style={{ margin: "0 0 8px" }}>Contact / Support Form</h4>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--pui-text-muted)" }}>
        Uses <code>useFormBuilder()</code> hook with custom layout. Select "Other" as subject
        to see conditional field. Select "Technical Support" or "Billing" to see the attachment URL field.
      </p>

      <FormRow>
        <FormGroup>
          <FormField name="name" fieldDef={fb.fields.name.fieldDef} control={fb.control} error={fb.fields.name.error} visible={fb.fields.name.visible} />
        </FormGroup>
        <FormGroup>
          <FormField name="email" fieldDef={fb.fields.email.fieldDef} control={fb.control} error={fb.fields.email.error} visible={fb.fields.email.visible} />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <FormField name="subject" fieldDef={fb.fields.subject.fieldDef} control={fb.control} error={fb.fields.subject.error} visible={fb.fields.subject.visible} />
        </FormGroup>
        <FormGroup>
          <FormField name="priority" fieldDef={fb.fields.priority.fieldDef} control={fb.control} error={fb.fields.priority.error} visible={fb.fields.priority.visible} />
        </FormGroup>
      </FormRow>

      {fb.fields.otherSubject.visible && (
        <FormRow>
          <FormGroup>
            <FormField name="otherSubject" fieldDef={fb.fields.otherSubject.fieldDef} control={fb.control} error={fb.fields.otherSubject.error} visible={fb.fields.otherSubject.visible} />
          </FormGroup>
        </FormRow>
      )}

      <FormRow>
        <FormGroup>
          <FormField name="message" fieldDef={fb.fields.message.fieldDef} control={fb.control} error={fb.fields.message.error} visible={fb.fields.message.visible} />
        </FormGroup>
      </FormRow>

      {fb.fields.attachUrl.visible && (
        <FormRow>
          <FormGroup>
            <FormField name="attachUrl" fieldDef={fb.fields.attachUrl.fieldDef} control={fb.control} error={fb.fields.attachUrl.error} visible={fb.fields.attachUrl.visible} />
          </FormGroup>
        </FormRow>
      )}

      <FormActions>
        <Button type="submit" loading={fb.isSubmitting}>
          {fb.isSubmitting ? "Sending…" : "Send Message"}
        </Button>
      </FormActions>
    </Form>
  );
};

// ══════════════════════════════════════════════════════════════════════════
//  Main Demo Page
// ══════════════════════════════════════════════════════════════════════════

type Props = {
  basePath: string;
  goTo: (path: string) => void;
};

const FormBuilderDemoPage: React.FC<Props> = ({ basePath, goTo }) => {
  const [submissions, setSubmissions] = useState<SubmissionEntry[]>([]);

  const logSubmission = (formName: string, data: Record<string, unknown>) => {
    setSubmissions((prev) => [
      {
        id: prev.length + 1,
        form: formName,
        data: JSON.stringify(data, null, 0).slice(0, 120) + "…",
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  // Wrap the registration config to also log submissions
  const registrationWithLogging = useMemo<FormConfig>(
    () => ({
      ...registrationConfig,
      submit: {
        ...registrationConfig.submit!,
        action: async (values) => {
          await new Promise((r) => setTimeout(r, 1500));
          logSubmission("Registration Form", values);
          return values;
        },
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const feedbackWithLogging = useMemo<FormConfig>(
    () => ({
      ...feedbackConfig,
      submit: {
        ...feedbackConfig.submit!,
        action: async (values) => {
          await new Promise((r) => setTimeout(r, 500));
          logSubmission("Feedback Form", values);
          return values;
        },
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── Tab content ────────────────────────────────────────────────────────

  const demo1Tab = (
    <div>
      <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--pui-surface-alt, #f5f5f5)", borderRadius: 8, fontSize: 13 }}>
        <strong>Demo 1 — Full Declarative &lt;FormBuilder&gt;</strong><br />
        This form uses a single <code>FormConfig</code> object and the <code>&lt;FormBuilder&gt;</code> component.
        No manual <code>useState</code>, no imperative validation. Features demonstrated:
        <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
          <li><strong>All field types:</strong> text, email, password, number, select, multiselect, smartselect, date, checkbox, textarea</li>
          <li><strong>Built-in rules:</strong> required, minLength, maxLength, min, max, pattern, email, url, phone</li>
          <li><strong>Custom validation:</strong> "Agree to terms" checkbox with custom validate function</li>
          <li><strong>Cross-field validation:</strong> "Confirm Password" must match "Password"; "End Date" must be after "Start Date"</li>
          <li><strong>Async validation:</strong> Email field checks if already taken (try <code>admin@example.com</code>)</li>
          <li><strong>Conditional visibility:</strong> "City" appears when "Country" is selected; "Referral Code" appears only when Role = Admin</li>
          <li><strong>Cascading SmartSelect:</strong> Country → City (city list filters by country)</li>
          <li><strong>Submit pipeline:</strong> Confirmation modal → async action → success toast → form reset</li>
          <li><strong>Layout:</strong> Side-by-side fields via <code>layout</code> prop</li>
        </ul>
      </div>
      <FormBuilder
        config={registrationWithLogging}
        layout={registrationLayout}
        submitLabel="Register"
        submittingLabel="Registering…"
        onCancel={() => goTo(basePath)}
        cancelLabel="Back"
        showToast={(opts) => showToast({ ...opts, message: opts.message ?? "" })}
        style={{ maxWidth: 720 }}
      />
    </div>
  );

  const demo2Tab = (
    <div>
      <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--pui-surface-alt, #f5f5f5)", borderRadius: 8, fontSize: 13 }}>
        <strong>Demo 2 — Hook-based useFormBuilder()</strong><br />
        This form uses the <code>useFormBuilder()</code> hook for full layout control.
        Individual <code>&lt;FormField&gt;</code> components are placed manually. Features:
        <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
          <li><strong>Conditional fields:</strong> "Please specify" appears when Subject = "Other"</li>
          <li><strong>Conditional fields:</strong> "Attachment URL" appears for Support/Billing subjects</li>
          <li><strong>URL validation:</strong> Attachment URL validates URL format</li>
          <li><strong>Custom submit:</strong> Direct <code>fb.form.handleSubmit()</code> access for custom logic</li>
          <li><strong>Default values:</strong> Priority defaults to "Normal"</li>
        </ul>
      </div>
      <ContactFormDemo onSubmitted={logSubmission} />
    </div>
  );

  const demo3Tab = (
    <div>
      <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--pui-surface-alt, #f5f5f5)", borderRadius: 8, fontSize: 13 }}>
        <strong>Demo 3 — Minimal Form (No layout config)</strong><br />
        Only 3 fields, no <code>layout</code> prop. Each field renders as its own row automatically.
        Demonstrates the simplest possible usage:
        <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
          <li><strong>Select, Textarea, Checkbox:</strong> Minimal field types</li>
          <li><strong>Auto layout:</strong> One field per row when no layout specified</li>
          <li><strong>Fast submit:</strong> 500ms simulated delay</li>
        </ul>
      </div>
      <FormBuilder
        config={feedbackWithLogging}
        submitLabel="Submit Feedback"
        showToast={(opts) => showToast({ ...opts, message: opts.message ?? "" })}
        style={{ maxWidth: 480 }}
      />
    </div>
  );

  const submissionsTab =
    submissions.length === 0 ? (
      <div style={{ padding: 32, textAlign: "center", color: "var(--pui-text-muted)" }}>
        No submissions yet. Submit any of the demo forms to see entries here.
      </div>
    ) : (
      <Table
        columns={submissionColumns}
        data={submissions}
        rowKey={(r) => r.id}
        striped
        emptyMessage="No submissions yet."
      />
    );

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0 }}>FormBuilder Demo</h2>
          <p style={{ margin: "4px 0 0", color: "var(--pui-text-muted)", fontSize: 14 }}>
            Comprehensive demonstration of all form builder features, validation types, and usage patterns.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => goTo(basePath)}>
          ← Back to List
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: "demo1", label: "Full Declarative", content: demo1Tab },
          { id: "demo2", label: "Hook-based", content: demo2Tab },
          { id: "demo3", label: "Minimal", content: demo3Tab },
          { id: "submissions", label: `Submissions (${submissions.length})`, content: submissionsTab },
        ]}
        defaultTab="demo1"
      />

      <ToastContainer />
    </div>
  );
};

export default FormBuilderDemoPage;
