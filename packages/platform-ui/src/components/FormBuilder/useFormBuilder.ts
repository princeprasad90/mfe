/**
 * useFormBuilder — The main hook for declarative forms.
 *
 * Accepts a `FormConfig` (or a pre-compiled `FormSchemaResult`),
 * wires up react-hook-form with zodResolver, handles conditional
 * visibility, async validation, and a submit action pipeline.
 *
 * Usage:
 * ```tsx
 * const fb = useFormBuilder(myFormConfig);
 * // Then use <FormBuilder> for auto-rendering, or build custom layouts
 * // using fb.fields, fb.control, fb.handleSubmit, etc.
 * ```
 */

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  useForm,
  useWatch,
  type UseFormReturn,
  type FieldValues,
  type FieldError,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  defineFormSchema,
  evaluateVisibility,
  type FormConfig,
  type FormSchemaResult,
  type FieldDef,
  type SubmitHelpers,
} from "@mfe/platform-utils";

// ═══════════════════════════════════════════════════════════════════════════
//  Types
// ═══════════════════════════════════════════════════════════════════════════

export interface FormFieldBinding {
  name: string;
  fieldDef: FieldDef;
  error?: FieldError;
  visible: boolean;
  asyncValidating: boolean;
}

export interface UseFormBuilderReturn {
  /** Per-field binding objects ready for <FormField>. */
  fields: Record<string, FormFieldBinding>;
  /** Ordered field names (same order as config.fields keys). */
  fieldNames: string[];
  /** The raw react-hook-form return for escape-hatch usage. */
  form: UseFormReturn<FieldValues>;
  /** The RHF control object. */
  control: UseFormReturn<FieldValues>["control"];
  /** Wrapped submit handler (runs transform → confirm → action → callbacks). */
  handleSubmit: (e?: React.BaseSyntheticEvent) => void;
  /** Whether the form is currently submitting. */
  isSubmitting: boolean;
  /** Whether a confirm prompt is currently shown. */
  isConfirmOpen: boolean;
  /** Call to confirm the pending submit. */
  confirmSubmit: () => void;
  /** Call to cancel the pending submit. */
  cancelConfirm: () => void;
  /** The confirm message text (if any). */
  confirmMessage?: string;
  /** Reset the form to default values. */
  reset: () => void;
  /** General submit error (non-field-specific). */
  submitError: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Hook
// ═══════════════════════════════════════════════════════════════════════════

export function useFormBuilder(
  config: FormConfig | FormSchemaResult,
  options?: {
    /** External navigation function (for submit helpers). */
    navigate?: (path: string) => void;
    /** External showToast function (for submit helpers). */
    showToast?: (opts: {
      variant: "success" | "error" | "info";
      title: string;
      message?: string;
    }) => void;
  },
): UseFormBuilderReturn {
  // ── Compile config if raw FormConfig was passed ────────────────────────
  const compiled = useMemo(() => {
    if ("schema" in config && "fieldsMeta" in config) {
      return config as FormSchemaResult;
    }
    return defineFormSchema(config as FormConfig);
  }, [config]);

  const { schema, fieldsMeta, defaultValues, submitConfig } = compiled;

  // ── react-hook-form setup ──────────────────────────────────────────────
  const form = useForm<FieldValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as Record<string, unknown>,
    mode: "onTouched",
  });

  const { control, formState, setError, clearErrors, reset: rhfReset } = form;

  // ── Watch all values for visibility & cross-field deps ─────────────────
  const watchedValues = useWatch({ control }) as Record<string, unknown>;

  // ── Async validation state ─────────────────────────────────────────────
  const [asyncStates, setAsyncStates] = useState<Record<string, boolean>>({});
  const asyncTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Run async validators on value changes (debounced)
  useEffect(() => {
    for (const [name, field] of Object.entries(fieldsMeta)) {
      if (!field.asyncValidation) continue;
      const value = watchedValues[name];

      // Clear previous timer
      if (asyncTimers.current[name]) {
        clearTimeout(asyncTimers.current[name]);
      }

      // Don't validate empty non-required fields
      if (value === "" || value === undefined || value === null) {
        clearErrors(name);
        setAsyncStates((prev) => ({ ...prev, [name]: false }));
        continue;
      }

      const debounceMs = field.asyncValidation.debounceMs ?? 400;

      asyncTimers.current[name] = setTimeout(async () => {
        setAsyncStates((prev) => ({ ...prev, [name]: true }));
        try {
          const result = await field.asyncValidation!.validate(
            value,
            watchedValues,
          );
          if (result === true) {
            clearErrors(name);
          } else {
            setError(name, { type: "async", message: result });
          }
        } catch {
          setError(name, { type: "async", message: "Validation failed." });
        } finally {
          setAsyncStates((prev) => ({ ...prev, [name]: false }));
        }
      }, debounceMs);
    }

    // Clean up timers on unmount
    return () => {
      for (const timer of Object.values(asyncTimers.current)) {
        clearTimeout(timer);
      }
    };
    // Re-run when watched values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  // ── Build field bindings ────────────────────────────────────────────────
  const fieldNames = useMemo(() => Object.keys(fieldsMeta), [fieldsMeta]);

  const fields = useMemo(() => {
    const result: Record<string, FormFieldBinding> = {};

    for (const name of fieldNames) {
      const fieldDef = fieldsMeta[name];
      const visible = evaluateVisibility(fieldDef, watchedValues);
      const error = formState.errors[name] as FieldError | undefined;
      const asyncValidating = asyncStates[name] ?? false;

      result[name] = { name, fieldDef, error, visible, asyncValidating };
    }

    return result;
  }, [fieldNames, fieldsMeta, watchedValues, formState.errors, asyncStates]);

  // ── Submit pipeline ────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const pendingValues = useRef<FieldValues | null>(null);

  const submitHelpers: SubmitHelpers = useMemo(
    () => ({
      reset: () => rhfReset(defaultValues as Record<string, unknown>),
      showToast: options?.showToast ?? (() => {}),
      navigate: options?.navigate,
    }),
    [rhfReset, defaultValues, options?.showToast, options?.navigate],
  );

  const executeSubmit = useCallback(
    async (values: FieldValues) => {
      if (!submitConfig?.action) return;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        // Transform
        const transformed = submitConfig.transform
          ? submitConfig.transform(values as Record<string, unknown>)
          : values;

        // Execute action
        const result = await submitConfig.action(
          transformed as Record<string, unknown>,
        );

        // Success callback
        submitConfig.onSuccess?.(result, submitHelpers);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setSubmitError(msg);
        submitConfig.onError?.(err, submitHelpers);
      } finally {
        setIsSubmitting(false);
      }
    },
    [submitConfig, submitHelpers],
  );

  const handleSubmit = useCallback(
    (e?: React.BaseSyntheticEvent) => {
      form.handleSubmit((values) => {
        if (submitConfig?.confirmMessage) {
          pendingValues.current = values;
          setIsConfirmOpen(true);
        } else {
          executeSubmit(values);
        }
      })(e);
    },
    [form, submitConfig, executeSubmit],
  );

  const confirmSubmit = useCallback(() => {
    setIsConfirmOpen(false);
    if (pendingValues.current) {
      executeSubmit(pendingValues.current);
      pendingValues.current = null;
    }
  }, [executeSubmit]);

  const cancelConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    pendingValues.current = null;
  }, []);

  const reset = useCallback(() => {
    rhfReset(defaultValues as Record<string, unknown>);
    setSubmitError(null);
  }, [rhfReset, defaultValues]);

  return {
    fields,
    fieldNames,
    form,
    control,
    handleSubmit,
    isSubmitting,
    isConfirmOpen,
    confirmSubmit,
    cancelConfirm,
    confirmMessage: submitConfig?.confirmMessage,
    reset,
    submitError,
  };
}
