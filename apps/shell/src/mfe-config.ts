export type MfeDefinition = {
  name: string;
  route: string;
  remoteEntry: string;
  scope: string;
  exposedModule: string;
};

const PRODUCTS_ANGULAR_APP_URL = "https://mfe-products-angular.vercel.app";

export const mfeConfig: MfeDefinition[] = [
  {
    name: "cbms",
    route: "/cbms",
    remoteEntry: "https://mfe-cbms.vercel.app/assets/remoteEntry.js",
    scope: "cbmsApp",
    exposedModule: "./bootstrap"
  },
  {
    name: "tasks",
    route: "/tasks",
    remoteEntry: "https://mfe-cdts.vercel.app/assets/remoteEntry.js",
    scope: "cdtsApp",
    exposedModule: "./bootstrap"
  },
  {
    name: "products",
    route: "/products",
    remoteEntry: `${PRODUCTS_ANGULAR_APP_URL}/assets/remoteEntry.js`,
    scope: "productsAngular",
    exposedModule: "./bootstrap"
  }
];
