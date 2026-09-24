import { Component, inject } from '@angular/core';
import { CartService } from '../cart.service';

@Component({
  selector: 'fomo-cart-drawer',
  templateUrl: './cart-drawer.html',
})
export class FomoCartDrawer {
  readonly cart = inject(CartService);
}
