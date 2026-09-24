import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { FomoApiService } from '../core/api/fomo-api.service';
import type { PublicProductDetail, PublicProductSummary } from '../core/api/public.types';

export function toProductSummary(product: PublicProductDetail): PublicProductSummary {
  const cover = product.images.find((image) => image.primary) ?? product.images[0] ?? null;
  return {
    slug: product.slug,
    category: product.category,
    num: product.num,
    name: product.name,
    price: product.price,
    tag: product.tag,
    soldOut: product.soldOut,
    limited: product.limited,
    image: cover,
  };
}

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly api = inject(FomoApiService);
  private readonly items = signal<PublicProductSummary[]>([]);
  private loadedAll = false;
  private inFlight: Observable<PublicProductSummary[]> | null = null;
  readonly list = this.items.asReadonly();
  readonly bySlug = computed(() => {
    const map = new Map<string, PublicProductSummary>();
    for (const item of this.items()) map.set(item.slug, item);
    return map;
  });

  get(slug: string): PublicProductSummary | undefined {
    return this.bySlug().get(slug);
  }

  merge(incoming: PublicProductSummary[]) {
    if (!incoming.length) return;
    const map = new Map(this.items().map((item) => [item.slug, item]));
    for (const item of incoming) map.set(item.slug, item);
    this.items.set([...map.values()]);
  }

  replaceAll(incoming: PublicProductSummary[]) {
    this.items.set(incoming);
    this.loadedAll = true;
    this.inFlight = null;
  }

  /** Reusa `home.catalog` para no repetir GET /catalog al entrar al shop. */
  hydrateFromHome(catalog: { anillo: PublicProductSummary[]; collar: PublicProductSummary[] }) {
    this.replaceAll([...catalog.anillo, ...catalog.collar]);
  }

  ensureAll(): Observable<PublicProductSummary[]> {
    if (this.loadedAll) return of(this.items());
    if (!this.inFlight) {
      this.inFlight = this.api.getCatalog().pipe(
        map((res) => res.items),
        tap({
          next: (items) => this.replaceAll(items),
          error: () => {
            this.inFlight = null;
          },
        }),
        shareReplay(1),
      );
    }
    return this.inFlight;
  }
}
