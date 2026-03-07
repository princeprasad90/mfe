/**
 * @mfe/platform-utils
 *
 * Reusable utility functions shared across all MFEs.
 */

// ── DateUtils ─────────────────────────────────────────────────────────────────
export {
  formatDate,
  formatDateTime,
  toISODate,
  timeAgo,
  isValidDate,
  diffInDays,
} from "./date-utils";

// ── ValidationUtils ───────────────────────────────────────────────────────────
export {
  required,
  isEmail,
  minLength,
  maxLength,
  matchesPattern,
  inRange,
  validate,
  isUrl,
  isPhone,
} from "./validation-utils";
export type { ValidationResult } from "./validation-utils";

// ── StorageUtils ──────────────────────────────────────────────────────────────
export {
  storageGet,
  storageSet,
  storageRemove,
  storageClearByPrefix,
  storageHas,
} from "./storage-utils";

// ── FormatUtils ───────────────────────────────────────────────────────────────
export {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatCompact,
  truncate,
  titleCase,
  slugify,
  mask,
  pluralise,
  formatBytes,
} from "./format-utils";

// ── FormSchema ────────────────────────────────────────────────────────────────
export {
  defineFormSchema,
  evaluateVisibility,
  toZodRefine,
} from "./form-schema";
export type {
  FieldType,
  FieldRule,
  FieldDef,
  DependsOn,
  VisibleWhen,
  AsyncValidation,
  SubmitConfig,
  SubmitHelpers,
  FormConfig,
  FormSchemaResult,
} from "./form-schema";

// ── EncryptionUtils ───────────────────────────────────────────────────────────
export {
  base64Encode,
  base64Decode,
  sha256,
  uuid,
  xorObfuscate,
  xorDeobfuscate,
  constantTimeEqual,
} from "./encryption-utils";
