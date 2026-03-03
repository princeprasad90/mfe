export type MfeDefinition = {
  name: string;
  route: string;
  remoteEntry: string;
  scope: string;
  exposedModule: string;
};

const defaultRemoteEntries = {
  cbms: "http://localhost:3001/assets/remoteEntry.js",
  cdts: "http://localhost:3002/assets/remoteEntry.js",
  products: "http://localhost:3003/assets/remoteEntry.js"
};

export const mfeConfig: MfeDefinition[] = [
  {
    name: "cbms",
    route: "/cbms",
    remoteEntry: import.meta.env.VITE_CBMS_REMOTE_ENTRY ?? defaultRemoteEntries.cbms,
    scope: "cbmsApp",
    exposedModule: "./bootstrap"
  },
  {
    name: "tasks",
    route: "/tasks",
    remoteEntry: import.meta.env.VITE_CDTS_REMOTE_ENTRY ?? defaultRemoteEntries.cdts,
    scope: "cdtsApp",
    exposedModule: "./bootstrap"
  },
  {
    name: "products",
    route: "/products",
    remoteEntry: import.meta.env.VITE_PRODUCTS_REMOTE_ENTRY ?? defaultRemoteEntries.products,
    scope: "productsAngular",
    exposedModule: "./bootstrap"
  }
];
