/**
 * @mfe/platform-ui
 *
 * Shared UI component library for all MFEs.
 * Import the theme CSS in your shell/app entry point:
 *   import "@mfe/platform-ui/src/theme.css";
 *
 * Each component now lives in its own folder under components/ and imports
 * its own CSS — no single monolithic styles.css needed.
 */

// ── Components ────────────────────────────────────────────────────────────────
export { Button } from "./components/Button";
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
} from "./components/Button";

export { Input } from "./components/Input";
export type { InputProps } from "./components/Input";

export { Select } from "./components/Select";
export type { SelectProps, SelectOption } from "./components/Select";

export { MultiSelect } from "./components/MultiSelect";
export type {
  MultiSelectProps,
  MultiSelectOption,
} from "./components/MultiSelect";

export { DatePicker } from "./components/DatePicker";
export type { DatePickerProps } from "./components/DatePicker";

export { Table } from "./components/Table";
export type { TableProps, TableColumn } from "./components/Table";

export { Modal } from "./components/Modal";
export type { ModalProps } from "./components/Modal";

export { ToastContainer, showToast } from "./components/Toast";
export type {
  ToastItem,
  ToastVariant,
  ToastContainerProps,
} from "./components/Toast";

export { Loader } from "./components/Loader";
export type { LoaderProps, LoaderSize } from "./components/Loader";

export { Tabs } from "./components/Tabs";
export type { TabsProps, Tab } from "./components/Tabs";

export { Form, FormGroup, FormRow, FormActions } from "./components/Form";
export type { FormProps } from "./components/Form";

export { SmartSelect } from "./components/SmartSelect";
export type {
  SmartSelectProps,
  SmartOption,
  DataSource,
  ApiDataSource,
  StaticDataSource,
} from "./components/SmartSelect";

// ── New: Checkbox, TextArea, FormField, FormBuilder ───────────────────────
export { Checkbox } from "./components/Checkbox";
export type { CheckboxProps } from "./components/Checkbox";

export { TextArea } from "./components/TextArea";
export type { TextAreaProps } from "./components/TextArea";

export { FormField } from "./components/FormField";
export type { FormFieldProps } from "./components/FormField";

export { FormBuilder, useFormBuilder } from "./components/FormBuilder";
export type {
  FormBuilderProps,
  FieldLayout,
  UseFormBuilderReturn,
  FormFieldBinding,
} from "./components/FormBuilder";

// ── PageLayout ────────────────────────────────────────────────────────────
export { PageLayout } from "./components/PageLayout";
export type { PageLayoutProps, Breadcrumb } from "./components/PageLayout";

// ── TableBuilder ──────────────────────────────────────────────────────────
export { TableBuilder } from "./components/TableBuilder";
export type {
  TableBuilderProps,
  TableBuilderColumn,
  TableRowAction,
} from "./components/TableBuilder";

// ── DetailView ────────────────────────────────────────────────────────────
export { DetailView } from "./components/DetailView";
export type {
  DetailViewProps,
  DetailField,
  DetailAction,
} from "./components/DetailView";

// ── Hooks ─────────────────────────────────────────────────────────────────
export { useApi, useApiMutation, clearApiCache } from "./hooks";
export type {
  UseApiOptions,
  UseApiFetcherOptions,
  UseApiReturn,
  UseApiMutationOptions,
  UseApiMutationReturn,
} from "./hooks";

export { useMfeRouter } from "./hooks";
export type { UseMfeRouterOptions, UseMfeRouterReturn } from "./hooks";

// ── createMfeApp ──────────────────────────────────────────────────────────
export { createMfeApp } from "./create-mfe-app";
export type { CreateMfeAppOptions, MfeBootstrap } from "./create-mfe-app";
