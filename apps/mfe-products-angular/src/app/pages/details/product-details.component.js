import { Component, inject, ChangeDetectorRef } from "@angular/core";
import { products } from "../../data/products.js";
import { RUNTIME_PROPS } from "../../runtime-props.js";
import { productsMatcher, productsPath } from "../../routes.js";

class ProductDetailsComponent {
  runtimeProps = inject(RUNTIME_PROPS, { optional: true }) ?? {};
  cdr = inject(ChangeDetectorRef);
  products = products;
  basePath = this.runtimeProps.basePath ?? "/products";
  currentPath = window.location.pathname;

  _popstateHandler = () => {
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
    const relative = this.currentPath.replace(this.basePath, "") || "/";
    return productsMatcher(relative);
  }

  get selectedProduct() {
    const id = this.route.params.id;
    return this.products.find((item) => item.id === id) ?? null;
  }

  goTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  goBack() {
    this.goTo(this.basePath + productsPath.list());
  }
}

Component({
  selector: "product-details-page",
  standalone: true,
  imports: [],
  template: `
    <section class="mfe">
      <h2>Product Details</h2>
      <p [style.display]="selectedProduct ? 'block' : 'none'"><strong>ID:</strong> {{ selectedProduct?.id }}</p>
      <p [style.display]="selectedProduct ? 'block' : 'none'"><strong>Name:</strong> {{ selectedProduct?.name }}</p>
      <p [style.display]="selectedProduct ? 'block' : 'none'">{{ selectedProduct?.description }}</p>
      <p [style.display]="selectedProduct ? 'none' : 'block'">Product not found.</p>
      <button class="mfe__button" (click)="goBack()">Back to list</button>
    </section>
  `,
  styles: [
    `
      .mfe {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
      }

      .mfe__button {
        border: 1px solid #d1d5db;
        background: #f9fafb;
        border-radius: 6px;
        padding: 6px 10px;
        cursor: pointer;
      }
    `
  ]
})(ProductDetailsComponent);

export default ProductDetailsComponent;
