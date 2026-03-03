import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, products } from '../../data/products';

@Component({
  selector: 'app-product-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent {
  product: Product | null = null;

  constructor(private readonly route: ActivatedRoute, private readonly router: Router) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.product = products.find((item) => item.id === id) ?? null;
  }

  backToList(): void {
    void this.router.navigate(['/']);
  }
}
