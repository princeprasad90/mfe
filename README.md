# mfe

Minimal micro-frontend setup standardized on Vite and `@originjs/vite-plugin-federation`.

## Structure

- `apps/shell` - Vite shell host that composes MFEs
- `apps/cbms` - Vite remote for CBMS profile maker/checker
- `apps/cdts` - Vite remote for CDTS profile maker/checker
- `apps/mfe-products-angular` - Vite Angular remote exposing `./bootstrap`
- `packages/notification-sdk` - shared notification SDK

## Getting Started

```bash
npm install
```

### Run the MFEs

In separate terminals:

```bash
npm run dev:cbms
npm run dev:cdts
npm run dev:products-angular
npm run dev:shell
```

Then open `http://localhost:5173`.

## Remote deployment notes

- Build each Vite app before deploying (`npm run build -w apps/shell`, `npm run build -w apps/mfe-products-angular`, `npm run build -w apps/cbms`, and `npm run build -w apps/cdts`).
- Deploy the generated `dist` output and ensure remotes publish `/assets/remoteEntry.js`.
- Use dynamic ESM remote loading in the shell (`import("productsAngular/bootstrap")`).
