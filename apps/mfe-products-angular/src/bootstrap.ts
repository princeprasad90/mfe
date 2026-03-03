import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./app/app.module";

let moduleRef: any;

export async function mount(container: HTMLElement) {
  const appRoot = document.createElement("app-root");
  container.appendChild(appRoot);

  moduleRef = await platformBrowserDynamic().bootstrapModule(AppModule);
}

export async function unmount() {
  if (moduleRef) {
    moduleRef.destroy();
    moduleRef = null;
  }
}
