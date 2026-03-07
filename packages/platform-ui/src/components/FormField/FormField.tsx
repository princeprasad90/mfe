/**
 * FormField — Polymorphic form field renderer.
 *
 * Given a field definition (from FormSchema) and a react-hook-form
 * control instance, this component renders the correct platform-ui
 * component, wires up value/onChange/error, and handles conditional
 * visibility.
 */

import React from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type FieldError,
} from "react-hook-form";
import { Input } from "../Input";
import { TextArea } from "../TextArea";
import { Checkbox } from "../Checkbox";
import { Select } from "../Select";
import { MultiSelect } from "../MultiSelect";
import { SmartSelect } from "../SmartSelect";
import { DatePicker } from "../DatePicker";
import type { FieldDef } from "@mfe/platform-utils";
import "./FormField.styles.css";

// ═══════════════════════════════════════════════════════════════════════════
//  Types
// ═══════════════════════════════════════════════════════════════════════════

export interface FormFieldProps {
  /** The field name (key in the form config). */
  name: string;
  /** The field definition from the form schema. */
  fieldDef: FieldDef;
  /** react-hook-form control object. */
  control: Control<FieldValues>;
  /** The current error for this field (from formState.errors). */
  error?: FieldError;
  /** Whether this field is currently visible. */
  visible?: boolean;
  /** Whether the field is currently being async-validated. */
  asyncValidating?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Component
// ═══════════════════════════════════════════════════════════════════════════

export const FormField: React.FC<FormFieldProps> = ({
  name,
  fieldDef,
  control,
  error,
  visible = true,
  asyncValidating = false,
}) => {
  if (!visible) return null;

  const errorMessage = error?.message;
  const { type, label, placeholder, disabled, componentProps = {} } = fieldDef;

  // ── Render based on field type ─────────────────────────────────────────

  switch (type) {
    // ── Text / Email / Password — Input with forwardRef (register-compatible) ──
    case "text":
    case "email":
    case "password":
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <div className="pui-form-field">
              <Input
                {...field}
                type={type}
                label={label}
                placeholder={placeholder}
                disabled={disabled}
                error={errorMessage}
                {...(componentProps as Record<string, unknown>)}
              />
              {asyncValidating && <span className="pui-form-field__async-indicator">Checking…</span>}
            </div>
          )}
        />
      );

    // ── Number — Input type="number" ────────────────────────────────────────
    case "number":
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <div className="pui-form-field">
              <Input
                {...field}
                type="number"
                label={label}
                placeholder={placeholder}
                disabled={disabled}
                error={errorMessage}
                {...(componentProps as Record<string, unknown>)}
              />
              {asyncValidating && <span className="pui-form-field__async-indicator">Checking…</span>}
            </div>
          )}
        />
      );

    // ── TextArea ────────────────────────────────────────────────────────────
    case "textarea":
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <div className="pui-form-field">
              <TextArea
                {...field}
                label={label}
                placeholder={placeholder}
                disabled={disabled}
                error={errorMessage}
                {...(componentProps as Record<string, unknown>)}
              />
            </div>
          )}
        />
      );

    // ── Checkbox ───────────────────────────────────────────────────────────
    case "checkbox":
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: { value, onChange, ...rest } }) => (
            <div className="pui-form-field">
              <Checkbox
                {...rest}
                checked={Boolean(value)}
                onChange={(e) => onChange(e.target.checked)}
                label={label}
                disabled={disabled}
                error={errorMessage}
                {...(componentProps as Record<string, unknown>)}
              />
            </div>
          )}
        />
      );

    // ── Select ─────────────────────────────────────────────────────────────
    case "select":
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: { value, onChange } }) => (
            <div className="pui-form-field">
              <Select
                label={label}
                value={value ?? ""}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                error={errorMessage}
                options={[]}
                {...(componentProps as Record<string, unknown>)}
              />
            </div>
          )}
        />
      );

    // ── MultiSelect ────────────────────────────────────────────────────────
    case "multiselect":
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: { value, onChange } }) => (
            <div className="pui-form-field">
              <MultiSelect
                label={label}
                value={value ?? []}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                error={errorMessage}
                options={[]}
                {...(componentProps as Record<string, unknown>)}
              />
            </div>
          )}
        />
      );

    // ── SmartSelect ────────────────────────────────────────────────────────
    case "smartselect":
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: { value, onChange } }) => (
            <div className="pui-form-field">
              <SmartSelect
                label={label}
                value={value ?? ""}
                onChange={(val) => onChange(val)}
                placeholder={placeholder}
                disabled={disabled}
                error={errorMessage}
                dataSource={{ type: "static", data: [] }}
                {...(componentProps as Record<string, unknown>)}
              />
            </div>
          )}
        />
      );

    // ── DatePicker ─────────────────────────────────────────────────────────
    case "date":
      return (
        <Controller
          name={name}
          control={control}
          render={({ field: { value, onChange } }) => (
            <div className="pui-form-field">
              <DatePicker
                label={label}
                value={value ?? ""}
                onChange={onChange}
                placeholder={placeholder}
                error={errorMessage}
                {...(componentProps as Record<string, unknown>)}
              />
            </div>
          )}
        />
      );

    default:
      return (
        <div className="pui-form-field pui-form-field--unknown">
          Unknown field type: <code>{type}</code>
        </div>
      );
  }
};

FormField.displayName = "FormField";
