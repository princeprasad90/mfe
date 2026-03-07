# Micro-Frontend (MFE) Platform - Complete Technical Documentation

**Last Updated:** March 4, 2026

---

# Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Workspace Layout & Structure](#4-workspace-layout--structure)
5. [Root Configuration Files](#5-root-configuration-files)
6. [Module Federation Architecture](#6-module-federation-architecture)
7. [Shell Application (Host)](#7-shell-application-host)
8. [CBMS Micro-Frontend (Remote)](#8-cbms-micro-frontend-remote)
9. [CDTS Micro-Frontend (Remote)](#9-cdts-micro-frontend-remote)
10. [Products Angular Micro-Frontend (Remote)](#10-products-angular-micro-frontend-remote)
11. [Notification SDK Package](#11-notification-sdk-package)
12. [Routing & Navigation System](#12-routing--navigation-system)
13. [Data Flow & Communication](#13-data-flow--communication)
14. [Build & Development Workflow](#14-build--development-workflow)
15. [Deployment Configuration](#15-deployment-configuration)
16. [Environment Configuration](#16-environment-configuration)
17. [Styling Architecture](#17-styling-architecture)
18. [Security Considerations](#18-security-considerations)
19. [Complete File Inventory](#19-complete-file-inventory)
20. [Troubleshooting Guide](#20-troubleshooting-guide)
21. [Backend for Frontend (BFF)](#21-backend-for-frontend-bff)
22. [Platform Shared Packages](#22-platform-shared-packages)
23. [Form Builder System](#23-form-builder-system)
24. [Validation Utilities Reference](#24-validation-utilities-reference)
25. [FormBuilder API Reference](#25-formbuilder-api-reference)
26. [Migration Guide: Manual Forms → FormBuilder](#26-migration-guide-manual-forms--formbuilder)

---

# 1. Executive Overview

## 1.1 Project Purpose

This repository implements a **Micro-Frontend (MFE) Platform** using a modern, Vite-only approach with Module Federation. It demonstrates how multiple independent frontend applications can be composed into a unified user experience while maintaining technological autonomy.

## 1.2 Key Characteristics

- **Monorepo Structure**: npm workspaces managing multiple applications and packages
- **Technology Agnostic**: Supports React and Angular MFEs within the same platform
- **Runtime Integration**: Dynamic loading of remote applications at runtime
- **Independent Deployment**: Each MFE can be built and deployed independently
- **Shared Dependencies**: Common libraries (React, React DOM) are shared to reduce bundle size

## 1.3 Business Context

The platform simulates an enterprise dashboard hosting three distinct business domains:

- **CBMS (Customer Billing Management System)**: Payment management functionality
- **CDTS (Compliance Document Tracking System)**: Task verification workflows
- **Products**: Product catalog management

---

# 2. Architecture Overview

## 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              User Browser                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                     Shell Application (Host)                            │ │
│  │                     http://localhost:3000                               │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │ │
│  │  │  React + React Router v6 + Vite Federation                       │   │ │
│  │  │  ┌─────────────────────────────────────────────────────────────┐ │   │ │
│  │  │  │                    Route Configuration                       │ │   │ │
│  │  │  │  /cbms/*    → CBMS Remote                                   │ │   │ │
│  │  │  │  /tasks/*   → CDTS Remote                                   │ │   │ │
│  │  │  │  /products/* → Products Remote                              │ │   │ │
│  │  │  └─────────────────────────────────────────────────────────────┘ │   │ │
│  │  └─────────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│          ┌─────────────────────────┼─────────────────────────┐              │
│          ▼                         ▼                         ▼              │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐        │
│  │  CBMS Remote     │   │  CDTS Remote     │   │ Products Remote  │        │
│  │  :3001           │   │  :3002           │   │ :3003            │        │
│  │  React + Vite    │   │  React + Vite    │   │ Angular + Vite   │        │
│  │  Federation      │   │  Federation      │   │ Federation       │        │
│  └──────────────────┘   └──────────────────┘   └──────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Module Federation Flow

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                        Module Federation Runtime Flow                          │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  1. Shell Startup                                                              │
│     └── main.tsx → bootstrap.tsx → App.tsx → Routes configured                │
│                                                                                │
│  2. User Navigation (e.g., /cbms)                                              │
│     └── React Router matches /cbms/* → renders RemoteComponent                 │
│                                                                                │
│  3. Remote Loading                                                             │
│     └── RemoteComponent triggers loadRemoteVite()                              │
│         └── Dynamic import: remoteEntry.js                                     │
│             └── Validates federation container                                  │
│                 └── Calls container.get('./bootstrap')                          │
│                     └── Returns { mount, unmount } functions                    │
│                                                                                │
│  4. MFE Mounting                                                               │
│     └── Shell calls mount(containerElement, { routePath, basePath })           │
│         └── Remote creates React/Angular root in container                     │
│                                                                                │
│  5. MFE Unmounting (route change)                                              │
│     └── Shell calls unmount()                                                  │
│         └── Remote destroys React/Angular root                                 │
│                                                                                │
└───────────────────────────────────────────────────────────────────────────────┘
```

## 2.3 Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Shell Application Components                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  main.tsx                                                                     │
│      │                                                                        │
│      └── import('./bootstrap')                                                │
│              │                                                                │
│              └── bootstrap.tsx                                                │
│                      │                                                        │
│                      └── <App />                                              │
│                              │                                                │
│                              ├── <BrowserRouter>                              │
│                              │       │                                        │
│                              │       ├── <Menu />                             │
│                              │       │     └── mfeConfig.map() → <Link>       │
│                              │       │                                        │
│                              │       └── <Routes>                             │
│                              │             └── mfeConfig.map() → <Route>      │
│                              │                   └── <RemoteComponent>        │
│                              │                         │                      │
│                              │                         └── loadRemoteVite()   │
│                              │                               │                │
│                              │                               └── mount()      │
│                              │                                                │
│                              └── mfe-config.ts (configuration)                │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# 3. Technology Stack

## 3.1 Core Technologies

| Technology                 | Version | Purpose                              |
| -------------------------- | ------- | ------------------------------------ |
| **Vite**                   | 5.3.2   | Build tool & development server      |
| **vite-plugin-federation** | 1.3.5   | Module Federation implementation     |
| **React**                  | 18.2.0  | UI library for Shell, CBMS, CDTS     |
| **React Router**           | 6.30.3  | Client-side routing                  |
| **Angular**                | 17.3.0  | UI framework for Products MFE        |
| **TypeScript**             | -       | Type safety and developer experience |
| **npm Workspaces**         | -       | Monorepo package management          |

## 3.2 Development & Build Tools

| Tool                                 | Purpose                                 |
| ------------------------------------ | --------------------------------------- |
| **@vitejs/plugin-react**             | React Fast Refresh & JSX transform      |
| **@originjs/vite-plugin-federation** | Vite-native Module Federation           |
| **zone.js**                          | Angular change detection (Products MFE) |

## 3.3 Runtime Dependencies by Application

### Shell Application

```json
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "react-router-dom": "^6.30.3"
}
```

### CBMS & CDTS (React MFEs)

```json
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "@mfe/notification-sdk": "0.1.0"
}
```

### Products Angular MFE

```json
{
  "@angular/common": "^17.3.0",
  "@angular/compiler": "^17.3.0",
  "@angular/core": "^17.3.0",
  "@angular/platform-browser": "^17.3.0",
  "rxjs": "~7.8.0",
  "zone.js": "~0.14.3"
}
```

## 3.4 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["apps/**/*", "packages/**/*"]
}
```

---

# 4. Workspace Layout & Structure

## 4.1 Directory Structure

```
mfe-workspace/
├── package.json              # Root workspace configuration
├── package-lock.json         # Dependency lock file
├── tsconfig.json             # Shared TypeScript configuration
├── README.md                 # Quick start guide
├── DOCUMENTATION.md          # This comprehensive documentation
├── .gitignore                # Git ignore rules
│
├── apps/                     # Application packages
│   │
│   ├── shell/                # Host shell application
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── .env.development
│   │   ├── .env.production
│   │   ├── netlify.toml
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── bootstrap.tsx
│   │       ├── App.tsx
│   │       ├── Menu.tsx
│   │       ├── RemoteComponent.tsx
│   │       ├── mfe-config.ts
│   │       ├── env.d.ts
│   │       ├── styles.css
│   │       └── mfe/
│   │           └── loadRemoteVite.ts
│   │
│   ├── cbms/                 # CBMS remote (React)
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── vercel.json
│   │   ├── netlify.toml
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── bootstrap.ts
│   │       ├── CbmsApp.tsx
│   │       └── cbms.css
│   │
│   ├── cdts/                 # CDTS remote (React)
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── vercel.json
│   │   ├── netlify.toml
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── bootstrap.ts
│   │       ├── CdtsApp.tsx
│   │       └── cdts.css
│   │
│   └── mfe-products-angular/ # Products remote (Angular)
│       ├── index.html
│       ├── package.json
│       ├── vite.config.mts
│       ├── vercel.json
│       ├── netlify.toml
│       ├── tsconfig.json
│       ├── tsconfig.app.json
│       └── src/
│           ├── main.ts
│           ├── bootstrap.ts
│           ├── mfe-entry.js
│           ├── mfe-entry.d.ts
│           └── app/
│               ├── products-shell.component.js
│               ├── runtime-props.js
│               ├── data/
│               │   └── products.js
│               └── pages/
│                   ├── list/
│                   │   └── products-list.component.js
│                   └── details/
│                       └── product-details.component.js
│
└── packages/                 # Shared packages
    └── notification-sdk/     # Notification utility library
        ├── package.json
        └── src/
            ├── index.ts
            └── index.js
```

## 4.2 Port Allocation

| Application     | Development Port | Purpose          |
| --------------- | ---------------- | ---------------- |
| Shell (Host)    | 3000             | Main entry point |
| CBMS Remote     | 3001             | Payments module  |
| CDTS Remote     | 3002             | Tasks module     |
| Products Remote | 3003             | Products module  |

---

# 5. Root Configuration Files

## 5.1 Root package.json

```json
{
  "name": "mfe-workspace",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev:shell": "npm run dev -w apps/shell",
    "dev:cbms": "npm run dev -w apps/cbms",
    "dev:cdts": "npm run dev -w apps/cdts",
    "dev:products-angular": "npm run dev -w apps/mfe-products-angular"
  }
}
```

**Key Features:**

- **Workspaces**: npm workspaces enable shared node_modules and cross-package linking
- **Scripts**: Convenience scripts for running individual applications

## 5.2 TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020", // Modern JavaScript output
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext", // ES Module syntax
    "moduleResolution": "Bundler", // Vite-compatible resolution
    "jsx": "react-jsx", // React 17+ JSX transform
    "strict": true, // Strict type checking
    "skipLibCheck": true, // Skip .d.ts checking for speed
    "noEmit": true // TypeScript only for type checking
  },
  "include": ["apps/**/*", "packages/**/*"]
}
```

---

# 6. Module Federation Architecture

## 6.1 Federation Plugin Configuration

### Host (Shell) Configuration

```typescript
// apps/shell/vite.config.ts
federation({
  name: "shell",
  shared: ["react", "react-dom", "react-router-dom"],
});
```

**Purpose**: Declares shared dependencies for deduplication across MFEs.

### Remote Configuration Pattern

```javascript
// apps/cbms/vite.config.js (example)
federation({
  name: "cbmsApp", // Unique federation scope name
  filename: "remoteEntry.js", // Output filename for remote entry
  exposes: {
    "./bootstrap": "./src/bootstrap.ts", // Exposed module path
  },
  shared: ["react", "react-dom"], // Shared dependencies
});
```

## 6.2 Remote Entry Contract

Each MFE publishes a `remoteEntry.js` file at `/assets/remoteEntry.js` that:

1. Exports a federation container with `get()` and `init()` methods
2. Exposes the `./bootstrap` module

## 6.3 Bootstrap Module Contract

All remotes must expose a bootstrap module with:

```typescript
interface BootstrapModule {
  mount: (container: HTMLElement, props?: MountProps) => void | Promise<void>;
  unmount?: () => void | Promise<void>;
}

interface MountProps {
  routePath?: string; // Current URL path + search params
  basePath?: string; // Base route for this MFE (e.g., "/cbms")
}
```

## 6.4 Remote Loader Implementation

```typescript
// apps/shell/src/mfe/loadRemoteVite.ts

type FederatedContainer = {
  get: (module: string) => Promise<() => any>;
  init?: (shareScope: unknown) => Promise<void> | void;
};

// Container caching for performance
const containerCache = new Map<string, Promise<FederatedContainer>>();

// Validation: Ensure proper Vite federation format
const getContainer = async (
  remoteEntry: string,
): Promise<FederatedContainer> => {
  // Validates: remoteEntry must include '/assets/remoteEntry.js'
  // Caches: Container promise to avoid duplicate loads
  // Handles: 'already initialized' errors gracefully
};

export const loadRemoteVite = async <TModule>(
  remoteEntry: string,
  module: string,
): Promise<TModule> => {
  const container = await getContainer(remoteEntry);
  const moduleFactory = await container.get(module);
  return moduleFactory();
};
```

## 6.5 Shared Dependency Management

| Dependency       | Shared By         | Purpose             |
| ---------------- | ----------------- | ------------------- |
| react            | Shell, CBMS, CDTS | Core UI library     |
| react-dom        | Shell, CBMS, CDTS | React DOM rendering |
| react-router-dom | Shell only        | Client-side routing |

**Note**: Angular MFE doesn't share dependencies with React apps to maintain framework isolation.

---

# 7. Shell Application (Host)

## 7.1 Overview

The Shell application serves as the **host container** that:

- Provides unified navigation and layout
- Dynamically loads and orchestrates MFEs
- Manages cross-cutting concerns (header, menu, routing)

## 7.2 Package Configuration

```json
{
  "name": "@mfe/shell",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-router-dom": "^6.30.3"
  },
  "devDependencies": {
    "@originjs/vite-plugin-federation": "1.3.5",
    "@types/react": "^19.2.14",
    "@vitejs/plugin-react": "4.3.1",
    "vite": "5.3.2"
  }
}
```

## 7.3 Vite Configuration

```typescript
// apps/shell/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      shared: ["react", "react-dom", "react-router-dom"],
    }),
  ],
  server: {
    host: "0.0.0.0", // Allow external access
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  build: {
    target: "esnext", // Modern browser target
    modulePreload: false, // Disable preload for federation
    cssCodeSplit: false, // Single CSS bundle
  },
});
```

## 7.4 Entry Point Flow

### main.tsx (Entry Point)

```tsx
import("./bootstrap"); // Dynamic import for federation compatibility
```

### bootstrap.tsx (React Root)

```tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);
```

## 7.5 Application Component (App.tsx)

```tsx
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Menu from "./Menu";
import RemoteComponent from "./RemoteComponent";
import { mfeConfig } from "./mfe-config";

export default function App() {
  return (
    <BrowserRouter>
      <div className="shell">
        <header className="shell__header">
          <h1>MFE Shell</h1>
          <p>Dynamic runtime micro frontend loader</p>
        </header>

        <Menu />

        <main className="shell__content">
          <Routes>
            {/* Dynamic route generation from config */}
            {mfeConfig.map((mfe) => (
              <Route
                key={mfe.name}
                path={`${mfe.route}/*`} // Wildcard for sub-routes
                element={
                  <RemoteComponent
                    name={mfe.name}
                    remoteEntry={mfe.remoteEntry}
                    scope={mfe.scope}
                    exposedModule={mfe.exposedModule}
                    basePath={mfe.route}
                  />
                }
              />
            ))}
            {/* Default redirect to first MFE */}
            <Route
              path="*"
              element={<Navigate to={mfeConfig[0].route} replace />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
```

## 7.6 MFE Configuration (mfe-config.ts)

```typescript
export type MfeDefinition = {
  name: string; // Display name
  route: string; // Base route path
  remoteEntry: string; // Remote entry URL
  scope: string; // Federation scope name
  exposedModule: string; // Exposed module name
};

const defaultRemoteEntries = {
  cbms: "http://localhost:3001/assets/remoteEntry.js",
  cdts: "http://localhost:3002/assets/remoteEntry.js",
  products: "http://localhost:3003/assets/remoteEntry.js",
};

export const mfeConfig: MfeDefinition[] = [
  {
    name: "cbms",
    route: "/cbms",
    remoteEntry:
      import.meta.env.VITE_CBMS_REMOTE_ENTRY ?? defaultRemoteEntries.cbms,
    scope: "cbmsApp",
    exposedModule: "./bootstrap",
  },
  {
    name: "tasks",
    route: "/tasks",
    remoteEntry:
      import.meta.env.VITE_CDTS_REMOTE_ENTRY ?? defaultRemoteEntries.cdts,
    scope: "cdtsApp",
    exposedModule: "./bootstrap",
  },
  {
    name: "products",
    route: "/products",
    remoteEntry:
      import.meta.env.VITE_PRODUCTS_REMOTE_ENTRY ??
      defaultRemoteEntries.products,
    scope: "productsAngular",
    exposedModule: "./bootstrap",
  },
];
```

## 7.7 Remote Component Loader (RemoteComponent.tsx)

```tsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { loadRemoteVite } from "./mfe/loadRemoteVite";

type Props = {
  name: string;
  remoteEntry: string;
  scope: string;
  exposedModule: string;
  basePath: string;
};

type BootstrapModule = {
  mount: (
    container: HTMLElement,
    props?: Record<string, unknown>,
  ) => void | Promise<void>;
  unmount?: () => void | Promise<void>;
};

export default function RemoteComponent({
  name,
  remoteEntry,
  scope,
  exposedModule,
  basePath,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  // Compute full route path including query params
  const routePath = `${location.pathname}${location.search}`;

  useEffect(() => {
    let remoteUnmount: BootstrapModule["unmount"] | undefined;

    const load = async () => {
      try {
        setError(null);
        if (!hostRef.current) return;

        // Load remote module
        const remoteModule = await loadRemoteVite<BootstrapModule>(
          remoteEntry,
          exposedModule,
        );

        // Mount MFE with route context
        await remoteModule.mount(hostRef.current, {
          routePath,
          basePath,
        });

        remoteUnmount = remoteModule.unmount;
      } catch (loadError) {
        console.error("[shell] Remote component failed", {
          name,
          scope,
          remoteEntry,
          exposedModule,
          loadError,
        });
        setError(`Unable to load ${name}. Check console logs for details.`);
      }
    };

    load();

    // Cleanup on unmount or route change
    return () => {
      void remoteUnmount?.();
    };
  }, [name, scope, remoteEntry, exposedModule, routePath, basePath]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div id="mfe-root" ref={hostRef}>
      Loading MFE...
    </div>
  );
}
```

## 7.8 Menu Component (Menu.tsx)

```tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { mfeConfig } from "./mfe-config";

export default function Menu() {
  const location = useLocation();

  const isActiveRoute = (route: string) =>
    location.pathname === route || location.pathname.startsWith(`${route}/`);

  return (
    <nav className="shell__menu">
      {mfeConfig.map((mfe) => (
        <Link
          key={mfe.name}
          to={mfe.route}
          className={`shell__menu-item ${isActiveRoute(mfe.route) ? "is-active" : ""}`}
        >
          {mfe.name}
        </Link>
      ))}
    </nav>
  );
}
```

## 7.9 Functional Flow

```
1. User opens http://localhost:3000
   │
   ├── 2. index.html loads main.tsx
   │       │
   │       └── 3. main.tsx dynamically imports bootstrap.tsx
   │               │
   │               └── 4. bootstrap.tsx renders <App /> with React 18 createRoot
   │                       │
   │                       └── 5. App.tsx initializes BrowserRouter
   │                               │
   │                               ├── 6. Routes generated from mfeConfig array
   │                               │
   │                               ├── 7. Default redirect: / → /cbms
   │                               │
   │                               └── 8. User navigates or is redirected
   │                                       │
   │                                       └── 9. RemoteComponent renders
   │                                               │
   │                                               ├── 10. loadRemoteVite() called
   │                                               │       │
   │                                               │       ├── 11. Dynamic import remoteEntry.js
   │                                               │       │
   │                                               │       ├── 12. Validate federation container
   │                                               │       │
   │                                               │       └── 13. container.get('./bootstrap')
   │                                               │
   │                                               └── 14. mount(div, { routePath, basePath })
   │
   └── 15. MFE renders inside host container
```

---

# 8. CBMS Micro-Frontend (Remote)

## 8.1 Overview

**CBMS (Customer Billing Management System)** is a React-based micro-frontend that provides payment management functionality including:

- Paginated payment listings
- Payment detail views
- Navigation between list and detail screens

## 8.2 Package Configuration

```json
{
  "name": "@mfe/cbms",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@mfe/notification-sdk": "0.1.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "@originjs/vite-plugin-federation": "1.3.5",
    "@vitejs/plugin-react": "4.3.1",
    "vite": "5.3.2"
  }
}
```

## 8.3 Vite Configuration

```javascript
// apps/cbms/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  base: "./", // Relative base for deployment flexibility
  plugins: [
    react(),
    federation({
      name: "cbmsApp",
      filename: "remoteEntry.js",
      exposes: {
        "./bootstrap": "./src/bootstrap.ts",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 3001,
    cors: true, // Required for cross-origin federation
  },
  preview: {
    cors: true,
  },
  build: {
    target: "esnext",
    modulePreload: false,
    cssCodeSplit: false,
  },
});
```

## 8.4 Bootstrap Module (bootstrap.ts)

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import CbmsApp from "./CbmsApp";

type MountProps = {
  routePath?: string;
  basePath?: string;
};

let root: ReactDOM.Root | null = null;

export function mount(container: HTMLElement, props: MountProps = {}) {
  root = ReactDOM.createRoot(container);
  root.render(React.createElement(CbmsApp, props));
}

export function unmount() {
  if (root) {
    root.unmount();
    root = null;
  }
}
```

## 8.5 Main Application Component (CbmsApp.tsx)

```tsx
import React, { useMemo } from "react";
import "./cbms.css";

type Props = {
  routePath?: string;
  basePath?: string;
};

type Payment = {
  id: number;
  customer: string;
  amount: number;
  status: string;
};

// Configuration
const PAGE_SIZE = 5;

// Mock data generation (23 payments)
const payments: Payment[] = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  customer: `Customer ${index + 1}`,
  amount: 500 + (index + 1) * 35,
  status: index % 2 === 0 ? "Pending" : "Approved",
}));

const CbmsApp = ({
  routePath = `${window.location.pathname}${window.location.search}`,
  basePath = "/cbms",
}: Props) => {
  // Route parsing for detail view
  const detailMatch = routePath.match(/\/details\/(\d+)/);
  const detailId = detailMatch ? Number(detailMatch[1]) : null;
  const detailItem = payments.find((item) => item.id === detailId);

  // Pagination parsing
  const pageMatch = routePath.match(/[?&]page=(\d+)/);
  const currentPage = Math.max(1, Number(pageMatch?.[1] || 1));
  const totalPages = Math.ceil(payments.length / PAGE_SIZE);

  // Compute visible items
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return payments.slice(start, start + PAGE_SIZE);
  }, [currentPage]);

  // Navigation helper (History API + popstate for shell sync)
  const goTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  // Detail View
  if (detailItem) {
    return (
      <div className="mfe">
        <h2>Payment Details</h2>
        <p>
          <strong>ID:</strong> {detailItem.id}
        </p>
        <p>
          <strong>Customer:</strong> {detailItem.customer}
        </p>
        <p>
          <strong>Amount:</strong> ${detailItem.amount}
        </p>
        <p>
          <strong>Status:</strong> {detailItem.status}
        </p>
        <button
          className="mfe__button"
          onClick={() => goTo(`${basePath}?page=${currentPage}`)}
        >
          Back to Listing
        </button>
      </div>
    );
  }

  // List View
  return (
    <div className="mfe">
      <h2>Payments Listing</h2>
      <ul className="mfe__list">
        {pagedItems.map((payment) => (
          <li key={payment.id} className="mfe__list-item">
            <span>
              {payment.customer} - ${payment.amount}
            </span>
            <button
              className="mfe__ghost"
              onClick={() =>
                goTo(`${basePath}/details/${payment.id}?page=${currentPage}`)
              }
            >
              Details
            </button>
          </li>
        ))}
      </ul>
      <div className="mfe__pager">
        <button
          className="mfe__ghost"
          disabled={currentPage <= 1}
          onClick={() => goTo(`${basePath}?page=${currentPage - 1}`)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="mfe__ghost"
          disabled={currentPage >= totalPages}
          onClick={() => goTo(`${basePath}?page=${currentPage + 1}`)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CbmsApp;
```

## 8.6 Data Model

```typescript
// Payment entity
interface Payment {
  id: number; // Unique identifier (1-23)
  customer: string; // Customer name ("Customer 1" - "Customer 23")
  amount: number; // Payment amount ($535 - $1305)
  status: string; // "Pending" (even IDs) or "Approved" (odd IDs)
}
```

## 8.7 Functional Flow

```
1. Shell loads CBMS (default route) or user navigates to /cbms
   │
   ├── 2. bootstrap.ts mount() called with { routePath, basePath }
   │       │
   │       └── 3. React root created, CbmsApp rendered
   │               │
   │               ├── 4. Route parsed: detail view or list view?
   │               │
   │               ├── 5a. List View (/cbms or /cbms?page=N)
   │               │       │
   │               │       ├── Show paginated payments (5 per page)
   │               │       │
   │               │       ├── "Details" button → goTo('/cbms/details/ID?page=N')
   │               │       │
   │               │       └── Pagination buttons → goTo('/cbms?page=N±1')
   │               │
   │               └── 5b. Detail View (/cbms/details/ID)
   │                       │
   │                       ├── Show payment metadata
   │                       │
   │                       └── "Back" button → goTo('/cbms?page=N')
   │
   └── 6. Navigation triggers popstate → Shell re-renders RemoteComponent
           │
           └── 7. New routePath passed → CbmsApp re-renders with new state
```

## 8.8 Standalone Mode

When running standalone (`npm run dev -w apps/cbms`), the app mounts to `#root`:

```tsx
// main.tsx
import "./cbms.css";
import { mount } from "./bootstrap";

const container = document.getElementById("root");
if (container) {
  mount(container);
}
```

---

# 9. CDTS Micro-Frontend (Remote)

## 9.1 Overview

**CDTS (Compliance Document Tracking System)** is a React-based micro-frontend that provides task management functionality including:

- Paginated task listings
- Task detail views
- Navigation between list and detail screens

## 9.2 Package Configuration

```json
{
  "name": "@mfe/cdts",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@mfe/notification-sdk": "0.1.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "@originjs/vite-plugin-federation": "1.3.5",
    "@vitejs/plugin-react": "4.3.1",
    "vite": "5.3.2"
  }
}
```

## 9.3 Vite Configuration

```javascript
// apps/cdts/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    federation({
      name: "cdtsApp",
      filename: "remoteEntry.js",
      exposes: {
        "./bootstrap": "./src/bootstrap.ts",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 3002,
    cors: true,
  },
  preview: {
    cors: true,
  },
  build: {
    target: "esnext",
    modulePreload: false,
    cssCodeSplit: false,
  },
});
```

## 9.4 Main Application Component (CdtsApp.tsx)

```tsx
import React, { useMemo } from "react";
import "./cdts.css";

type Props = {
  routePath?: string;
  basePath?: string;
};

type Task = {
  id: number;
  title: string;
  owner: string;
  priority: string;
};

// Configuration
const PAGE_SIZE = 4;

// Mock data generation (18 tasks)
const tasks: Task[] = Array.from({ length: 18 }, (_, index) => ({
  id: index + 1,
  title: `Verification Task ${index + 1}`,
  owner: `Analyst ${index % 6}`,
  priority: index % 3 === 0 ? "High" : "Normal",
}));

const CdtsApp = ({
  routePath = `${window.location.pathname}${window.location.search}`,
  basePath = "/tasks",
}: Props) => {
  // Route parsing for detail view
  const detailMatch = routePath.match(/\/details\/(\d+)/);
  const detailId = detailMatch ? Number(detailMatch[1]) : null;
  const detailTask = tasks.find((item) => item.id === detailId);

  // Pagination parsing
  const pageMatch = routePath.match(/[?&]page=(\d+)/);
  const currentPage = Math.max(1, Number(pageMatch?.[1] || 1));
  const totalPages = Math.ceil(tasks.length / PAGE_SIZE);

  // Compute visible items
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return tasks.slice(start, start + PAGE_SIZE);
  }, [currentPage]);

  // Navigation helper
  const goTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  // Detail View
  if (detailTask) {
    return (
      <div className="mfe">
        <h2>Task Details</h2>
        <p>
          <strong>ID:</strong> {detailTask.id}
        </p>
        <p>
          <strong>Title:</strong> {detailTask.title}
        </p>
        <p>
          <strong>Owner:</strong> {detailTask.owner}
        </p>
        <p>
          <strong>Priority:</strong> {detailTask.priority}
        </p>
        <button
          className="mfe__button"
          onClick={() => goTo(`${basePath}?page=${currentPage}`)}
        >
          Back to Listing
        </button>
      </div>
    );
  }

  // List View
  return (
    <div className="mfe">
      <h2>Tasks Listing</h2>
      <ul className="mfe__list">
        {pagedItems.map((task) => (
          <li key={task.id} className="mfe__list-item">
            <span>{task.title}</span>
            <button
              className="mfe__ghost"
              onClick={() =>
                goTo(`${basePath}/details/${task.id}?page=${currentPage}`)
              }
            >
              Details
            </button>
          </li>
        ))}
      </ul>
      <div className="mfe__pager">
        <button
          className="mfe__ghost"
          disabled={currentPage <= 1}
          onClick={() => goTo(`${basePath}?page=${currentPage - 1}`)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="mfe__ghost"
          disabled={currentPage >= totalPages}
          onClick={() => goTo(`${basePath}?page=${currentPage + 1}`)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CdtsApp;
```

## 9.5 Data Model

```typescript
// Task entity
interface Task {
  id: number; // Unique identifier (1-18)
  title: string; // Task title ("Verification Task 1" - "Verification Task 18")
  owner: string; // Assigned analyst ("Analyst 0" - "Analyst 5")
  priority: string; // "High" (every 3rd task) or "Normal"
}
```

## 9.6 Key Differences from CBMS

| Aspect           | CBMS              | CDTS        |
| ---------------- | ----------------- | ----------- |
| Domain           | Payments          | Tasks       |
| Data size        | 23 items          | 18 items    |
| Page size        | 5 items           | 4 items     |
| Base route       | /cbms             | /tasks      |
| Federation scope | cbmsApp           | cdtsApp     |
| Priority field   | N/A (uses status) | High/Normal |

---

# 10. Products Angular Micro-Frontend (Remote)

## 10.1 Overview

**Products MFE** demonstrates **framework heterogeneity** - an Angular application running within the React-based shell. This proves the technology-agnostic nature of Module Federation.

## 10.2 Package Configuration

```json
{
  "name": "@mfe/products-angular",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@angular/common": "^17.3.0",
    "@angular/compiler": "^17.3.0",
    "@angular/core": "^17.3.0",
    "@angular/platform-browser": "^17.3.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.3"
  },
  "devDependencies": {
    "@originjs/vite-plugin-federation": "1.3.5",
    "vite": "5.3.2"
  }
}
```

## 10.3 Vite Configuration

```typescript
// apps/mfe-products-angular/vite.config.mts
import { defineConfig } from "vite";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  base: "./",
  plugins: [
    federation({
      name: "productsAngular",
      filename: "remoteEntry.js",
      exposes: {
        "./bootstrap": "./src/bootstrap.ts",
      },
      // Note: No shared deps - Angular is isolated from React
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 3003,
    cors: true,
  },
  preview: {
    port: 4173,
    cors: true,
  },
  build: {
    target: "esnext",
    modulePreload: false,
    cssCodeSplit: false,
  },
});
```

## 10.4 Bootstrap Entry (mfe-entry.js)

```javascript
import "zone.js"; // Required for Angular change detection
import "@angular/compiler";
import { createApplication } from "@angular/platform-browser";
import ProductsShellComponent from "./app/products-shell.component.js";
import { RUNTIME_PROPS } from "./app/runtime-props.js";

let appRef = null;
let mountNode = null;

export async function mount(container, props = {}) {
  // Clean up any existing instance
  await unmount();

  // Create custom element container
  mountNode = document.createElement("products-angular-root");
  container.innerHTML = "";
  container.appendChild(mountNode);

  try {
    // Bootstrap Angular standalone application
    appRef = await createApplication({
      providers: [{ provide: RUNTIME_PROPS, useValue: props }],
    });

    // Mount root component
    appRef.bootstrap(ProductsShellComponent, mountNode);
  } catch (error) {
    container.innerHTML = "<p>Unable to load products Angular MFE.</p>";
    throw error;
  }
}

export async function unmount() {
  if (appRef) {
    appRef.destroy();
    appRef = null;
  }

  if (mountNode) {
    mountNode.remove();
    mountNode = null;
  }
}
```

## 10.5 Runtime Props Injection Token

```javascript
// apps/mfe-products-angular/src/app/runtime-props.js
import { InjectionToken } from "@angular/core";

export const RUNTIME_PROPS = new InjectionToken("RUNTIME_PROPS");
```

## 10.6 Shell Component (Routing)

```javascript
// apps/mfe-products-angular/src/app/products-shell.component.js
import { Component, inject } from "@angular/core";
import { RUNTIME_PROPS } from "./runtime-props.js";
import ProductsListComponent from "./pages/list/products-list.component.js";
import ProductDetailsComponent from "./pages/details/product-details.component.js";

class ProductsShellComponent {
  runtimeProps = inject(RUNTIME_PROPS, { optional: true }) ?? {};
  routePath =
    this.runtimeProps.routePath ??
    `${window.location.pathname}${window.location.search}`;

  get isDetailsRoute() {
    return /\/details\/\d+/.test(this.routePath);
  }
}

Component({
  selector: "products-shell-page",
  standalone: true,
  imports: [ProductsListComponent, ProductDetailsComponent],
  template: `
    <div [style.display]="isDetailsRoute ? 'none' : 'block'">
      <products-list-page></products-list-page>
    </div>
    <div [style.display]="isDetailsRoute ? 'block' : 'none'">
      <product-details-page></product-details-page>
    </div>
  `,
})(ProductsShellComponent);

export default ProductsShellComponent;
```

## 10.7 Products List Component

```javascript
// apps/mfe-products-angular/src/app/pages/list/products-list.component.js
import { Component, inject } from "@angular/core";
import { products } from "../../data/products.js";
import { RUNTIME_PROPS } from "../../runtime-props.js";

class ProductsListComponent {
  runtimeProps = inject(RUNTIME_PROPS, { optional: true }) ?? {};
  products = products;
  basePath = this.runtimeProps.basePath ?? "/products";

  goTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  openDetails(id) {
    this.goTo(`${this.basePath}/details/${id}`);
  }
}

Component({
  selector: "products-list-page",
  standalone: true,
  imports: [],
  template: `
    <section class="mfe">
      <h2>Products</h2>
      <ul class="mfe__list">
        <!-- Product list items with detail buttons -->
      </ul>
    </section>
  `,
  styles: [
    /* inline BEM styles */
  ],
})(ProductsListComponent);
```

## 10.8 Product Details Component

```javascript
// apps/mfe-products-angular/src/app/pages/details/product-details.component.js
import { Component, inject } from "@angular/core";
import { products } from "../../data/products.js";
import { RUNTIME_PROPS } from "../../runtime-props.js";

class ProductDetailsComponent {
  runtimeProps = inject(RUNTIME_PROPS, { optional: true }) ?? {};
  products = products;
  basePath = this.runtimeProps.basePath ?? "/products";
  routePath =
    this.runtimeProps.routePath ??
    `${window.location.pathname}${window.location.search}`;

  get selectedProduct() {
    const detailMatch = this.routePath.match(/\/details\/(\d+)/);
    const detailId = detailMatch ? Number(detailMatch[1]) : null;
    return this.products.find((item) => item.id === detailId) ?? null;
  }

  goTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}
```

## 10.9 Data Model

```javascript
// apps/mfe-products-angular/src/app/data/products.js
export const products = [
  {
    id: 1,
    name: "Laptop Pro",
    description: "14-inch business laptop with extended battery life.",
  },
  {
    id: 2,
    name: "Wireless Mouse",
    description: "Ergonomic mouse with silent clicks and USB receiver.",
  },
  {
    id: 3,
    name: "Monitor 27",
    description: "27-inch IPS monitor with 1440p resolution.",
  },
  {
    id: 4,
    name: "USB-C Dock",
    description: "Multi-port docking station for workstation setups.",
  },
];
```

## 10.10 Angular-Specific Patterns

### Dependency Injection

```javascript
// Inject runtime props from shell
runtimeProps = inject(RUNTIME_PROPS, { optional: true }) ?? {};
```

### Standalone Components (Angular 17+)

```javascript
Component({
  selector: "products-list-page",
  standalone: true, // No NgModule required
  imports: [], // Direct imports
  template: `...`,
  styles: [`...`],
})(ComponentClass);
```

### Application Bootstrap

```javascript
// Modern Angular standalone bootstrap
appRef = await createApplication({
  providers: [{ provide: RUNTIME_PROPS, useValue: props }],
});
appRef.bootstrap(RootComponent, mountNode);
```

---

# 11. Notification SDK Package

## 11.1 Overview

The **Notification SDK** is a shared package providing toast notification functionality across all MFEs.

## 11.2 Package Configuration

```json
{
  "name": "@mfe/notification-sdk",
  "version": "0.1.0",
  "main": "src/index.js",
  "type": "module"
}
```

## 11.3 Implementation (TypeScript)

```typescript
// packages/notification-sdk/src/index.ts
const containerId = "mfe-notification-container";

type NotifyPayload = {
  title: string;
  message: string;
  variant?: "info" | "success" | "warning" | "error";
};

// Ensure notification container exists
const ensureContainer = () => {
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    container.style.position = "fixed";
    container.style.top = "16px";
    container.style.right = "16px";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";
    container.style.zIndex = "9999";
    document.body.appendChild(container);
  }
  return container;
};

export const notify = ({ title, message, variant = "info" }: NotifyPayload) => {
  const container = ensureContainer();
  const toast = document.createElement("div");

  // Variant color mapping
  const colors: Record<NonNullable<NotifyPayload["variant"]>, string> = {
    info: "#2563eb", // Blue
    success: "#16a34a", // Green
    warning: "#f97316", // Orange
    error: "#dc2626", // Red
  };

  // Toast styling
  toast.style.minWidth = "220px";
  toast.style.padding = "12px 14px";
  toast.style.borderRadius = "10px";
  toast.style.background = "#0f172a";
  toast.style.color = "#f8fafc";
  toast.style.border = `1px solid ${colors[variant]}`;
  toast.style.boxShadow = "0 6px 20px rgba(15, 23, 42, 0.3)";

  toast.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px; color: ${colors[variant]}">
      ${title}
    </div>
    <div style="font-size: 13px; line-height: 1.4;">
      ${message}
    </div>
  `;

  container.appendChild(toast);

  // Auto-dismiss with fade animation
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 240ms ease";
    setTimeout(() => toast.remove(), 260);
  }, 2400);
};
```

## 11.4 API Reference

### notify(payload)

**Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | Yes | - | Toast title text |
| message | string | Yes | - | Toast body message |
| variant | "info" \| "success" \| "warning" \| "error" | No | "info" | Visual style variant |

**Timing:**

- Display duration: 2400ms
- Fade duration: 240ms
- Total visibility: ~2660ms

## 11.5 Usage Example

```typescript
import { notify } from "@mfe/notification-sdk";

// Info notification
notify({
  title: "Information",
  message: "Your changes have been saved.",
});

// Success notification
notify({
  title: "Success!",
  message: "Payment processed successfully.",
  variant: "success",
});

// Warning notification
notify({
  title: "Warning",
  message: "Session expires in 5 minutes.",
  variant: "warning",
});

// Error notification
notify({
  title: "Error",
  message: "Failed to load data. Please try again.",
  variant: "error",
});
```

---

# 12. Routing & Navigation System

## 12.1 Architecture Overview

The routing system uses a **hybrid approach**:

- **Shell Level**: React Router v6 with BrowserRouter (history-based)
- **MFE Level**: Manual route parsing from props + History API navigation

## 12.2 Shell Route Configuration

```typescript
// Route patterns in shell
{mfeConfig.map((mfe) => (
  <Route
    key={mfe.name}
    path={`${mfe.route}/*`}  // Wildcard captures all sub-routes
    element={<RemoteComponent {...mfe} />}
  />
))}
```

**Route Mapping:**
| URL Pattern | MFE | Component |
|-------------|-----|-----------|
| /cbms/_ | CBMS | CbmsApp |
| /tasks/_ | CDTS | CdtsApp |
| /products/\* | Products | ProductsShellComponent |

## 12.3 Route Props Passed to MFEs

```typescript
// Shell passes these props to each MFE
{
  routePath: "/cbms/details/5?page=2",  // Full current path + query
  basePath: "/cbms"                      // Base route for this MFE
}
```

## 12.4 MFE Internal Navigation

```typescript
// Navigation helper used by all MFEs
const goTo = (path: string) => {
  // Update browser history
  window.history.pushState({}, "", path);

  // Dispatch popstate to notify shell
  window.dispatchEvent(new PopStateEvent("popstate"));
};

// Usage examples:
goTo(`${basePath}/details/5?page=2`); // Navigate to detail
goTo(`${basePath}?page=3`); // Navigate to list page
```

## 12.5 Route Parsing in MFEs

```typescript
// Detail route detection
const detailMatch = routePath.match(/\/details\/(\d+)/);
const detailId = detailMatch ? Number(detailMatch[1]) : null;

// Pagination detection
const pageMatch = routePath.match(/[?&]page=(\d+)/);
const currentPage = Math.max(1, Number(pageMatch?.[1] || 1));
```

## 12.6 Navigation Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          Navigation Flow                                    │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. User clicks link/button in MFE                                          │
│     │                                                                       │
│     ├── 2. goTo('/cbms/details/5') called                                   │
│     │       │                                                               │
│     │       ├── 3. window.history.pushState({}, '', '/cbms/details/5')     │
│     │       │       └── Browser URL updates (no page reload)               │
│     │       │                                                               │
│     │       └── 4. window.dispatchEvent(new PopStateEvent('popstate'))     │
│     │               └── React Router detects URL change                    │
│     │                                                                       │
│     └── 5. React Router re-renders routes                                   │
│             │                                                               │
│             └── 6. RemoteComponent useEffect triggers                       │
│                     │                                                       │
│                     ├── 7. Previous MFE unmount() called                    │
│                     │                                                       │
│                     └── 8. MFE mount() called with new routePath            │
│                             │                                               │
│                             └── 9. MFE renders appropriate view             │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

# 13. Data Flow & Communication

## 13.1 Props Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Props Data Flow                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  mfe-config.ts                                                               │
│      │                                                                       │
│      └── MfeDefinition {                                                     │
│              name, route, remoteEntry, scope, exposedModule                  │
│          }                                                                   │
│              │                                                               │
│              └── App.tsx maps config to Routes                               │
│                      │                                                       │
│                      └── RemoteComponent receives:                           │
│                              • name                                          │
│                              • remoteEntry                                   │
│                              • scope                                         │
│                              • exposedModule                                 │
│                              • basePath                                      │
│                                  │                                           │
│                                  └── RemoteComponent computes:               │
│                                          • routePath (location.pathname +    │
│                                                       location.search)       │
│                                              │                               │
│                                              └── MFE mount() receives:       │
│                                                      { routePath, basePath } │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 13.2 State Management

Each MFE manages its own internal state:

- **CBMS**: Payments array (mock), current page, selected item
- **CDTS**: Tasks array (mock), current page, selected item
- **Products**: Products array (mock), selected product

## 13.3 Cross-MFE Communication Patterns

Currently, MFEs operate independently. Potential extension patterns:

| Pattern              | Implementation                                      |
| -------------------- | --------------------------------------------------- |
| **Event Bus**        | Custom events via `window.dispatchEvent()`          |
| **Shared State**     | Context providers in shell                          |
| **URL State**        | Query parameters for shareable state                |
| **Notification SDK** | Already implemented for cross-cutting notifications |

---

# 14. Build & Development Workflow

## 14.1 Development Commands

```bash
# Install all dependencies
npm install

# Start individual apps (run in separate terminals)
npm run dev:shell            # http://localhost:3000
npm run dev:cbms             # http://localhost:3001
npm run dev:cdts             # http://localhost:3002
npm run dev:products-angular # http://localhost:3003
```

## 14.2 Build Commands

```bash
# Build individual apps
npm run build -w apps/shell
npm run build -w apps/cbms
npm run build -w apps/cdts
npm run build -w apps/mfe-products-angular

# Preview built apps
npm run preview -w apps/shell
npm run preview -w apps/cbms
npm run preview -w apps/cdts
npm run preview -w apps/mfe-products-angular
```

## 14.3 Build Output

Each app produces:

```
dist/
├── assets/
│   ├── remoteEntry.js      # Federation entry (remotes only)
│   ├── index-[hash].js     # Main bundle
│   └── index-[hash].css    # Styles
└── index.html              # Entry HTML
```

## 14.4 Development Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Recommended Dev Workflow                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Terminal 1: npm run dev:cbms                                                │
│  Terminal 2: npm run dev:cdts                                                │
│  Terminal 3: npm run dev:products-angular                                    │
│  Terminal 4: npm run dev:shell                                               │
│                                                                              │
│  Browser: http://localhost:3000                                              │
│                                                                              │
│  Hot Module Replacement (HMR):                                               │
│  • Shell changes: Instant refresh                                            │
│  • MFE changes: Instant refresh in standalone mode                           │
│  • Federation changes: May require shell page refresh                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 15. Deployment Configuration

## 15.1 Vercel Configuration

```json
// vercel.json (per remote)
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

## 15.2 Netlify Configuration

```toml
# netlify.toml (per remote)
[[headers]]
  for = "/assets/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, OPTIONS"
    Access-Control-Allow-Headers = "*"
```

## 15.3 Production Remote URLs

The shell's `.env.production` configures production remote locations:

```dotenv
VITE_CBMS_REMOTE_ENTRY=https://incredible-cbms.netlify.app/assets/remoteEntry.js
VITE_CDTS_REMOTE_ENTRY=https://incredible-cdts.netlify.app/assets/remoteEntry.js
VITE_PRODUCTS_REMOTE_ENTRY=https://incredible-angular-products.netlify.app/assets/remoteEntry.js
```

## 15.4 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Production Deployment                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐                                                         │
│  │  Shell (Netlify │─────────────────────────────────────────┐              │
│  │  or Vercel)     │                                          │              │
│  │                 │         Runtime Fetches                  │              │
│  │  User Request   │◄────┬───────────────────────────────────┘              │
│  └────────┬────────┘     │                                                   │
│           │              │                                                   │
│           ▼              │                                                   │
│  ┌─────────────────┐     │    ┌─────────────────┐                           │
│  │  Browser        │     │    │  CBMS Remote    │                           │
│  │                 │     │    │  (Netlify)      │                           │
│  │  Shell renders  │     ├───►│  /assets/       │                           │
│  │  ───────────────│     │    │  remoteEntry.js │                           │
│  │  Load MFE       │─────┤    └─────────────────┘                           │
│  │                 │     │                                                   │
│  │                 │     │    ┌─────────────────┐                           │
│  │                 │     │    │  CDTS Remote    │                           │
│  │                 │     │    │  (Netlify)      │                           │
│  │                 │     ├───►│  /assets/       │                           │
│  │                 │     │    │  remoteEntry.js │                           │
│  │                 │     │    └─────────────────┘                           │
│  │                 │     │                                                   │
│  │                 │     │    ┌─────────────────┐                           │
│  │                 │     │    │  Products       │                           │
│  │                 │     │    │  (Netlify)      │                           │
│  │                 │     └───►│  /assets/       │                           │
│  │                 │          │  remoteEntry.js │                           │
│  └─────────────────┘          └─────────────────┘                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 16. Environment Configuration

## 16.1 Environment Files

### Development (.env.development)

```dotenv
VITE_CBMS_REMOTE_ENTRY=http://localhost:3001/assets/remoteEntry.js
VITE_CDTS_REMOTE_ENTRY=http://localhost:3002/assets/remoteEntry.js
VITE_PRODUCTS_REMOTE_ENTRY=http://localhost:3003/assets/remoteEntry.js
```

### Production (.env.production)

```dotenv
VITE_CBMS_REMOTE_ENTRY=https://incredible-cbms.netlify.app/assets/remoteEntry.js
VITE_CDTS_REMOTE_ENTRY=https://incredible-cdts.netlify.app/assets/remoteEntry.js
VITE_PRODUCTS_REMOTE_ENTRY=https://incredible-angular-products.netlify.app/assets/remoteEntry.js
```

## 16.2 Environment Variable Usage

```typescript
// In mfe-config.ts
const defaultRemoteEntries = {
  cbms: "http://localhost:3001/assets/remoteEntry.js",
  cdts: "http://localhost:3002/assets/remoteEntry.js",
  products: "http://localhost:3003/assets/remoteEntry.js",
};

// Environment override with fallback
remoteEntry: import.meta.env.VITE_CBMS_REMOTE_ENTRY ??
  defaultRemoteEntries.cbms;
```

## 16.3 Vite Environment Type Definitions

```typescript
// apps/shell/src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CBMS_REMOTE_ENTRY: string;
  readonly VITE_CDTS_REMOTE_ENTRY: string;
  readonly VITE_PRODUCTS_REMOTE_ENTRY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

# 17. Styling Architecture

## 17.1 Shell Styles (styles.css)

```css
/* Global styles */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f6f8fb;
}

/* Shell layout */
.shell {
  min-height: 100vh;
}

/* Header */
.shell__header {
  background: #111827;
  color: #fff;
  padding: 16px 20px;
}

/* Navigation menu */
.shell__menu {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.shell__menu-item {
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  color: inherit;
  text-decoration: none;
}

.shell__menu-item.is-active {
  background: #111827;
  color: white;
  border-color: #111827;
}

/* Content area */
.shell__content {
  padding: 20px;
}
```

## 17.2 MFE Common Styles

```css
/* Shared across CBMS and CDTS */
.mfe {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.mfe__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.mfe__list-item {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mfe__ghost,
.mfe__button {
  border: 1px solid #d1d5db;
  background: #f9fafb;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
}

.mfe__pager {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

## 17.3 CSS Methodology

The project uses **BEM (Block Element Modifier)** naming convention:

- **Block**: `.shell`, `.mfe`
- **Element**: `.shell__header`, `.mfe__list-item`
- **Modifier**: `.shell__menu-item.is-active`

---

# 18. Security Considerations

## 18.1 CORS Configuration

All remotes enable CORS to allow cross-origin federation:

```javascript
// Vite dev server
server: {
  cors: true
}

// Production headers (Vercel/Netlify)
"Access-Control-Allow-Origin": "*"
```

## 18.2 Security Recommendations

| Concern           | Current State   | Recommendation                          |
| ----------------- | --------------- | --------------------------------------- |
| CORS              | Wildcard (\*)   | Restrict to known origins in production |
| Remote URLs       | Hardcoded       | Use environment-specific configurations |
| Module Validation | Basic check     | Add integrity hashes for remote entries |
| Error Exposure    | Console logging | Sanitize error messages in production   |

## 18.3 Content Security Policy (Future)

For production hardening, consider CSP headers:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://incredible-cbms.netlify.app https://incredible-cdts.netlify.app https://incredible-angular-products.netlify.app;
```

---

# 19. Complete File Inventory

## 19.1 Root Files

| File              | Purpose                  |
| ----------------- | ------------------------ |
| package.json      | Workspace configuration  |
| package-lock.json | Dependency lock          |
| tsconfig.json     | Shared TypeScript config |
| README.md         | Quick start guide        |
| DOCUMENTATION.md  | This documentation       |
| .gitignore        | Git ignore rules         |

## 19.2 Shell Application

| File                      | Purpose                |
| ------------------------- | ---------------------- |
| index.html                | Entry HTML             |
| package.json              | Dependencies           |
| vite.config.ts            | Build configuration    |
| .env.development          | Local remote URLs      |
| .env.production           | Production remote URLs |
| netlify.toml              | Netlify deployment     |
| src/main.tsx              | Entry point            |
| src/bootstrap.tsx         | React root             |
| src/App.tsx               | Main component         |
| src/Menu.tsx              | Navigation             |
| src/RemoteComponent.tsx   | MFE loader             |
| src/mfe-config.ts         | MFE definitions        |
| src/mfe/loadRemoteVite.ts | Federation loader      |
| src/styles.css            | Global styles          |
| src/env.d.ts              | Environment types      |

## 19.3 CBMS Remote

| File             | Purpose           |
| ---------------- | ----------------- |
| index.html       | Entry HTML        |
| package.json     | Dependencies      |
| vite.config.js   | Federation config |
| vercel.json      | CORS headers      |
| netlify.toml     | CORS headers      |
| src/main.tsx     | Standalone entry  |
| src/bootstrap.ts | Mount/unmount     |
| src/CbmsApp.tsx  | Main component    |
| src/cbms.css     | Styles            |

## 19.4 CDTS Remote

| File             | Purpose           |
| ---------------- | ----------------- |
| index.html       | Entry HTML        |
| package.json     | Dependencies      |
| vite.config.js   | Federation config |
| vercel.json      | CORS headers      |
| netlify.toml     | CORS headers      |
| src/main.tsx     | Standalone entry  |
| src/bootstrap.ts | Mount/unmount     |
| src/CdtsApp.tsx  | Main component    |
| src/cdts.css     | Styles            |

## 19.5 Products Angular Remote

| File                                               | Purpose           |
| -------------------------------------------------- | ----------------- |
| index.html                                         | Entry HTML        |
| package.json                                       | Dependencies      |
| vite.config.mts                                    | Federation config |
| vercel.json                                        | CORS headers      |
| netlify.toml                                       | CORS headers      |
| tsconfig.json                                      | TypeScript config |
| tsconfig.app.json                                  | App-specific TS   |
| src/main.ts                                        | Standalone entry  |
| src/bootstrap.ts                                   | Re-export         |
| src/mfe-entry.js                                   | Mount/unmount     |
| src/mfe-entry.d.ts                                 | Type declarations |
| src/app/products-shell.component.js                | Router shell      |
| src/app/runtime-props.js                           | DI token          |
| src/app/data/products.js                           | Mock data         |
| src/app/pages/list/products-list.component.js      | List view         |
| src/app/pages/details/product-details.component.js | Detail view       |

## 19.6 Notification SDK

| File         | Purpose           |
| ------------ | ----------------- |
| package.json | Package config    |
| src/index.ts | TypeScript source |
| src/index.js | JavaScript source |

---

# 20. Troubleshooting Guide

## 20.1 Common Issues

### Remote fails to load

**Symptoms**: "Unable to load [name]" error in shell

**Solutions**:

1. Verify remote is running (`npm run dev:cbms`)
2. Check browser console for CORS errors
3. Verify remote entry URL is correct
4. Check for "already initialized" errors (usually safe)

### Hybrid runtime error

**Symptoms**: "Hybrid runtime detected" error

**Cause**: Attempting to load non-Vite federation remote

**Solution**: Ensure all remotes use Vite federation with `/assets/remoteEntry.js` path

### Route not updating in MFE

**Symptoms**: MFE shows stale content after navigation

**Solution**: Ensure MFE dispatches popstate event:

```javascript
window.dispatchEvent(new PopStateEvent("popstate"));
```

### Angular MFE zone.js errors

**Symptoms**: Change detection not working

**Solution**: Ensure zone.js is imported before Angular:

```javascript
import "zone.js";
import "@angular/compiler";
```

### Shared modules version mismatch

**Symptoms**: Multiple React instances, hooks errors

**Solution**: Ensure all React MFEs use identical React versions

## 20.2 Debug Commands

```bash
# Check if remotes are accessible
curl http://localhost:3001/assets/remoteEntry.js

# Check port usage
netstat -ano | findstr :3001

# Clear Vite cache
rm -rf node_modules/.vite
```

## 20.3 Logging Points

| Location            | Log                               | Purpose          |
| ------------------- | --------------------------------- | ---------------- |
| RemoteComponent.tsx | `[shell] Remote component failed` | Load failures    |
| loadRemoteVite.ts   | Container validation              | Invalid remotes  |
| mfe-entry.js        | Bootstrap errors                  | Angular failures |

---

---

# 21. Backend for Frontend (BFF)

## 21.1 Overview

The platform includes a C# .NET 8 Minimal API backend that serves as a Backend for Frontend (BFF). This BFF handles authentication, authorization, and provides shell configuration data.

## 21.2 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Authentication Flow                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Shell loads → calls /auth/me                                            │
│  2. If 401 → redirect to /auth/login?returnUrl=...                          │
│  3. User enters credentials → POST /auth/login                              │
│  4. BFF sets HttpOnly cookie → redirect to returnUrl                        │
│  5. Shell retries /auth/me → gets user info                                 │
│  6. Shell loads applications, profiles, menus from BFF                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 21.3 BFF Endpoints

### Authentication Endpoints

| Endpoint       | Method | Auth Required | Description                           |
| -------------- | ------ | ------------- | ------------------------------------- |
| `/auth/login`  | GET    | No            | Renders login form HTML               |
| `/auth/login`  | POST   | No            | Processes login, sets HttpOnly cookie |
| `/auth/logout` | POST   | Yes           | Clears auth cookie                    |
| `/auth/me`     | GET    | Yes           | Returns current user info             |

### Shell Configuration Endpoints

| Endpoint                                         | Method | Auth Required | Description                       |
| ------------------------------------------------ | ------ | ------------- | --------------------------------- |
| `/shell/apps`                                    | GET    | Yes           | List available applications       |
| `/shell/apps/{appId}/profiles`                   | GET    | Yes           | List profiles for an application  |
| `/shell/apps/{appId}/profiles/{profileId}/menus` | GET    | Yes           | Get menu items for a profile      |
| `/shell/mfes/resolve`                            | POST   | Yes           | Resolve MFE configuration by name |

## 21.4 Data Model

```typescript
// User returned from /auth/me
interface User {
  displayName: string;
  windowsId: string;
  email: string;
}

// Application from /shell/apps
interface Application {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

// Profile from /shell/apps/{appId}/profiles
interface Profile {
  id: string;
  name: string;
  description: string;
}

// MenuItem from /shell/apps/{appId}/profiles/{profileId}/menus
interface MenuItem {
  id: string;
  name: string;
  icon?: string;
  order: number;
  mfeConfig?: MfeConfig;
}

// MFE configuration
interface MfeConfig {
  name: string;
  remoteEntry: string;
  scope: string;
  exposedModule: string;
  route: string;
}
```

## 21.5 Cookie Configuration

```csharp
options.Cookie.Name = "MFE.Auth";
options.Cookie.HttpOnly = true;          // Prevents XSS access
options.Cookie.SameSite = SameSiteMode.Lax;
options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
options.ExpireTimeSpan = TimeSpan.FromHours(8);
```

## 21.6 CORS Configuration

The BFF is configured to accept requests from:

- `http://localhost:3000` (Shell dev server)
- `http://localhost:5173` (Vite default)

Credentials are included via `AllowCredentials()` for cookie-based auth.

## 21.7 Running the BFF

```bash
cd backend/shell-bff
dotnet run
```

Server starts on `http://localhost:5001`.

## 21.8 Frontend Integration

The shell includes:

- **AuthContext**: React context managing auth state, login/logout
- **ShellContext**: React context for apps/profiles/menus state
- **api.ts**: Fetch wrapper with automatic 401 redirect

```typescript
// api.ts - All API calls use credentials: "include" for cookies
const fetchWithAuth = async <T>(url: string): Promise<T> => {
  const response = await fetch(`${BFF_URL}${url}`, {
    credentials: "include",
  });

  if (response.status === 401) {
    window.location.href = `${AUTH_LOGIN_URL}?returnUrl=...`;
    throw new Error("Unauthorized");
  }

  return response.json();
};
```

---

# 22. Platform Shared Packages

The platform provides several shared packages under the `packages/` directory. These are consumed by MFE apps via npm workspace dependencies (`@mfe/platform-*`).

## 22.1 Package Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MFE Applications                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐  │
│  │  Shell    │    │  CBMS    │    │  CDTS    │    │  Products    │  │
│  └────┬─────┘    └────┬─────┘    └──────────┘    └──────────────┘  │
│       │               │                                              │
│       ▼               ▼                                              │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                  @mfe/platform-ui                         │       │
│  │  Button, Input, Select, MultiSelect, SmartSelect,        │       │
│  │  DatePicker, Table, Modal, Tabs, Toast, Loader, Form,    │       │
│  │  Checkbox, TextArea, FormField, FormBuilder               │       │
│  │  ── depends on: react-hook-form, @hookform/resolvers ──  │       │
│  └────────────────────────┬─────────────────────────────────┘       │
│                           │                                          │
│  ┌────────────────────────▼─────────────────────────────────┐       │
│  │                @mfe/platform-utils                        │       │
│  │  DateUtils, ValidationUtils, StorageUtils, FormatUtils,   │       │
│  │  EncryptionUtils, FormSchema (defineFormSchema + Zod)     │       │
│  │  ── depends on: zod ──                                    │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                      │
│  ┌─────────────────────┐   ┌─────────────────────┐                  │
│  │ @mfe/platform-events│   │@mfe/platform-contracts│                 │
│  │  Event bus system    │   │  MountProps, types    │                 │
│  └─────────────────────┘   └─────────────────────┘                  │
│                                                                      │
│  ┌─────────────────────┐   ┌─────────────────────┐                  │
│  │ @mfe/platform-core  │   │ @mfe/build-tools     │                 │
│  │  API, auth, config   │   │ PostCSS MFE scoping  │                 │
│  └─────────────────────┘   └─────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

## 22.2 @mfe/platform-utils

**Location:** `packages/platform-utils/`
**Dependencies:** `zod ^4.3.6`

Reusable, framework-agnostic utility functions shared across all MFEs.

### Modules

| Module              | Exports                                                                                                                                    | Description                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| **DateUtils**       | `formatDate`, `formatDateTime`, `toISODate`, `timeAgo`, `isValidDate`, `diffInDays`                                                        | Date formatting and comparison                     |
| **ValidationUtils** | `required`, `isEmail`, `minLength`, `maxLength`, `matchesPattern`, `inRange`, `validate`, `isUrl`, `isPhone`                               | Standalone validators returning `ValidationResult` |
| **StorageUtils**    | `storageGet`, `storageSet`, `storageRemove`, `storageClearByPrefix`, `storageHas`                                                          | Typed localStorage wrappers                        |
| **FormatUtils**     | `formatNumber`, `formatCurrency`, `formatPercent`, `formatCompact`, `truncate`, `titleCase`, `slugify`, `mask`, `pluralise`, `formatBytes` | String/number formatting                           |
| **EncryptionUtils** | `base64Encode`, `base64Decode`, `sha256`, `uuid`, `xorObfuscate`, `xorDeobfuscate`, `constantTimeEqual`                                    | Encoding, hashing, obfuscation                     |
| **FormSchema**      | `defineFormSchema`, `evaluateVisibility`, `toZodRefine`                                                                                    | Declarative form config → Zod schema compiler      |

### Usage

```ts
import {
  formatDate,
  required,
  isEmail,
  uuid,
  defineFormSchema,
} from "@mfe/platform-utils";
import type {
  FormConfig,
  FieldDef,
  ValidationResult,
} from "@mfe/platform-utils";
```

## 22.3 @mfe/platform-ui

**Location:** `packages/platform-ui/`
**Dependencies:** `react-hook-form ^7.71.2`, `@hookform/resolvers ^5.2.2`, `react-select ^5.10.2`

Shared React UI component library with a consistent theme system.

### Components

| Component          | Props Highlight                                   | Description                                        |
| ------------------ | ------------------------------------------------- | -------------------------------------------------- |
| **Button**         | `variant`, `size`, `loading`                      | Primary/secondary/ghost buttons with loading state |
| **Input**          | `label`, `error`, `forwardRef`                    | Text input with label and error display            |
| **TextArea**       | `label`, `error`, `rows`, `forwardRef`            | Multi-line text input                              |
| **Checkbox**       | `label`, `error`, `forwardRef`                    | Checkbox with label and error                      |
| **Select**         | `label`, `error`, `options`, `onChange(value)`    | Single-select dropdown (wraps react-select)        |
| **MultiSelect**    | `label`, `error`, `options`, `onChange(values[])` | Multi-select dropdown                              |
| **SmartSelect**    | `dataSource`, `dependsOn`, `dependencyValues`     | Advanced select with static/API data, cascading    |
| **DatePicker**     | `label`, `error`, `min`, `max`                    | Native date input                                  |
| **Table**          | `columns`, `data`, `rowKey`, `striped`            | Typed data table                                   |
| **Modal**          | `open`, `onClose`, `title`, `footer`              | Dialog overlay                                     |
| **Tabs**           | `tabs`, `defaultTab`                              | Tab-based navigation                               |
| **Toast**          | `ToastContainer`, `showToast()`                   | Toast notifications                                |
| **Loader**         | `size`, `label`, `overlay`                        | Loading spinner                                    |
| **Form**           | `onSubmit`                                        | Form wrapper (prevents default)                    |
| **FormGroup**      | —                                                 | Flex column wrapper for label+input+error          |
| **FormRow**        | —                                                 | Horizontal row for side-by-side fields             |
| **FormActions**    | —                                                 | Button row (submit/cancel)                         |
| **FormField**      | `name`, `fieldDef`, `control`, `error`, `visible` | Polymorphic field renderer                         |
| **FormBuilder**    | `config`, `layout`, `submitLabel`                 | Fully declarative form renderer                    |
| **useFormBuilder** | hook                                              | RHF + Zod wiring for custom layouts                |

### Usage

```tsx
import {
  Button,
  Input,
  FormBuilder,
  useFormBuilder,
  showToast,
} from "@mfe/platform-ui";
import type { FormBuilderProps, FieldLayout } from "@mfe/platform-ui";
```

## 22.4 @mfe/platform-contracts

**Location:** `packages/platform-contracts/`

TypeScript interfaces for MFE mounting:

```ts
interface MountProps {
  basePath?: string;
  routePath?: string;
  user?: MfeUser;
  emitEvent?: <T>(event: string, detail: T) => void;
  onEvent?: <T>(event: string, handler: (detail: T) => void) => () => void;
}

interface MfeUser {
  id: string;
  email: string;
  displayName: string;
}
```

## 22.5 @mfe/platform-events

**Location:** `packages/platform-events/`

Cross-MFE event bus for decoupled communication between Shell and remotes.

## 22.6 @mfe/platform-core

**Location:** `packages/platform-core/`

Core infrastructure: API client, auth manager, config manager, error handler, HTTP interceptor, token manager.

## 22.7 Adding a Platform Package to Your MFE

```json
// apps/your-mfe/package.json
{
  "dependencies": {
    "@mfe/platform-ui": "0.1.0",
    "@mfe/platform-utils": "0.1.0"
  }
}
```

Then run `npm install` from the workspace root. Import directly:

```ts
import { FormBuilder, showToast } from "@mfe/platform-ui";
import { defineFormSchema, uuid } from "@mfe/platform-utils";
```

---

# 23. Form Builder System

## 23.1 Overview

The Form Builder system provides a **declarative, config-driven approach** to creating forms in MFE applications. It eliminates boilerplate by replacing manual `useState` + imperative validation with a single configuration object.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Developer writes                        │
│                   FormConfig {}                          │
│  (fields, rules, visibility, async, submit pipeline)    │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────▼───────────┐
          │   defineFormSchema()   │   ← @mfe/platform-utils
          │   Compiles to Zod     │
          │   schema + metadata   │
          └───────────┬───────────┘
                      │
    ┌─────────────────┼─────────────────┐
    ▼                                   ▼
┌─────────────┐              ┌──────────────────┐
│ <FormBuilder│              │ useFormBuilder() │
│   config=.. │              │   (hook-based)   │
│ />          │              │                  │
│             │              │ Returns: fields, │
│ Zero-code   │              │ control, submit, │
│ auto-render │              │ visibility, etc. │
└──────┬──────┘              └────────┬─────────┘
       │                              │
       ▼                              ▼
┌─────────────────────────────────────────────┐
│          react-hook-form + zodResolver       │   ← @mfe/platform-ui
│     <FormField> renders correct component    │
│     per field type (Input, Select, etc.)     │
└─────────────────────────────────────────────┘
```

### Two Usage Patterns

| Pattern               | Component                             | Best For                          |
| --------------------- | ------------------------------------- | --------------------------------- |
| **Fully Declarative** | `<FormBuilder config={...} />`        | Standard forms, rapid development |
| **Hook-based**        | `useFormBuilder(config)` + custom JSX | Complex layouts, multi-tab forms  |

## 23.2 Quick Start

### Simplest Possible Form

```tsx
import { FormBuilder, showToast } from "@mfe/platform-ui";
import type { FormConfig } from "@mfe/platform-utils";

const config: FormConfig = {
  fields: {
    name: {
      type: "text",
      label: "Name",
      rules: [{ rule: "required" }],
    },
    email: {
      type: "email",
      label: "Email",
      rules: [{ rule: "required" }, { rule: "email" }],
    },
    message: {
      type: "textarea",
      label: "Message",
      rules: [{ rule: "required" }],
    },
  },
  submit: {
    action: async (values) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(values),
      });
      return response.json();
    },
    onSuccess: (_result, helpers) => {
      helpers.reset();
      helpers.showToast({ variant: "success", title: "Sent!" });
    },
  },
};

export const ContactPage = () => (
  <FormBuilder
    config={config}
    submitLabel="Send Message"
    showToast={(opts) => showToast({ ...opts, message: opts.message ?? "" })}
  />
);
```

**That's it.** No `useState`, no `onChange` handlers, no manual validation, no error state management.

## 23.3 FormConfig Reference

The `FormConfig` is the central configuration object:

```ts
interface FormConfig<TValues = Record<string, unknown>> {
  fields: Record<string, FieldDef>; // Field name → definition
  submit?: SubmitConfig<TValues>; // Submit pipeline
}
```

### 23.3.1 Field Definition (FieldDef)

```ts
interface FieldDef {
  type: FieldType; // "text" | "email" | "password" | "number" |
  // "select" | "multiselect" | "smartselect" |
  // "date" | "checkbox" | "textarea"
  label: string; // Display label
  defaultValue?: unknown; // Initial value
  placeholder?: string; // Placeholder text
  disabled?: boolean; // Disable the field
  rules?: FieldRule[]; // Sync validation rules
  dependsOn?: DependsOn | DependsOn[]; // Cross-field validations
  visibleWhen?: VisibleWhen | VisibleWhen[]; // Conditional visibility
  asyncValidation?: AsyncValidation; // Async server validation
  componentProps?: Record<string, unknown>; // Pass-through to UI component
}
```

### 23.3.2 Field Types → UI Component Mapping

| Type            | Component                 | Notes                                                     |
| --------------- | ------------------------- | --------------------------------------------------------- |
| `"text"`        | `<Input type="text">`     | Standard text input with `forwardRef`                     |
| `"email"`       | `<Input type="email">`    | Email input                                               |
| `"password"`    | `<Input type="password">` | Password input                                            |
| `"number"`      | `<Input type="number">`   | Numeric input (stored as string internally)               |
| `"select"`      | `<Select>`                | Pass `options` via `componentProps`                       |
| `"multiselect"` | `<MultiSelect>`           | Pass `options` via `componentProps`, value is `string[]`  |
| `"smartselect"` | `<SmartSelect>`           | Pass `dataSource`, `dependsOn`, etc. via `componentProps` |
| `"date"`        | `<DatePicker>`            | Native date input, value is `"YYYY-MM-DD"` string         |
| `"checkbox"`    | `<Checkbox>`              | Boolean value                                             |
| `"textarea"`    | `<TextArea>`              | Multi-line text with `forwardRef`                         |

## 23.4 Validation Rules

### 23.4.1 Built-in Rules

Every rule optionally accepts a `message` override. If omitted, a sensible default is generated.

```ts
// Required — field must not be empty
{ rule: "required" }
{ rule: "required", message: "Please enter your name" }

// String length
{ rule: "minLength", params: 3 }
{ rule: "maxLength", params: 200 }

// Numeric range (for type: "number")
{ rule: "min", params: 0 }
{ rule: "max", params: 999999 }

// Pattern (regex)
{ rule: "pattern", params: /^[A-Z]/, message: "Must start with uppercase" }

// Format validators
{ rule: "email" }                    // email format
{ rule: "url" }                      // URL format
{ rule: "phone" }                    // phone number (7-15 digits)

// Custom synchronous validator
{
  rule: "custom",
  validate: (value) => {
    if (value === "forbidden") return "This value is not allowed";
    return true;    // true = valid, string = error message
  }
}
```

### 23.4.2 Cross-field Validation (dependsOn)

Cross-field rules validate one field against another. They run via Zod's `superRefine` at the schema level.

```ts
// Password confirmation must match password
{
  dependsOn: {
    field: "password",
    rule: "matchField",
    message: "Passwords do not match."
  }
}

// End date must be after start date
{
  dependsOn: {
    field: "startDate",
    rule: "afterDate",
    message: "End date must be after start date."
  }
}

// Before date
{
  dependsOn: {
    field: "endDate",
    rule: "beforeDate"
  }
}

// Numeric comparisons
{
  dependsOn: { field: "minPrice", rule: "greaterThan" }
}
{
  dependsOn: { field: "maxPrice", rule: "lessThan" }
}

// Custom cross-field validation
{
  dependsOn: {
    field: "country",
    rule: "custom",
    validate: (value, depValue, allValues) => {
      if (depValue === "us" && !String(value).match(/^\d{5}$/)) {
        return "US zip codes must be 5 digits";
      }
      return true;
    }
  }
}

// Multiple dependencies (AND — all must pass)
{
  dependsOn: [
    { field: "startDate", rule: "afterDate" },
    { field: "maxDate", rule: "beforeDate" }
  ]
}
```

### 23.4.3 Async Validation

For server-side checks (e.g., "is this email already registered?"):

```ts
{
  asyncValidation: {
    validate: async (value, allFormValues) => {
      const response = await fetch(`/api/check-email?email=${value}`);
      const { available } = await response.json();
      return available ? true : "This email is already taken.";
    },
    debounceMs: 500  // Wait 500ms after user stops typing (default: 400)
  }
}
```

**Behavior:**

- Triggered on value change (debounced)
- Empty values are skipped (use `required` rule for mandatory fields)
- A "Checking…" indicator appears on the field during async validation
- Returns `true` if valid, or an error message string if invalid
- Receives `(value, allFormValues)` so you can build context-dependent checks

### 23.4.4 Conditional Visibility (visibleWhen)

Fields can be shown/hidden based on other field values:

```ts
// Show city only when country is selected (truthy)
{
  visibleWhen: { field: "country", operator: "truthy" }
}

// Show "other" input only when select value equals "other"
{
  visibleWhen: { field: "category", operator: "eq", value: "other" }
}

// Show field when value is NOT equal
{
  visibleWhen: { field: "role", operator: "neq", value: "viewer" }
}

// Show field when value is in a set
{
  visibleWhen: { field: "subject", operator: "in", value: ["support", "billing"] }
}

// Show field when value is NOT in a set
{
  visibleWhen: { field: "type", operator: "notIn", value: ["internal", "test"] }
}

// Custom visibility logic
{
  visibleWhen: {
    field: "role",
    operator: "custom",
    test: (depValue, allValues) => depValue === "admin" && allValues.department === "engineering"
  }
}

// Multiple conditions (ALL must be true — AND logic)
{
  visibleWhen: [
    { field: "country", operator: "truthy" },
    { field: "role", operator: "neq", value: "viewer" }
  ]
}
```

**Behavior:**

- Hidden fields return `null` (not rendered at all)
- Visibility is reactively computed on every keystroke via `useWatch`
- Hidden fields still participate in the Zod schema (their values are preserved)

## 23.5 Submit Pipeline

The submit pipeline handles the full lifecycle: transform → confirm → action → success/error.

```ts
interface SubmitConfig<TValues, TResult> {
  transform?: (values: TValues) => TValues | Record<string, unknown>;
  action: (values: TValues) => Promise<TResult>;
  onSuccess?: (result: TResult, helpers: SubmitHelpers) => void;
  onError?: (error: unknown, helpers: SubmitHelpers) => void;
  confirmMessage?: string;
}

interface SubmitHelpers {
  reset: () => void;
  showToast: (opts: {
    variant: "success" | "error" | "info";
    title: string;
    message?: string;
  }) => void;
  navigate?: (path: string) => void;
}
```

### Example: Full Pipeline

```ts
submit: {
  // 1. Pre-submit transform (optional)
  transform: (values) => ({
    ...values,
    amount: Number(values.amount),           // Convert string to number
    email: String(values.email).toLowerCase() // Normalize email
  }),

  // 2. Confirmation prompt (optional)
  confirmMessage: "Are you sure you want to submit this form?",

  // 3. The actual submit action
  action: async (values) => {
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) throw new Error("Failed to create payment");
    return response.json();
  },

  // 4. Success handler
  onSuccess: (result, helpers) => {
    helpers.reset();                        // Reset form to defaults
    helpers.showToast({
      variant: "success",
      title: "Payment Created",
      message: `Payment #${result.id} saved successfully.`
    });
    helpers.navigate?.("/payments");        // Navigate away
  },

  // 5. Error handler
  onError: (error, helpers) => {
    helpers.showToast({
      variant: "error",
      title: "Failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  },
}
```

### Submit Flow Diagram

```
User clicks Submit
       │
       ▼
┌─ Validation ──────────────────────────┐
│  Zod schema validation (all rules)    │
│  ┌─ Sync rules pass? ─────────────┐  │
│  │  No → Show field errors         │  │
│  │  Yes → Continue                  │  │
│  └─────────────────────────────────┘  │
└───────────────────┬───────────────────┘
                    │  All valid
                    ▼
        ┌── confirmMessage? ──┐
        │ Yes                No│
        ▼                     │
  ┌ Show Modal ┐              │
  │ User Cancel│→ Stop        │
  │ User OK    │──────────────┤
  └────────────┘              │
                    ▼         │
            ┌── transform? ──┬┘
            │  Yes: apply    │
            └────────┬───────┘
                     ▼
              ┌── action() ──┐
              │  (async)     │
              │  API call    │
              └──────┬───────┘
              ┌──────┼───────┐
              ▼              ▼
          Success         Error
              │              │
              ▼              ▼
         onSuccess()    onError()
         (reset,toast,  (toast,log)
          navigate)
```

## 23.6 componentProps — Passing Extra Props to UI Components

The `componentProps` field lets you forward any extra props to the underlying platform-ui component:

### Select Options

```ts
{
  type: "select",
  label: "Status",
  componentProps: {
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
}
```

### MultiSelect Options

```ts
{
  type: "multiselect",
  label: "Tags",
  componentProps: {
    options: [
      { value: "urgent", label: "Urgent" },
      { value: "review", label: "Review" },
    ],
    searchable: true,
  },
}
```

### SmartSelect with Static Data

```ts
{
  type: "smartselect",
  label: "Country",
  componentProps: {
    dataSource: { type: "static", data: [{ id: "us", name: "USA" }, ...] },
    valueField: "id",
    textField: "name",
  },
}
```

### SmartSelect with API Data Source

```ts
{
  type: "smartselect",
  label: "Product",
  componentProps: {
    dataSource: {
      type: "api",
      url: "/api/products",
      method: "GET",
      resultKey: "items",
    },
    valueField: "productId",
    textField: "productName",
    searchable: true,
  },
}
```

### Cascading SmartSelects (Country → City)

```ts
// In FormConfig.fields:
country: {
  type: "smartselect",
  label: "Country",
  componentProps: {
    dataSource: { type: "static", data: countryData },
    valueField: "id",
    textField: "name",
  },
},
city: {
  type: "smartselect",
  label: "City",
  visibleWhen: { field: "country", operator: "truthy" },
  componentProps: {
    dataSource: { type: "static", data: cityData },
    dependsOn: "country",         // SmartSelect filters by this field
    valueField: "id",
    textField: "name",
  },
},
```

---

# 24. Validation Utilities Reference

## 24.1 Standalone Validators (@mfe/platform-utils)

These validators exist in `validation-utils.ts` and return `ValidationResult`:

```ts
type ValidationResult = { valid: true } | { valid: false; message: string };
```

| Function         | Signature                                      | Description                           |
| ---------------- | ---------------------------------------------- | ------------------------------------- |
| `required`       | `(value, label?) → ValidationResult`           | Not null/undefined/empty-string       |
| `isEmail`        | `(value) → ValidationResult`                   | Email regex check                     |
| `minLength`      | `(value, min, label?) → ValidationResult`      | String minimum length                 |
| `maxLength`      | `(value, max, label?) → ValidationResult`      | String maximum length                 |
| `matchesPattern` | `(value, pattern, message) → ValidationResult` | Regex test                            |
| `inRange`        | `(value, min, max, label?) → ValidationResult` | Number in range                       |
| `validate`       | `(value, ...validators) → ValidationResult`    | Pipe validators, return first failure |
| `isUrl`          | `(value) → ValidationResult`                   | URL validity                          |
| `isPhone`        | `(value) → ValidationResult`                   | Phone (7-15 digits)                   |

### Usage (Standalone — Without FormBuilder)

```ts
import { required, isEmail, validate } from "@mfe/platform-utils";

const result = validate(
  userInput,
  (v) => required(v, "Email"),
  (v) => isEmail(v as string),
);

if (!result.valid) {
  console.error(result.message);
}
```

### Usage (As Zod Refine — Bridge)

```ts
import { required, toZodRefine } from "@mfe/platform-utils";
import { z } from "zod/v4";

const schema = z.object({
  name: z.string().refine(...toZodRefine(required, "Name")),
});
```

## 24.2 FormSchema Validation (Used by FormBuilder)

When you define a `FormConfig`, the `defineFormSchema()` function compiles your rules into a Zod schema automatically. You do **not** need to write Zod schemas manually.

```ts
import { defineFormSchema } from "@mfe/platform-utils";

const { schema, fieldsMeta, defaultValues, submitConfig } = defineFormSchema({
  fields: {
    email: {
      type: "email",
      label: "Email",
      rules: [{ rule: "required" }, { rule: "email" }],
    },
  },
});

// schema is a z.ZodObject — you can use it directly with react-hook-form
// or anywhere else you need Zod validation
```

---

# 25. FormBuilder API Reference

## 25.1 `<FormBuilder>` Component

**Import:** `import { FormBuilder } from "@mfe/platform-ui";`

### Props

| Prop              | Type                                      | Default            | Description                            |
| ----------------- | ----------------------------------------- | ------------------ | -------------------------------------- |
| `config`          | `FormConfig \| FormSchemaResult`          | _required_         | The form definition                    |
| `layout`          | `FieldLayout[]`                           | auto (1 field/row) | Row layout specification               |
| `submitLabel`     | `string`                                  | `"Submit"`         | Submit button text                     |
| `submittingLabel` | `string`                                  | `"Submitting…"`    | Button text during submit              |
| `onCancel`        | `() => void`                              | —                  | Shows cancel button if provided        |
| `cancelLabel`     | `string`                                  | `"Cancel"`         | Cancel button text                     |
| `navigate`        | `(path: string) => void`                  | —                  | Navigation function for submit helpers |
| `showToast`       | `(opts) => void`                          | —                  | Toast function for submit helpers      |
| `className`       | `string`                                  | —                  | Extra CSS class on `<Form>`            |
| `style`           | `CSSProperties`                           | —                  | Inline style on `<Form>`               |
| `children`        | `(fb: UseFormBuilderReturn) => ReactNode` | —                  | Render prop for custom rendering       |

### Layout Specification

```ts
type FieldLayout = string | string[];

// Examples:
layout={[
  ["firstName", "lastName"],    // Two fields side-by-side
  "email",                      // Single field in its own row
  ["city", "state", "zip"],     // Three fields in one row
]}
```

If `layout` is omitted, each field renders as its own row in the order they appear in `config.fields`.

### Render Prop Usage

For ultimate flexibility, use the `children` render prop:

```tsx
<FormBuilder config={config}>
  {(fb) => (
    <div className="my-custom-layout">
      <FormField name="email" {...fb.fields.email} control={fb.control} />
      <button onClick={fb.handleSubmit}>Go</button>
    </div>
  )}
</FormBuilder>
```

## 25.2 `useFormBuilder()` Hook

**Import:** `import { useFormBuilder } from "@mfe/platform-ui";`

```ts
const fb = useFormBuilder(config, {
  navigate: (path) => router.push(path),
  showToast: (opts) => showToast({ ...opts, message: opts.message ?? "" }),
});
```

### Return Value

| Property         | Type                               | Description                                    |
| ---------------- | ---------------------------------- | ---------------------------------------------- |
| `fields`         | `Record<string, FormFieldBinding>` | Per-field binding objects                      |
| `fieldNames`     | `string[]`                         | Ordered field names                            |
| `form`           | `UseFormReturn`                    | Raw react-hook-form instance (escape hatch)    |
| `control`        | `Control`                          | RHF control for `<Controller>` / `<FormField>` |
| `handleSubmit`   | `(e?) => void`                     | Wrapped submit (runs full pipeline)            |
| `isSubmitting`   | `boolean`                          | Whether submit action is in progress           |
| `isConfirmOpen`  | `boolean`                          | Whether confirmation modal is showing          |
| `confirmSubmit`  | `() => void`                       | Confirm the pending submit                     |
| `cancelConfirm`  | `() => void`                       | Cancel the pending submit                      |
| `confirmMessage` | `string \| undefined`              | Confirm message text                           |
| `reset`          | `() => void`                       | Reset form to defaults                         |
| `submitError`    | `string \| null`                   | Non-field submit error message                 |

### FormFieldBinding Shape

```ts
interface FormFieldBinding {
  name: string;
  fieldDef: FieldDef;
  error?: FieldError;
  visible: boolean;
  asyncValidating: boolean;
}
```

### Hook-based Custom Layout Example

```tsx
import {
  useFormBuilder,
  FormField,
  Form,
  FormGroup,
  FormRow,
  FormActions,
  Button,
} from "@mfe/platform-ui";

const MyForm = () => {
  const fb = useFormBuilder(config, { showToast });

  return (
    <Form onSubmit={fb.handleSubmit}>
      <FormRow>
        <FormGroup>
          <FormField
            name="firstName"
            fieldDef={fb.fields.firstName.fieldDef}
            control={fb.control}
            error={fb.fields.firstName.error}
            visible={fb.fields.firstName.visible}
          />
        </FormGroup>
        <FormGroup>
          <FormField
            name="lastName"
            fieldDef={fb.fields.lastName.fieldDef}
            control={fb.control}
            error={fb.fields.lastName.error}
            visible={fb.fields.lastName.visible}
          />
        </FormGroup>
      </FormRow>

      <FormActions>
        <Button type="submit" loading={fb.isSubmitting}>
          Submit
        </Button>
      </FormActions>
    </Form>
  );
};
```

## 25.3 `<FormField>` Component

**Import:** `import { FormField } from "@mfe/platform-ui";`

Polymorphic field renderer that maps `FieldDef.type` to the correct platform-ui component.

| Prop              | Type         | Description                        |
| ----------------- | ------------ | ---------------------------------- |
| `name`            | `string`     | Field name                         |
| `fieldDef`        | `FieldDef`   | Field definition                   |
| `control`         | `Control`    | RHF control                        |
| `error`           | `FieldError` | Field error object                 |
| `visible`         | `boolean`    | Whether to render (default `true`) |
| `asyncValidating` | `boolean`    | Show "Checking…" indicator         |

## 25.4 `<Checkbox>` Component

**Import:** `import { Checkbox } from "@mfe/platform-ui";`

```tsx
<Checkbox
  label="I agree to the terms"
  checked={value}
  onChange={(e) => setValue(e.target.checked)}
  error="You must agree"
/>
```

Supports `React.forwardRef<HTMLInputElement>`.

## 25.5 `<TextArea>` Component

**Import:** `import { TextArea } from "@mfe/platform-ui";`

```tsx
<TextArea
  label="Comments"
  placeholder="Write something…"
  rows={6}
  value={text}
  onChange={(e) => setText(e.target.value)}
  error="Too short"
/>
```

Supports `React.forwardRef<HTMLTextAreaElement>`.

---

# 26. Migration Guide: Manual Forms → FormBuilder

## 26.1 Before (Manual State + Imperative Validation)

```tsx
// ❌ OLD PATTERN — 8 useState calls, manual validation, ~300 lines
const [customer, setCustomer] = useState("");
const [amount, setAmount] = useState("");
const [status, setStatus] = useState("");
const [tags, setTags] = useState<string[]>([]);
const [dueDate, setDueDate] = useState("");
const [country, setCountry] = useState("");
const [city, setCity] = useState("");
const [notes, setNotes] = useState("");
const [errors, setErrors] = useState<Record<string, string>>({});

const validate = (): boolean => {
  const e: Record<string, string> = {};
  if (!customer.trim()) e.customer = "Customer name is required";
  if (!amount.trim()) e.amount = "Amount is required";
  else if (isNaN(Number(amount)) || Number(amount) <= 0) e.amount = "Enter a positive amount";
  if (!status) e.status = "Select a status";
  if (!dueDate) e.dueDate = "Due date is required";
  if (!country) e.country = "Select a country";
  if (!city) e.city = "Select a city";
  setErrors(e);
  return Object.keys(e).length === 0;
};

// Then manually wiring up inputs:
<Input value={customer} onChange={(e) => setCustomer(e.target.value)} error={errors.customer} />
<Input value={amount} onChange={(e) => setAmount(e.target.value)} error={errors.amount} />
// ... 6 more fields ...
```

## 26.2 After (FormBuilder — Declarative Config)

```tsx
// ✅ NEW PATTERN — Single config object, ~80 lines
import { FormBuilder, showToast } from "@mfe/platform-ui";
import type { FormConfig, FieldLayout } from "@mfe/platform-ui";

const config: FormConfig = {
  fields: {
    customer: {
      type: "text",
      label: "Customer",
      rules: [{ rule: "required" }],
    },
    amount: {
      type: "number",
      label: "Amount",
      rules: [{ rule: "required" }, { rule: "min", params: 0.01 }],
    },
    status: {
      type: "select",
      label: "Status",
      rules: [{ rule: "required" }],
      componentProps: { options: statusOptions },
    },
    dueDate: { type: "date", label: "Due Date", rules: [{ rule: "required" }] },
    country: {
      type: "smartselect",
      label: "Country",
      rules: [{ rule: "required" }],
      componentProps: { dataSource, valueField: "id", textField: "name" },
    },
    city: {
      type: "smartselect",
      label: "City",
      rules: [{ rule: "required" }],
      visibleWhen: { field: "country", operator: "truthy" },
      componentProps: { dataSource: cityData, dependsOn: "country" },
    },
    tags: {
      type: "multiselect",
      label: "Tags",
      componentProps: { options: tagOptions },
    },
    notes: { type: "textarea", label: "Notes" },
  },
  submit: {
    confirmMessage: "Submit this payment?",
    action: async (values) =>
      fetch("/api/payments", {
        method: "POST",
        body: JSON.stringify(values),
      }).then((r) => r.json()),
    onSuccess: (_, helpers) => {
      helpers.reset();
      helpers.showToast({ variant: "success", title: "Saved!" });
    },
  },
};

const layout: FieldLayout[] = [
  ["customer", "amount"],
  ["status", "dueDate"],
  ["country", "city"],
  ["tags", "notes"],
];

<FormBuilder
  config={config}
  layout={layout}
  submitLabel="Create Payment"
  showToast={showToast}
/>;
```

## 26.3 Migration Steps

1. **Add dependency**: Add `"@mfe/platform-utils": "0.1.0"` to your MFE's `package.json` (if not already present). Run `npm install`.

2. **Define config**: Convert each `useState` field into a `FieldDef` entry in the config's `fields` object. Map existing validation `if/else` checks to `rules[]`.

3. **Define layout**: Group field names into arrays for side-by-side rendering, or omit `layout` for one-field-per-row.

4. **Define submit**: Move your submit logic into `submit.action`, confirmation modal to `submit.confirmMessage`, success/error handling to callbacks.

5. **Replace JSX**: Replace all manual `<Input>`, `<Select>`, etc. with a single `<FormBuilder config={...} layout={...} />`.

6. **Delete state**: Remove all `useState` calls for form fields and errors.

## 26.4 When to Use Hook vs Component

| Use `<FormBuilder>` when: | Use `useFormBuilder()` when:            |
| ------------------------- | --------------------------------------- |
| Standard form layout      | Tabs-based or multi-section layout      |
| Rapid prototyping         | Mixing form fields with custom UI       |
| Consistency across team   | Conditional sections beyond field-level |
| Simple CRUD forms         | Need direct access to RHF methods       |

## 26.5 Demo Page

A comprehensive demo page is available at the CBMS `/demo` route, accessible via the **"🧩 FormBuilder Demo"** button on the Payments list page. It showcases:

- **Demo 1 (Full Declarative)**: All field types, all validation rules, async validation, cross-field validation, conditional visibility, cascading selects, confirmation modal, submit pipeline
- **Demo 2 (Hook-based)**: Custom layout with `useFormBuilder()` + manual `<FormField>` placement
- **Demo 3 (Minimal)**: Three-field form with zero layout config

---

# Appendix A: Glossary

| Term                     | Definition                                                           |
| ------------------------ | -------------------------------------------------------------------- |
| **MFE**                  | Micro-Frontend - independently deployable frontend application       |
| **Host/Shell**           | Container application that orchestrates MFEs                         |
| **Remote**               | MFE application loaded by the host                                   |
| **Module Federation**    | Webpack/Vite feature for runtime module sharing                      |
| **Remote Entry**         | JavaScript file exposing federated modules                           |
| **Bootstrap Module**     | Exposed module with mount/unmount functions                          |
| **BrowserRouter**        | React Router component using History API                             |
| **Standalone Component** | Angular component without NgModule                                   |
| **BFF**                  | Backend for Frontend - a backend dedicated to serving frontend needs |
| **HttpOnly Cookie**      | Cookie inaccessible to JavaScript for XSS protection                 |

---

# Appendix B: Version History

| Version | Date       | Changes                                                                                                                                                                                      |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1.0   | Initial    | Vite-only federation architecture                                                                                                                                                            |
| 0.2.0   | March 2026 | Added BFF with auth flow, dynamic shell configuration                                                                                                                                        |
| 0.3.0   | July 2025  | Form Builder system: `defineFormSchema`, `useFormBuilder`, `<FormBuilder>`, `<FormField>`, `<Checkbox>`, `<TextArea>`, async/cross-field validation, submit pipeline, conditional visibility |

---

_Document generated: July 2025_
_Platform Version: 0.3.0_
