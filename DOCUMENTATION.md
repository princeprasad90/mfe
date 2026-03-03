# Repository Documentation

## 1. Overview

This repository is a Vite-only npm-workspace monorepo for a micro-frontend platform.

It contains:
- One host shell (`apps/shell`) built with React + Vite.
- Three MFEs (`apps/cbms`, `apps/cdts`, `apps/mfe-products-angular`) built with Vite federation.
- One shared package (`packages/notification-sdk`).

All host/remote integration uses one runtime model:
- Vite federation remote entries (`/assets/remoteEntry.js`)
- `get()` + `init()` container contract
- Exposed `./bootstrap` module with `mount` and optional `unmount`

No Webpack runtime path remains in the active codebase.

## 2. Workspace Layout

- `apps/shell`: Vite host shell (port 3000)
- `apps/cbms`: Vite React remote (port 3001)
- `apps/cdts`: Vite React remote (port 3002)
- `apps/mfe-products-angular`: Vite Angular remote (port 3003; legacy folder name retained)
- `packages/notification-sdk`: Shared SDK package

## 3. Root Configuration

## 3.1 `package.json`

Workspace globs:
- `apps/*`
- `packages/*`

Top-level scripts:
- `npm run dev:shell`
- `npm run dev:cbms`
- `npm run dev:cdts`
- `npm run dev:products-angular`

## 3.2 `tsconfig.json`

Shared TS settings:
- target `ES2020`
- module `ESNext`
- moduleResolution `Bundler`
- jsx `react-jsx`
- strict mode enabled
- includes `apps/**/*` and `packages/**/*`

## 3.3 `.gitignore`

Primary ignores:
- `node_modules`
- `.env`
- `dist` and app-specific `dist`
- Vite cache folders

## 4. Local Development

Install:
```bash
npm install
```

Run all apps (separate terminals):
```bash
npm run dev:cbms
npm run dev:cdts
npm run dev:products-angular
npm run dev:shell
```

Host URL:
- `http://localhost:3000`

## 5. Unified Federation Runtime

## 5.1 Host remote map

Shell defaults (`apps/shell/src/mfe-config.ts`):
- `cbms`: `http://localhost:3001/assets/remoteEntry.js`
- `cdts`: `http://localhost:3002/assets/remoteEntry.js`
- `products`: `http://localhost:3003/assets/remoteEntry.js`

Override values with env vars:
- `VITE_CBMS_REMOTE_ENTRY`
- `VITE_CDTS_REMOTE_ENTRY`
- `VITE_PRODUCTS_REMOTE_ENTRY`

## 5.2 Runtime compatibility guards

`apps/shell/src/mfe/loadRemoteVite.ts` enforces:
- `remoteEntry` must contain `/assets/remoteEntry.js`
- remote must expose container `get()`
- hybrid/non-federated container signatures throw explicit errors
- container init is cached and `already initialized` is handled

This is the permanent fix for previous cross-runtime `get()` failures.

## 5.3 Bootstrap contract

All remotes expose:
- `./bootstrap`

Module shape:
- `mount(container: HTMLElement, props?: { routePath?: string; basePath?: string })`
- optional `unmount()`

## 6. Routing Model (No Hash Hybrid)

- Host uses `BrowserRouter`.
- Host routes are wildcard paths (`/cbms/*`, `/tasks/*`, `/products/*`).
- Shell passes `routePath` + `basePath` into remote `mount`.
- Remotes navigate using `window.history.pushState` + `popstate` dispatch.
- Hash-based navigation has been removed from active MFEs.

## 7. Application Details and Functional Flows

## 7.1 Shell (`apps/shell`)

### Build/runtime stack
- Vite + React plugin + Vite federation plugin
- React Router v6

### Functional flow

1. User opens `http://localhost:3000`.
2. `src/main.tsx` loads `src/bootstrap.tsx`.
3. `bootstrap.tsx` renders `App.tsx`.
4. `App.tsx` builds wildcard routes from `mfeConfig`.
5. Selecting menu route renders `RemoteComponent`.
6. `RemoteComponent` computes current `routePath` and calls loader.
7. Loader imports remote container (`remoteEntry.js`), validates federation contract, and resolves exposed module.
8. Shell calls remote `mount(hostNode, { routePath, basePath })`.
9. On route changes/unmount, shell calls remote `unmount()` if present.
10. Any remote-load failure renders in-shell error text and logs details.

### Key files
- `src/main.tsx`
- `src/bootstrap.tsx`
- `src/App.tsx`
- `src/Menu.tsx`
- `src/RemoteComponent.tsx`
- `src/mfe-config.ts`
- `src/mfe/loadRemoteVite.ts`
- `src/styles.css`
- `vite.config.ts`

## 7.2 CBMS Remote (`apps/cbms`)

### Build/runtime stack
- Vite + React + Vite federation plugin
- Exposes `./bootstrap` from `src/bootstrap.ts`

### Functional flow

1. Standalone entry (`src/main.tsx`) mounts app into `#root`.
2. Federated host loads `./bootstrap` and calls `mount(container, props)`.
3. `CbmsApp.tsx` reads `routePath` for detail and pagination state.
4. Default view: payments listing (`PAGE_SIZE = 5`, mock dataset size 23).
5. `Details` navigates to `<basePath>/details/:id?page=n` using history API.
6. Detail view shows record metadata and supports return to listing.
7. `unmount()` destroys React root during host cleanup.

### Key files
- `src/main.tsx`
- `src/bootstrap.ts`
- `src/CbmsApp.tsx`
- `src/cbms.css`
- `vite.config.js`
- `vercel.json`

## 7.3 CDTS Remote (`apps/cdts`)

### Build/runtime stack
- Vite + React + Vite federation plugin
- Exposes `./bootstrap` from `src/bootstrap.ts`

### Functional flow

1. Standalone entry mounts via `mount(container)`.
2. Host mode mounts through exposed bootstrap module.
3. `CdtsApp.tsx` parses `routePath` for list/detail/paging state.
4. Default view: tasks listing (`PAGE_SIZE = 4`, mock dataset size 18).
5. `Details` navigates via history API to `<basePath>/details/:id?page=n`.
6. Detail view renders task metadata and back action.
7. Host cleanup triggers `unmount()`.

### Key files
- `src/main.tsx`
- `src/bootstrap.ts`
- `src/CdtsApp.tsx`
- `src/cdts.css`
- `vite.config.js`
- `vercel.json`

## 7.4 Products Remote (`apps/mfe-products-angular`)

### Runtime note
Folder name is retained for continuity. Runtime is Angular + Vite federation.

### Build/runtime stack
- Vite + Vite federation plugin + Angular runtime packages
- Exposes `./bootstrap` from `src/mfe-entry.js`
- Federation `name` remains `productsAngular` for compatibility with shell scope config

### Functional flow

1. Standalone `src/main.ts` mounts to `#root`.
2. Host mode imports remote `./bootstrap` and calls `mount(container, props)`.
3. `src/mfe-entry.js` bootstraps an Angular standalone component via `createApplication`.
4. Angular component reads `routePath` and resolves list vs details screen.
5. `Details` navigates to `<basePath>/details/:id` via history API.
6. Detail view shows selected product and back action.
7. `unmount()` destroys Angular app ref and removes mount node during host cleanup.

### Key files
- `src/main.ts`
- `src/mfe-entry.js`
- `vite.config.mts`
- `vercel.json`

## 8. Shared Package: Notification SDK

Package: `@mfe/notification-sdk`

Exports:
- `notify({ title, message, variant })`

Variants:
- `info`, `success`, `warning`, `error`

Functional flow:
1. Consumer calls `notify(...)`.
2. SDK ensures a fixed container (`#mfe-notification-container`) exists.
3. SDK appends toast with variant color accents.
4. Toast fades and is removed automatically.

Files:
- `packages/notification-sdk/src/index.ts`
- `packages/notification-sdk/src/index.js`

## 9. Deployment Notes

`vercel.json` exists in each remote app and sets:
- `Access-Control-Allow-Origin: *`

Each remote must publish Vite federation assets so shell can fetch:
- `/assets/remoteEntry.js`

## 10. Commands Reference

From root:

```bash
npm install
npm run dev:shell
npm run dev:cbms
npm run dev:cdts
npm run dev:products-angular
npm run build -w apps/shell
npm run build -w apps/cbms
npm run build -w apps/cdts
npm run build -w apps/mfe-products-angular
npm run preview -w apps/shell
npm run preview -w apps/cbms
npm run preview -w apps/cdts
npm run preview -w apps/mfe-products-angular
```

## 11. Complete File Inventory

## Root
- `.gitignore`
- `DOCUMENTATION.md`
- `README.md`
- `package.json`
- `package-lock.json`
- `tsconfig.json`

## `apps/shell`
- `index.html`
- `package.json`
- `public/favicon.ico`
- `vite.config.ts`
- `src/main.tsx`
- `src/bootstrap.tsx`
- `src/App.tsx`
- `src/Menu.tsx`
- `src/RemoteComponent.tsx`
- `src/mfe-config.ts`
- `src/mfe/loadRemoteVite.ts`
- `src/styles.css`

## `apps/cbms`
- `index.html`
- `package.json`
- `vercel.json`
- `vite.config.js`
- `src/main.tsx`
- `src/bootstrap.ts`
- `src/CbmsApp.tsx`
- `src/cbms.css`

## `apps/cdts`
- `index.html`
- `package.json`
- `vercel.json`
- `vite.config.js`
- `src/main.tsx`
- `src/bootstrap.ts`
- `src/CdtsApp.tsx`
- `src/cdts.css`

## `apps/mfe-products-angular`
- `index.html`
- `package.json`
- `tsconfig.json`
- `tsconfig.app.json`
- `vercel.json`
- `vite.config.mts`
- `src/main.ts`
- `src/mfe-entry.js`

## `packages/notification-sdk`
- `package.json`
- `src/index.ts`
- `src/index.js`

## 12. Clarification Points

If you want a stricter target state, clarify one of these and I can apply it:
1. Keep the `apps/mfe-products-angular` folder name or rename to `apps/products`.
2. Keep Vite federation plugin in shell, or remove it and use pure runtime loader only.
3. Keep mock in-memory data, or switch to API-backed flows for each MFE.
