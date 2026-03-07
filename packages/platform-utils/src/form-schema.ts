/**
 * @mfe/platform-utils — FormSchema
 *
 * Declarative form configuration that compiles to a Zod schema.
 * Use `defineFormSchema()` to declare fields, validation rules,
 * cross-field dependencies, async validators, conditional visibility,
 * and a submit pipeline — all from a single config object.
 *
 * The resulting schema is consumed by `useFormBuilder()` / `<FormBuilder>`
 * from @mfe/platform-ui to wire up react-hook-form automatically.
 */

import { z } from "zod/v4";

// ═══════════════════════════════════════════════════════════════════════════
//  Public types
// ═══════════════════════════════════════════════════════════════════════════

/** Supported field types — maps to platform-ui components. */
export type FieldType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "select"
  | "multiselect"
  | "smartselect"
  | "date"
  | "checkbox"
  | "textarea";

// ── Validation rules ──────────────────────────────────────────────────────

export type FieldRule =
  | { rule: "required"; message?: string }
  | { rule: "minLength"; params: number; message?: string }
  | { rule: "maxLength"; params: number; message?: string }
  | { rule: "min"; params: number; message?: string }
  | { rule: "max"; params: number; message?: string }
  | { rule: "pattern"; params: RegExp; message?: string }
  | { rule: "email"; message?: string }
  | { rule: "url"; message?: string }
  | { rule: "phone"; message?: string }
  | {
      rule: "custom";
      validate: (value: unknown) => boolean | string;
      message?: string;
    };

// ── Cross-field dependency ────────────────────────────────────────────────

export type DependsOn =
  | {
      field: string;
      rule: "matchField";
      message?: string;
    }
  | {
      field: string;
      rule: "afterDate";
      message?: string;
    }
  | {
      field: string;
      rule: "beforeDate";
      message?: string;
    }
  | {
      field: string;
      rule: "greaterThan";
      message?: string;
    }
  | {
      field: string;
      rule: "lessThan";
      message?: string;
    }
  | {
      field: string;
      rule: "custom";
      validate: (
        value: unknown,
        depValue: unknown,
        allValues: Record<string, unknown>,
      ) => boolean | string;
      message?: string;
    };

// ── Conditional visibility ────────────────────────────────────────────────

export type VisibleWhen =
  | { field: string; operator: "eq"; value: unknown }
  | { field: string; operator: "neq"; value: unknown }
  | { field: string; operator: "in"; value: unknown[] }
  | { field: string; operator: "notIn"; value: unknown[] }
  | { field: string; operator: "truthy" }
  | {
      field: string;
      operator: "custom";
      test: (depValue: unknown, allValues: Record<string, unknown>) => boolean;
    };

// ── Async validation ─────────────────────────────────────────────────────

export interface AsyncValidation {
  /** Return `true` if valid, or an error message string if invalid. */
  validate: (
    value: unknown,
    allValues: Record<string, unknown>,
  ) => Promise<true | string>;
  /** Debounce period in ms (default 400). */
  debounceMs?: number;
}

// ── Field definition ─────────────────────────────────────────────────────

export interface FieldDef {
  type: FieldType;
  label: string;
  defaultValue?: unknown;
  placeholder?: string;
  disabled?: boolean;
  /** Synchronous validation rules. */
  rules?: FieldRule[];
  /** Cross-field dependent validation. */
  dependsOn?: DependsOn | DependsOn[];
  /** Conditional visibility based on another field. */
  visibleWhen?: VisibleWhen | VisibleWhen[];
  /** Async server-side validation. */
  asyncValidation?: AsyncValidation;
  /** Extra props forwarded to the underlying UI component. */
  componentProps?: Record<string, unknown>;
}

// ── Submit pipeline ──────────────────────────────────────────────────────

export interface SubmitConfig<
  TValues = Record<string, unknown>,
  TResult = unknown,
> {
  /** Transform form values before executing the action. */
  transform?: (values: TValues) => TValues | Record<string, unknown>;
  /** The submit action (e.g. API call). */
  action: (values: TValues) => Promise<TResult>;
  /** Called after a successful submit. */
  onSuccess?: (result: TResult, helpers: SubmitHelpers) => void;
  /** Called when the action throws. */
  onError?: (error: unknown, helpers: SubmitHelpers) => void;
  /** If set, a confirmation prompt is shown before executing. */
  confirmMessage?: string;
}

export interface SubmitHelpers {
  reset: () => void;
  showToast: (opts: {
    variant: "success" | "error" | "info";
    title: string;
    message?: string;
  }) => void;
  navigate?: (path: string) => void;
}

// ── Top-level form config ────────────────────────────────────────────────

export interface FormConfig<TValues = Record<string, unknown>> {
  fields: Record<string, FieldDef>;
  submit?: SubmitConfig<TValues>;
}

// ── Output type from defineFormSchema ────────────────────────────────────

export interface FormSchemaResult<TValues = Record<string, unknown>> {
  schema: z.ZodObject<Record<string, z.ZodTypeAny>>;
  fieldsMeta: Record<string, FieldDef>;
  defaultValues: Record<string, unknown>;
  submitConfig?: SubmitConfig<TValues>;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Core builder function
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build a Zod schema + metadata from a declarative form config.
 *
 * ```ts
 * const formDef = defineFormSchema({
 *   fields: {
 *     email: { type: 'email', label: 'Email', rules: [{ rule: 'required' }, { rule: 'email' }] },
 *     age:   { type: 'number', label: 'Age', rules: [{ rule: 'min', params: 18, message: 'Must be 18+' }] },
 *   },
 * });
 * ```
 */
export function defineFormSchema<TValues = Record<string, unknown>>(
  config: FormConfig<TValues>,
): FormSchemaResult<TValues> {
  const shape: Record<string, z.ZodTypeAny> = {};
  const defaults: Record<string, unknown> = {};

  // ── Per-field Zod schemas ──────────────────────────────────────────────

  for (const [name, field] of Object.entries(config.fields)) {
    shape[name] = buildFieldSchema(name, field);
    defaults[name] = getDefaultValue(field);
  }

  // ── Cross-field refinements (superRefine) ──────────────────────────────

  let schema: z.ZodTypeAny = z.object(shape);

  const crossFieldEntries = Object.entries(config.fields).filter(
    ([, f]) => f.dependsOn != null,
  );

  if (crossFieldEntries.length > 0) {
    schema = (schema as z.ZodObject<Record<string, z.ZodTypeAny>>).superRefine(
      (data: Record<string, unknown>, ctx: z.RefinementCtx) => {
        for (const [name, field] of crossFieldEntries) {
          const deps = Array.isArray(field.dependsOn)
            ? field.dependsOn
            : [field.dependsOn!];

          for (const dep of deps) {
            const error = evaluateDependsOn(
              dep,
              data[name],
              data[dep.field],
              data,
            );
            if (error) {
              ctx.addIssue({
                code: "custom",
                path: [name],
                message: error,
              });
            }
          }
        }
      },
    );
  }

  return {
    schema: schema as z.ZodObject<Record<string, z.ZodTypeAny>>,
    fieldsMeta: config.fields,
    defaultValues: defaults,
    submitConfig: config.submit as SubmitConfig<TValues> | undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  Internal helpers
// ═══════════════════════════════════════════════════════════════════════════

function getDefaultValue(field: FieldDef): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue;
  switch (field.type) {
    case "checkbox":
      return false;
    case "number":
      return "";
    case "multiselect":
      return [];
    default:
      return "";
  }
}

/**
 * Build a Zod schema for a single field from its rules array.
 * Chains refinements so we get precise per-rule error messages.
 */
function buildFieldSchema(name: string, field: FieldDef): z.ZodTypeAny {
  const rules = field.rules ?? [];
  const label = field.label ?? name;

  // ── Determine base type ────────────────────────────────────────────────
  let base: z.ZodTypeAny;

  switch (field.type) {
    case "checkbox":
      base = z.boolean();
      break;

    case "multiselect":
      base = z.array(z.string());
      break;

    case "number": {
      // We store numbers as strings in the form, parse them with a refine.
      // But we start with z.union to allow both string→number coercion scenarios.
      const hasRequired = rules.some((r) => r.rule === "required");
      if (hasRequired) {
        base = z
          .string()
          .min(
            1,
            rules.find((r) => r.rule === "required")?.message ??
              `${label} is required.`,
          );
      } else {
        base = z.string();
      }
      break;
    }

    default: {
      // text, email, password, select, smartselect, date, textarea
      const hasRequired = rules.some((r) => r.rule === "required");
      if (hasRequired) {
        base = z
          .string()
          .min(
            1,
            rules.find((r) => r.rule === "required")?.message ??
              `${label} is required.`,
          );
      } else {
        base = z.string();
      }
      break;
    }
  }

  // ── Apply rules as refine() chains ─────────────────────────────────────

  let current: z.ZodTypeAny = base;

  for (const rule of rules) {
    // Skip 'required' — already handled above in the base type.
    if (rule.rule === "required") continue;

    current = applyRule(current, rule, label, field.type);
  }

  return current;
}

function applyRule(
  schema: z.ZodTypeAny,
  rule: FieldRule,
  label: string,
  fieldType: FieldType,
): z.ZodTypeAny {
  switch (rule.rule) {
    case "minLength":
      return schema.refine(
        (v: unknown) => typeof v === "string" && v.length >= rule.params,
        {
          message:
            rule.message ??
            `${label} must be at least ${rule.params} characters.`,
        },
      );

    case "maxLength":
      return schema.refine(
        (v: unknown) =>
          typeof v === "string" && (v.length === 0 || v.length <= rule.params),
        {
          message:
            rule.message ??
            `${label} must be at most ${rule.params} characters.`,
        },
      );

    case "min":
      return schema.refine(
        (v: unknown) => {
          if (typeof v === "string" && v.trim() === "") return true; // skip empty (use required for mandatory)
          const num = Number(v);
          return !isNaN(num) && num >= rule.params;
        },
        {
          message: rule.message ?? `${label} must be at least ${rule.params}.`,
        },
      );

    case "max":
      return schema.refine(
        (v: unknown) => {
          if (typeof v === "string" && v.trim() === "") return true;
          const num = Number(v);
          return !isNaN(num) && num <= rule.params;
        },
        { message: rule.message ?? `${label} must be at most ${rule.params}.` },
      );

    case "pattern":
      return schema.refine(
        (v: unknown) =>
          typeof v === "string" && (v.length === 0 || rule.params.test(v)),
        { message: rule.message ?? `${label} format is invalid.` },
      );

    case "email":
      return schema.refine(
        (v: unknown) => {
          if (typeof v !== "string" || v.length === 0) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        { message: rule.message ?? "Please enter a valid email address." },
      );

    case "url":
      return schema.refine(
        (v: unknown) => {
          if (typeof v !== "string" || v.length === 0) return true;
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        { message: rule.message ?? "Please enter a valid URL." },
      );

    case "phone":
      return schema.refine(
        (v: unknown) => {
          if (typeof v !== "string" || v.length === 0) return true;
          const digits = v.replace(/[\s\-()+ ]/g, "");
          return /^\d{7,15}$/.test(digits);
        },
        { message: rule.message ?? "Please enter a valid phone number." },
      );

    case "custom":
      return schema.superRefine((v: unknown, ctx: z.RefinementCtx) => {
        const result = rule.validate(v);
        if (result === true || result === "") return;
        const msg =
          rule.message ??
          (typeof result === "string" ? result : `${label} is invalid.`);
        ctx.addIssue({ code: "custom", message: msg });
      });

    default:
      return schema;
  }
}

function evaluateDependsOn(
  dep: DependsOn,
  value: unknown,
  depValue: unknown,
  allValues: Record<string, unknown>,
): string | null {
  switch (dep.rule) {
    case "matchField":
      if (value !== depValue) {
        return dep.message ?? `Must match ${dep.field}.`;
      }
      return null;

    case "afterDate": {
      if (!value || !depValue) return null;
      if (new Date(String(value)) <= new Date(String(depValue))) {
        return dep.message ?? `Must be after ${dep.field}.`;
      }
      return null;
    }

    case "beforeDate": {
      if (!value || !depValue) return null;
      if (new Date(String(value)) >= new Date(String(depValue))) {
        return dep.message ?? `Must be before ${dep.field}.`;
      }
      return null;
    }

    case "greaterThan": {
      if (!value || !depValue) return null;
      if (Number(value) <= Number(depValue)) {
        return dep.message ?? `Must be greater than ${dep.field}.`;
      }
      return null;
    }

    case "lessThan": {
      if (!value || !depValue) return null;
      if (Number(value) >= Number(depValue)) {
        return dep.message ?? `Must be less than ${dep.field}.`;
      }
      return null;
    }

    case "custom": {
      const result = dep.validate(value, depValue, allValues);
      if (result === true) return null;
      return typeof result === "string" ? result : (dep.message ?? "Invalid.");
    }

    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Visibility evaluator (used by useFormBuilder at runtime)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Evaluate whether a field is visible based on its `visibleWhen` config
 * and the current form values. If no `visibleWhen` is set, returns `true`.
 */
export function evaluateVisibility(
  field: FieldDef,
  allValues: Record<string, unknown>,
): boolean {
  if (!field.visibleWhen) return true;

  const conditions = Array.isArray(field.visibleWhen)
    ? field.visibleWhen
    : [field.visibleWhen];

  // ALL conditions must be true (AND logic)
  return conditions.every((cond) => {
    const depVal = allValues[cond.field];

    switch (cond.operator) {
      case "eq":
        return depVal === cond.value;
      case "neq":
        return depVal !== cond.value;
      case "in":
        return (cond.value as unknown[]).includes(depVal);
      case "notIn":
        return !(cond.value as unknown[]).includes(depVal);
      case "truthy":
        return Boolean(depVal);
      case "custom":
        return cond.test(depVal, allValues);
      default:
        return true;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//  Adapter: bridge existing ValidationResult validators to Zod refine
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert a `ValidationResult`-returning function (from validation-utils)
 * into a Zod `.refine()` compatible callback.
 *
 * ```ts
 * import { required, toZodRefine } from '@mfe/platform-utils';
 * const schema = z.string().refine(...toZodRefine(required));
 * ```
 */
export function toZodRefine(
  validator: (
    value: unknown,
    ...args: unknown[]
  ) => { valid: boolean; message?: string },
  ...extraArgs: unknown[]
): [(value: unknown) => boolean, { message: string }] {
  return [
    (value: unknown) => {
      const result = validator(value, ...extraArgs);
      return result.valid;
    },
    {
      message: (() => {
        const result = validator("", ...extraArgs);
        return result.valid ? "" : (result as { message: string }).message;
      })(),
    },
  ];
}
