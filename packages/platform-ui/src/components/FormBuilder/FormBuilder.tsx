/**
 * FormBuilder — Fully declarative form renderer.
 *
 * Pass a `FormConfig` and get a complete form with fields, validation,
 * confirmation modal, loading state, and toast notifications — all wired up
 * automatically.
 *
 * For custom layouts, use `useFormBuilder()` with `<FormField>` instead.
 *
 * ```tsx
 * <FormBuilder
 *   config={myFormConfig}
 *   layout={[['name', 'email'], ['password', 'confirmPassword'], ['notes']]}
 *   submitLabel="Create Account"
 *   onCancel={() => navigate('/')}
 * />
 * ```
 */

import React from "react";
import { useFormBuilder, type UseFormBuilderReturn } from "./useFormBuilder";
import { FormField } from "../FormField";
import { Form, FormGroup, FormRow, FormActions } from "../Form";
import { Button } from "../Button";
import { Modal } from "../Modal";
import type { FormConfig, FormSchemaResult } from "@mfe/platform-utils";

// ═══════════════════════════════════════════════════════════════════════════
//  Types
// ═══════════════════════════════════════════════════════════════════════════

export type FieldLayout = string | string[];

export interface FormBuilderProps {
  /** The form configuration object. */
  config: FormConfig | FormSchemaResult;

  /**
   * Layout specification. Each entry is either:
   *   - A single field name (rendered as its own row)
   *   - An array of field names (rendered side-by-side in a row)
   *
   * If omitted, each field is rendered as its own row in config order.
   *
   * ```ts
   * layout={[['firstName', 'lastName'], 'email', ['city', 'state', 'zip']]}
   * ```
   */
  layout?: FieldLayout[];

  /** Label for the submit button (default: "Submit"). */
  submitLabel?: string;

  /** Loading label for the submit button (default: "Submitting…"). */
  submittingLabel?: string;

  /** Show a cancel button. Called when clicked. */
  onCancel?: () => void;

  /** Label for the cancel button (default: "Cancel"). */
  cancelLabel?: string;

  /** External navigation function (passed to submit helpers). */
  navigate?: (path: string) => void;

  /** External showToast function (passed to submit helpers). */
  showToast?: (opts: { variant: "success" | "error" | "info"; title: string; message?: string }) => void;

  /** Extra className on the <Form> wrapper. */
  className?: string;

  /** Extra style on the <Form> wrapper. */
  style?: React.CSSProperties;

  /**
   * Render prop for complete layout control while still using
   * useFormBuilder internally. If provided, replaces default rendering.
   */
  children?: (fb: UseFormBuilderReturn) => React.ReactNode;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Component
// ═══════════════════════════════════════════════════════════════════════════

export const FormBuilder: React.FC<FormBuilderProps> = ({
  config,
  layout,
  submitLabel = "Submit",
  submittingLabel = "Submitting…",
  onCancel,
  cancelLabel = "Cancel",
  navigate,
  showToast,
  className,
  style,
  children,
}) => {
  const fb = useFormBuilder(config, { navigate, showToast });

  // ── Render-prop escape hatch ──────────────────────────────────────────
  if (children) {
    return <>{children(fb)}</>;
  }

  // ── Build the layout ──────────────────────────────────────────────────
  const rows = buildRows(layout, fb);

  return (
    <>
      <Form onSubmit={fb.handleSubmit} className={className} style={style}>
        {rows.map((row, rowIdx) => (
          <FormRow key={rowIdx}>
            {row.map((fieldName) => {
              const binding = fb.fields[fieldName];
              if (!binding) return null;
              return (
                <FormGroup key={fieldName}>
                  <FormField
                    name={fieldName}
                    fieldDef={binding.fieldDef}
                    control={fb.control}
                    error={binding.error}
                    visible={binding.visible}
                    asyncValidating={binding.asyncValidating}
                  />
                </FormGroup>
              );
            })}
          </FormRow>
        ))}

        {/* Submit error banner */}
        {fb.submitError && (
          <div
            style={{
              padding: "var(--pui-space-sm) var(--pui-space-md)",
              background: "var(--pui-error-bg, #fee)",
              color: "var(--pui-error, #d32f2f)",
              borderRadius: "var(--pui-radius-md)",
              fontSize: "var(--pui-font-size-sm)",
              marginBottom: "var(--pui-space-md)",
            }}
          >
            {fb.submitError}
          </div>
        )}

        <FormActions>
          {onCancel && (
            <Button variant="secondary" type="button" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" loading={fb.isSubmitting}>
            {fb.isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </FormActions>
      </Form>

      {/* Confirmation modal */}
      {fb.confirmMessage && (
        <Modal
          open={fb.isConfirmOpen}
          onClose={fb.cancelConfirm}
          title="Confirm"
          footer={
            <>
              <Button variant="secondary" onClick={fb.cancelConfirm}>
                Cancel
              </Button>
              <Button onClick={fb.confirmSubmit}>Confirm</Button>
            </>
          }
        >
          <p style={{ margin: 0 }}>{fb.confirmMessage}</p>
        </Modal>
      )}
    </>
  );
};

FormBuilder.displayName = "FormBuilder";

// ═══════════════════════════════════════════════════════════════════════════
//  Layout helpers
// ═══════════════════════════════════════════════════════════════════════════

function buildRows(
  layout: FieldLayout[] | undefined,
  fb: UseFormBuilderReturn,
): string[][] {
  if (layout) {
    return layout.map((entry) => (typeof entry === "string" ? [entry] : entry));
  }

  // Default: each field in its own row, in config order
  return fb.fieldNames.map((name) => [name]);
}
