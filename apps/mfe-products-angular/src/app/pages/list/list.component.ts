import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { products } from '../../data/products';

@Component({
  selector: 'app-product-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {
  products = products;

  constructor(private readonly router: Router) {}

  openDetails(id: number): void {
    void this.router.navigate(['/details', id]);
  }
}
