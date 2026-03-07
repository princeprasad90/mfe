import { Component, inject, ChangeDetectorRef } from "@angular/core";
import { RUNTIME_PROPS, type RuntimeProps } from "./runtime-props";
import { productsMatcher } from "./routes";
import ProductsListComponent from "./pages/list/products-list.component";
import ProductDetailsComponent from "./pages/details/product-details.component";

@Component({
  selector: "products-shell-page",
  standalone: true,
  imports: [ProductsListComponent, ProductDetailsComponent],
  template: `
    @if (isDetailsRoute) {
      <product-details-page></product-details-page>
    } @else {
      <products-list-page></products-list-page>
    }
  `,
})
export default class ProductsShellComponent {
  private runtimeProps: RuntimeProps =
    inject(RUNTIME_PROPS, { optional: true }) ?? {};
  private cdr = inject(ChangeDetectorRef);
  currentPath = window.location.pathname;

  private _popstateHandler = () => {
    this.currentPath = window.location.pathname;
    this.cdr.detectChanges();
  };

  ngOnInit() {
    window.addEventListener("popstate", this._popstateHandler);
  }

  ngOnDestroy() {
    window.removeEventListener("popstate", this._popstateHandler);
  }

  get route() {
    const basePath = this.runtimeProps.basePath ?? "/products";
    const relative = this.currentPath.replace(basePath, "") || "/";
    return productsMatcher(relative);
  }

  get isDetailsRoute() {
    return this.route.name === "detail";
  }
}
