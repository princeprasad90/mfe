import "zone.js";
import "@angular/compiler";
import { ApplicationRef } from "@angular/core";
import { createApplication } from "@angular/platform-browser";
import ProductsShellComponent from "./app/products-shell.component";
import { RUNTIME_PROPS } from "./app/runtime-props";

let appRef: ApplicationRef | null = null;
let mountNode: HTMLElement | null = null;

export async function mount(
  container: HTMLElement,
  props: Record<string, unknown> = {},
) {
  await unmount();

  mountNode = document.createElement("products-angular-root");
  container.innerHTML = "";
  container.appendChild(mountNode);

  try {
    appRef = await createApplication({
      providers: [{ provide: RUNTIME_PROPS, useValue: props }],
    });

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
