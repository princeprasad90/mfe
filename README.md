# mfe

Minimal micro-frontend setup with a Vite shell and two Vite remotes using `@module-federation/vite`.

## Structure

- `apps/shell` - Vite host app that composes MFEs
- `apps/cbms` - Vite remote for CBMS profile maker/checker
- `apps/cdts` - Vite remote for CDTS profile maker/checker
- `packages/notification-sdk` - shared notification SDK

## API-driven MFE data

- CBMS checker list fetches from `/api/cbms/profiles`
- CDTS checker list fetches from `/api/cdts/tasks`

## Getting Started

```bash
npm install
```

Run in separate terminals:

```bash
npm run dev:cbms
npm run dev:cdts
npm run dev:shell
```

Open `http://localhost:3000`.
