import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SettingsStore } from '../../core/api/settings.store';
import { marqueeLoop, waHref } from '../../core/site-links';
import { CartService } from '../cart.service';

@Component({
  selector: 'fomo-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
})
export class FomoNavbar {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly settings = inject(SettingsStore);
  readonly shop = input(false);
  readonly active = input<'catalogo' | ''>('');
  readonly desktop = input(true);
  readonly cartCount = this.cartService.count;
  readonly topbar = computed(() => marqueeLoop(this.settings.value()?.bandTopbar ?? ''));
  readonly waGeneral = computed(() => {
    const s = this.settings.value();
    if (!s) return '';
    return waHref(s.whatsapp, s.waGeneralText);
  });

  constructor() {
    effect(() => {
      if (!this.shop()) return;
      untracked(() => {
        this.settings.ensure().subscribe();
      });
    });
  }

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
