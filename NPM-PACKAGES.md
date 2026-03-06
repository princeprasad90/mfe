# Consolidated NPM Package List

This document lists all NPM packages declared across every `package.json` in the repository.

---

## Root (`package.json`)

**Project:** `mfe-workspace`

| Type | Package | Version |
|------|---------|---------|
| devDependency | concurrently | ^8.2.2 |

---

## apps/shell (`apps/shell/package.json`)

**Project:** `@mfe/shell`

| Type | Package | Version |
|------|---------|---------|
| dependency | react | 18.2.0 |
| dependency | react-dom | 18.2.0 |
| dependency | react-router-dom | ^6.30.3 |
| dependency | zustand | ^5.0.11 |
| devDependency | @originjs/vite-plugin-federation | 1.3.5 |
| devDependency | @types/react | ^19.2.14 |
| devDependency | @vitejs/plugin-react | 4.3.1 |
| devDependency | vite | 5.3.2 |

---

## apps/cbms (`apps/cbms/package.json`)

**Project:** `@mfe/cbms`

| Type | Package | Version |
|------|---------|---------|
| dependency | @mfe/notification-sdk | 0.1.0 |
| dependency | react | 18.2.0 |
| dependency | react-dom | 18.2.0 |
| devDependency | @originjs/vite-plugin-federation | 1.3.5 |
| devDependency | @vitejs/plugin-react | 4.3.1 |
| devDependency | vite | 5.3.2 |

---

## apps/cdts (`apps/cdts/package.json`)

**Project:** `@mfe/cdts`

| Type | Package | Version |
|------|---------|---------|
| dependency | @mfe/notification-sdk | 0.1.0 |
| dependency | react | 18.2.0 |
| dependency | react-dom | 18.2.0 |
| devDependency | @originjs/vite-plugin-federation | 1.3.5 |
| devDependency | @vitejs/plugin-react | 4.3.1 |
| devDependency | vite | 5.3.2 |

---

## apps/mfe-products-angular (`apps/mfe-products-angular/package.json`)

**Project:** `@mfe/products-angular`

| Type | Package | Version |
|------|---------|---------|
| dependency | @angular/common | ^17.3.0 |
| dependency | @angular/compiler | ^17.3.0 |
| dependency | @angular/core | ^17.3.0 |
| dependency | @angular/platform-browser | ^17.3.0 |
| dependency | rxjs | ~7.8.0 |
| dependency | tslib | ^2.3.0 |
| dependency | zone.js | ~0.14.3 |
| devDependency | @originjs/vite-plugin-federation | 1.3.5 |
| devDependency | vite | 5.3.2 |

---

## packages/build-tools (`packages/build-tools/package.json`)

**Project:** `@mfe/build-tools`

| Type | Package | Version |
|------|---------|---------|
| dependency | postcss | ^8.4.38 |

---

## packages/notification-sdk (`packages/notification-sdk/package.json`)

**Project:** `@mfe/notification-sdk`

| Type | Package | Version |
|------|---------|---------|
| — | *(no external dependencies declared)* | — |

---

## Summary — All Unique NPM Packages

| Package | Used In |
|---------|---------|
| @angular/common | apps/mfe-products-angular |
| @angular/compiler | apps/mfe-products-angular |
| @angular/core | apps/mfe-products-angular |
| @angular/platform-browser | apps/mfe-products-angular |
| @mfe/notification-sdk | apps/cbms, apps/cdts |
| @originjs/vite-plugin-federation | apps/shell, apps/cbms, apps/cdts, apps/mfe-products-angular |
| @types/react | apps/shell |
| @vitejs/plugin-react | apps/shell, apps/cbms, apps/cdts |
| concurrently | root |
| postcss | packages/build-tools |
| react | apps/shell, apps/cbms, apps/cdts |
| react-dom | apps/shell, apps/cbms, apps/cdts |
| react-router-dom | apps/shell |
| rxjs | apps/mfe-products-angular |
| tslib | apps/mfe-products-angular |
| vite | apps/shell, apps/cbms, apps/cdts, apps/mfe-products-angular |
| zone.js | apps/mfe-products-angular |
| zustand | apps/shell |
