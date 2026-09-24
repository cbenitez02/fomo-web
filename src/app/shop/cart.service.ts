import { Injectable, computed, signal } from '@angular/core';
import { CONFIG } from '../landing/catalog';
import { PRODUCTS, money } from './products';

export interface CartRow {
  id: string;
  qty: number;
}

const KEY = 'fomo_cart_v1';

function load(): CartRow[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((r) => r?.id && r.qty > 0) : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly items = signal<CartRow[]>(typeof localStorage === 'undefined' ? [] : load());
  readonly open = signal(false);

  readonly cart = this.items.asReadonly();
  readonly count = computed(() => this.items().reduce((s, r) => s + r.qty, 0));
  readonly lines = computed(() =>
    this.items()
      .map((r) => {
        const product = PRODUCTS.find((p) => p.id === r.id);
        if (!product) return null;
        return {
          id: product.id,
          name: product.name,
          qty: r.qty,
          lineTotal: money(product.price * r.qty),
        };
      })
      .filter((row): row is NonNullable<typeof row> => !!row),
  );
  readonly total = computed(() =>
    this.items().reduce((s, r) => {
      const p = PRODUCTS.find((x) => x.id === r.id);
      return s + (p ? p.price * r.qty : 0);
    }, 0),
  );
  readonly totalLabel = computed(() => money(this.total()));
  readonly checkoutHref = computed(() => {
    const cart = this.items();
    const lines = cart
      .map((r) => {
        const p = PRODUCTS.find((x) => x.id === r.id);
        return p ? `${r.qty}x ${p.name} (${money(p.price)})` : '';
      })
      .filter(Boolean);
    const text = `Hola! Quiero pedir:\n${lines.join('\n')}\n\nTotal: ${money(this.total())}`;
    return `https://wa.me/${CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  });

  add(id: string, qty = 1) {
    const cart = [...this.items()];
    const row = cart.find((r) => r.id === id);
    if (row) row.qty += qty;
    else cart.push({ id, qty });
    this.persist(cart);
    this.open.set(true);
  }

  setQty(id: string, qty: number) {
    let cart = [...this.items()];
    if (qty <= 0) cart = cart.filter((r) => r.id !== id);
    else {
      const row = cart.find((r) => r.id === id);
      if (row) row.qty = qty;
    }
    this.persist(cart);
  }

  changeQty(id: string, delta: number) {
    const row = this.items().find((r) => r.id === id);
    this.setQty(id, (row ? row.qty : 0) + delta);
  }

  remove(id: string) {
    this.persist(this.items().filter((r) => r.id !== id));
  }

  empty() {
    this.persist([]);
  }

  openCart() {
    this.open.set(true);
  }

  closeCart() {
    this.open.set(false);
  }

  private persist(cart: CartRow[]) {
    this.items.set(cart);
    localStorage.setItem(KEY, JSON.stringify(cart));
  }
}
