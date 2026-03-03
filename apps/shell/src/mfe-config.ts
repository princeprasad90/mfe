export type MfeScope = "cbmsApp" | "cdtsApp" | "productsAngular";

export type MfeDefinition = {
  name: string;
  route: string;
  scope: MfeScope;
};

export const mfeConfig: MfeDefinition[] = [
  {
    name: "cbms",
    route: "/cbms",
    scope: "cbmsApp"
  },
  {
    name: "tasks",
    route: "/tasks",
    scope: "cdtsApp"
  },
  {
    name: "products",
    route: "/products",
    scope: "productsAngular"
  }
];
