import { InjectionToken } from "@angular/core";

export interface RuntimeProps {
  basePath?: string;
  routePath?: string;
  [key: string]: unknown;
}

export const RUNTIME_PROPS = new InjectionToken<RuntimeProps>("RUNTIME_PROPS");
