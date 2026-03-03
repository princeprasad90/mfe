/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_CBMS_REMOTE_ENTRY: string;
  readonly VITE_CDTS_REMOTE_ENTRY: string;
  readonly VITE_PRODUCTS_REMOTE_ENTRY: string;
  // Add other environment variables here as needed
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}