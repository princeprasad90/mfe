import { Component, inject } from "@angular/core";
import { products, type Product } from "../../data/products";
import { RUNTIME_PROPS, type RuntimeProps } from "../../runtime-props";
import { productsPath } from "../../routes";

@Component({
  selector: "products-list-page",
  standalone: true,
  imports: [],
  template: `
    <section class="mfe">
      <h2>Products</h2>
      <ul class="mfe__list">
        <li class="mfe__list-item">
          <div>
            <strong>{{ products[0].name }}</strong>
            <p>{{ products[0].description }}</p>
          </div>
          <button class="mfe__ghost" (click)="openDetails(products[0].id)">
            Details
          </button>
        </li>
        <li class="mfe__list-item">
          <div>
            <strong>{{ products[1].name }}</strong>
            <p>{{ products[1].description }}</p>
          </div>
          <button class="mfe__ghost" (click)="openDetails(products[1].id)">
            Details
          </button>
        </li>
        <li class="mfe__list-item">
          <div>
            <strong>{{ products[2].name }}</strong>
            <p>{{ products[2].description }}</p>
          </div>
          <button class="mfe__ghost" (click)="openDetails(products[2].id)">
            Details
          </button>
        </li>
        <li class="mfe__list-item">
          <div>
            <strong>{{ products[3].name }}</strong>
            <p>{{ products[3].description }}</p>
          </div>
          <button class="mfe__ghost" (click)="openDetails(products[3].id)">
            Details
          </button>
        </li>
      </ul>
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

      .mfe__list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 8px;
      }

      .mfe__list-item {
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }

      .mfe__list-item p {
        margin: 4px 0 0;
      }

      .mfe__ghost {
        border: 1px solid #d1d5db;
        background: #f9fafb;
        border-radius: 6px;
        padding: 6px 10px;
        cursor: pointer;
      }
    `,
  ],
})
export default class ProductsListComponent {
  private runtimeProps: RuntimeProps =
    inject(RUNTIME_PROPS, { optional: true }) ?? {};
  products: Product[] = products;
  basePath = this.runtimeProps.basePath ?? "/products";

  goTo(path: string) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  openDetails(id: number) {
    this.goTo(this.basePath + productsPath.detail(id));
  }
}
