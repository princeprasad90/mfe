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
