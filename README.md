# mfe

Vite-only micro-frontend monorepo using `@originjs/vite-plugin-federation` across shell and all remotes.

Full repository documentation (architecture, runtime flow, app details, file inventory):
- `DOCUMENTATION.md`

## Structure

- `apps/shell` - Vite host shell (React + React Router)
- `apps/cbms` - Vite remote (React)
- `apps/cdts` - Vite remote (React)
- `apps/mfe-products-angular` - Vite remote (Angular runtime)
- `packages/notification-sdk` - shared notification SDK

## Getting Started

```bash
npm install
```

Run in separate terminals:

```bash
npm run dev:cbms
npm run dev:cdts
npm run dev:products-angular
npm run dev:shell
```

Open:
- `http://localhost:3000`

## Federation Runtime

All MFEs expose `./bootstrap` and publish `remoteEntry.js` through Vite federation.

Default local remote entries used by shell:
- `http://localhost:3001/assets/remoteEntry.js` (cbms)
- `http://localhost:3002/assets/remoteEntry.js` (cdts)
- `http://localhost:3003/assets/remoteEntry.js` (products)

Override with shell env vars when needed:
- `VITE_CBMS_REMOTE_ENTRY`
- `VITE_CDTS_REMOTE_ENTRY`
- `VITE_PRODUCTS_REMOTE_ENTRY`

Committed environment files:
- `apps/shell/.env.development` (localhost remotes)
- `apps/shell/.env.production` (Vercel remotes)

## Build

```bash
npm run build -w apps/shell
npm run build -w apps/cbms
npm run build -w apps/cdts
npm run build -w apps/mfe-products-angular
```
