import { Component, inject } from "@angular/core";
import { products } from "../../data/products.js";
import { RUNTIME_PROPS } from "../../runtime-props.js";

class ProductDetailsComponent {
  runtimeProps = inject(RUNTIME_PROPS, { optional: true }) ?? {};
  products = products;
  basePath = this.runtimeProps.basePath ?? "/products";
  routePath = this.runtimeProps.routePath ?? `${window.location.pathname}${window.location.search}`;

  get selectedProduct() {
    const detailMatch = this.routePath.match(/\/details\/(\d+)/);
    const detailId = detailMatch ? Number(detailMatch[1]) : null;
    return this.products.find((item) => item.id === detailId) ?? null;
  }

  goTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
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
      <button class="mfe__button" (click)="goTo(basePath)">Back to list</button>
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
