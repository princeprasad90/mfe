import { Component, inject } from "@angular/core";
import { RUNTIME_PROPS } from "./runtime-props.js";
import ProductsListComponent from "./pages/list/products-list.component.js";
import ProductDetailsComponent from "./pages/details/product-details.component.js";

class ProductsShellComponent {
  runtimeProps = inject(RUNTIME_PROPS, { optional: true }) ?? {};
  routePath = this.runtimeProps.routePath ?? `${window.location.pathname}${window.location.search}`;

  get isDetailsRoute() {
    return /\/details\/\d+/.test(this.routePath);
  }
}

Component({
  selector: "products-shell-page",
  standalone: true,
  imports: [ProductsListComponent, ProductDetailsComponent],
  template: `
    <div [style.display]="isDetailsRoute ? 'none' : 'block'">
      <products-list-page></products-list-page>
    </div>
    <div [style.display]="isDetailsRoute ? 'block' : 'none'">
      <product-details-page></product-details-page>
    </div>
  `
})(ProductsShellComponent);

export default ProductsShellComponent;
