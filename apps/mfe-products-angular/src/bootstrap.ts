import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

let moduleRef: any;
let mountContainer: HTMLElement | null = null;

export async function mount(container: HTMLElement) {
  mountContainer = container;
  container.innerHTML = '<app-root></app-root>';
  moduleRef = await platformBrowserDynamic().bootstrapModule(AppModule);
}

export async function unmount() {
  if (moduleRef) {
    moduleRef.destroy();
    moduleRef = null;
  }

  if (mountContainer) {
    mountContainer.innerHTML = '';
    mountContainer = null;
  }
}
