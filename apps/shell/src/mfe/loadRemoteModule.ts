import type { MfeScope } from "../mfe-config";

type BootstrapModule = {
  mount: (container: HTMLElement, props?: Record<string, unknown>) => void | Promise<void>;
  unmount?: () => void | Promise<void>;
};

export async function loadRemoteModule(scope: MfeScope): Promise<BootstrapModule> {
  if (scope === "cbmsApp") {
    return import("cbmsApp/bootstrap");
  }

  if (scope === "cdtsApp") {
    return import("cdtsApp/bootstrap");
  }

  return import("productsAngular/bootstrap");
}
