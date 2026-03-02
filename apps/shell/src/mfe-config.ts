export type MfeDefinition = {
  name: string;
  route: string;
  remoteEntry: string;
  scope: string;
  exposedModule: string;
};

export const mfeConfig: MfeDefinition[] = [
  {
    name: "cbms",
    route: "/cbms",
    remoteEntry: "https://mfe-cbms.vercel.app/assets/remoteEntry.js",
    scope: "cbmsApp",
    exposedModule: "./CbmsApp"
  },
  {
    name: "tasks",
    route: "/tasks",
    remoteEntry: "https://mfe-cdts.vercel.app/assets/remoteEntry.js",
    scope: "cdtsApp",
    exposedModule: "./CdtsApp"
  }
];
