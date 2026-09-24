import { Injectable, computed, inject, signal } from '@angular/core';
import type { PublicProductSummary } from '../core/api/public.types';
import { resolveAssetUrl } from '../core/api/resolve-asset-url';
import { SettingsStore } from '../core/api/settings.store';
import { waHref } from '../core/site-links';
import { CatalogStore } from './catalog.store';
import { money } from './products';

export interface CartRow {
  id: string;
  qty: number;
  snapshot?: PublicProductSummary;
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
  private readonly catalog = inject(CatalogStore);
  private readonly settings = inject(SettingsStore);
  private readonly items = signal<CartRow[]>(typeof localStorage === 'undefined' ? [] : load());
  readonly open = signal(false);

  readonly cart = this.items.asReadonly();
  readonly lines = computed(() =>
    this.items()
      .map((r) => {
        const product = this.catalog.get(r.id) ?? r.snapshot;
        if (!product) return null;
        return {
          id: product.slug,
          name: product.name,
          qty: r.qty,
          soldOut: product.soldOut,
          imageUrl: product.image ? resolveAssetUrl(product.image.url) : '',
          lineTotal: money(product.price * r.qty),
        };
      })
      .filter((row): row is NonNullable<typeof row> => !!row),
  );
  readonly count = computed(() => this.lines().reduce((s, r) => s + r.qty, 0));
  readonly total = computed(() =>
    this.lines().reduce((s, line) => {
      const p = this.catalog.get(line.id) ?? this.items().find((r) => r.id === line.id)?.snapshot;
      return s + (p && !p.soldOut ? p.price * line.qty : 0);
    }, 0),
  );
  readonly totalLabel = computed(() => money(this.total()));
  readonly checkoutHref = computed(() => {
    const whatsapp = this.settings.value()?.whatsapp;
    if (!whatsapp) return '';
    const lines = this.items()
      .map((r) => {
        const p = this.catalog.get(r.id) ?? r.snapshot;
        if (!p || p.soldOut) return '';
        return `${r.qty}x ${p.name} (${money(p.price)})`;
      })
      .filter(Boolean);
    if (!lines.length) return '';
    const text = `Hola! Quiero pedir:\n${lines.join('\n')}\n\nTotal: ${money(this.total())}`;
    return waHref(whatsapp, text);
  });

  constructor() {
    const snapshots = this.items()
      .map((r) => r.snapshot)
      .filter((s): s is PublicProductSummary => !!s);
    if (snapshots.length) this.catalog.merge(snapshots);
    if (this.items().length) {
      this.catalog.ensureAll().subscribe({
        next: (list) => {
          const bySlug = new Map(list.map((p) => [p.slug, p]));
          const next = this.items()
            .filter((r) => bySlug.has(r.id))
            .map((r) => ({ ...r, snapshot: bySlug.get(r.id) }));
          this.persist(next);
        },
      });
    }
  }

  add(slug: string, qty = 1, snapshot?: PublicProductSummary) {
    if (snapshot?.soldOut) return;
    if (snapshot) this.catalog.merge([snapshot]);
    const cart = [...this.items()];
    const row = cart.find((r) => r.id === slug);
    if (row) {
      row.qty += qty;
      if (snapshot) row.snapshot = snapshot;
    } else cart.push({ id: slug, qty, snapshot });
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
