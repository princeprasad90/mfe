# mfe

Minimal micro-frontend setup with a webpack shell and two Vite remotes using Module Federation.

## Structure

- `apps/shell` - webpack shell that composes MFEs
- `apps/cbms` - Vite remote for CBMS profile maker/checker
- `apps/cdts` - Vite remote for CDTS profile maker/checker
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
npm run dev:shell
```

Then open `http://localhost:3000`.

## Remote deployment notes

- Build each Vite remote before deploying (`npm run build -w apps/cbms` and `npm run build -w apps/cdts`).
- Deploy the generated `dist` output so the shell can fetch built federation assets.
- Configure shell menu entries to use `/assets/remoteEntry.js` for Vite remotes.
