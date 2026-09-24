import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CONFIG } from '../../landing/catalog';
import { CartService } from '../cart.service';

@Component({
  selector: 'fomo-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
})
export class FomoNavbar {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  readonly shop = input(false);
  readonly active = input<'catalogo' | ''>('');
  readonly desktop = input(true);
  readonly cartCount = this.cartService.count;
  readonly waGeneral = `https://wa.me/${CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola FOMO! Quiero hacer un pedido.')}`;

  openCart() {
    this.cartService.openCart();
  }

  goHome(event: Event) {
    event.preventDefault();
    void this.router.navigateByUrl('/').then(() => {
      requestAnimationFrame(() => window.scrollTo(0, 0));
    });
  }
}

