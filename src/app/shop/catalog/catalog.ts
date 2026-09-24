import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  ViewChild,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { FomoApiError } from '../../core/api/fomo-api.error';
import { resolveAssetUrl } from '../../core/api/resolve-asset-url';
import { SettingsStore } from '../../core/api/settings.store';
import type { PublicProductSummary } from '../../core/api/public.types';
import { formatCopyright } from '../../core/site-links';
import { FlaapsFooter } from '../../flaaps-footer/flaaps-footer';
import { FomoCartDrawer } from '../cart-drawer/cart-drawer';
import { CartService } from '../cart.service';
import { filterCatalog, type ShopAvail } from '../catalog-query';
import { CatalogStore } from '../catalog.store';
import { FomoNavbar } from '../navbar/navbar';
import { CATEGORY_LABEL, money, type ProductCategory } from '../products';
import { SOLD_MASK, bindShopFx } from '../shop-fx';

type SortKey = 'novedad' | 'precio-asc' | 'precio-desc';

@Component({
  selector: 'app-catalog',
  imports: [FomoNavbar, FomoCartDrawer, RouterLink, FlaapsFooter],
  templateUrl: './catalog.html',
  styleUrl: '../shop.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CatalogPage {
  @ViewChild('rootEl') rootEl?: ElementRef<HTMLElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly cart = inject(CartService);
  private readonly catalog = inject(CatalogStore);
  private readonly settingsStore = inject(SettingsStore);
  private readonly reload$ = new Subject<void>();
  readonly soldMask = SOLD_MASK;
  readonly desktop = signal(typeof window === 'undefined' || window.innerWidth > 900);
  readonly drawerOpen = signal(false);
  readonly sort = signal<SortKey>('novedad');
  readonly cats = signal<Record<ProductCategory, boolean>>({ anillo: true, collar: true });
  readonly avail = signal<ShopAvail>('all');
  readonly maxPrice = signal(Number.POSITIVE_INFINITY);
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  readonly failed = signal<string | null>(null);
  private readonly fetched = signal<PublicProductSummary[]>([]);

  readonly priceMin = computed(() => {
    const prices = this.catalog.list().map((p) => p.price);
    return prices.length ? Math.min(...prices) : 0;
  });
  readonly priceMax = computed(() => {
    const prices = this.catalog.list().map((p) => p.price);
    return prices.length ? Math.max(...prices) : 0;
  });
  readonly priceStep = computed(() => {
    const span = this.priceMax() - this.priceMin();
    return span <= 10_000 ? 1 : 1000;
  });

  readonly items = computed(() => {
    const maxPrice = this.maxPrice();
    const sort = this.sort();
    let list = this.fetched().filter((p) => p.price <= maxPrice);
    if (sort === 'precio-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'precio-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list.map((p) => ({
      slug: p.slug,
      num: p.num,
      name: p.name,
      tag: p.tag,
      soldOut: p.soldOut,
      limited: p.limited,
      category: p.category,
      imageUrl: p.image ? resolveAssetUrl(p.image.url) : '',
      imageAlt: p.image?.alt || p.name,
      priceLabel: money(p.price),
      categoryLabel: CATEGORY_LABEL[p.category],
      snapshot: p,
    }));
  });

  readonly emptyKind = computed(() => {
    if (this.status() !== 'ready') return null;
    if (this.items().length) return null;
    if (!this.catalog.list().length) return 'catalog' as const;
    return 'filters' as const;
  });

  readonly activeFilterCount = computed(() => {
    const cats = this.cats();
    const max = this.priceMax();
    return (
      (!cats.anillo || !cats.collar ? 1 : 0) +
      (this.avail() !== 'all' ? 1 : 0) +
      (Number.isFinite(this.maxPrice()) && max > 0 && this.maxPrice() < max ? 1 : 0)
    );
  });

  readonly sliderValue = computed(() =>
    Number.isFinite(this.maxPrice()) ? this.maxPrice() : this.priceMax(),
  );
  readonly maxPriceLabel = computed(() => money(this.sliderValue()));
  readonly responseSla = computed(() => this.settingsStore.value()?.responseSla ?? '');
  readonly copyrightLine = computed(() =>
    formatCopyright(this.settingsStore.value()?.copyrightText ?? ''),
  );

  private fx?: ReturnType<typeof bindShopFx>;

  constructor() {
    const zone = inject(NgZone);
    const destroy = inject(DestroyRef);

    this.settingsStore.ensure().subscribe();

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const cat = params.get('cat');
      if (cat === 'anillo') this.cats.set({ anillo: true, collar: false });
      else if (cat === 'collar') this.cats.set({ anillo: false, collar: true });
      else this.cats.set({ anillo: true, collar: true });
    });

    this.reload$
      .pipe(
        switchMap(() => {
          this.status.set('loading');
          this.failed.set(null);
          return this.catalog.ensureAll().pipe(
            map((items) => filterCatalog(items, this.cats(), this.avail())),
            catchError((err: unknown) => {
              this.failed.set(
                err instanceof FomoApiError
                  ? err.message
                  : 'No pudimos cargar el catálogo. Probá de nuevo.',
              );
              this.status.set('error');
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((items) => {
        if (items === null) {
          this.fetched.set([]);
          return;
        }
        this.fetched.set(items);
        this.status.set('ready');
        const max = this.catalog.list().reduce((m, p) => Math.max(m, p.price), 0);
        if (max > 0 && this.maxPrice() === Number.POSITIVE_INFINITY) this.maxPrice.set(max);
      });

    effect(() => {
      this.cats();
      this.avail();
      untracked(() => this.reload$.next());
    });

    effect(() => {
      const max = this.priceMax();
      if (max > 0 && this.maxPrice() > max) this.maxPrice.set(max);
    });

    effect(() => {
      this.items();
      this.sort();
      queueMicrotask(() => this.fx?.rebuildSparks());
    });

    effect(() => {
      this.settingsStore.value();
      queueMicrotask(() => this.fx?.restartMarquees());
    });

    afterNextRender(() => {
      zone.runOutsideAngular(() => {
        const root = this.rootEl?.nativeElement;
        if (root) this.fx = bindShopFx(root);
        const onResize = () => {
          const d = window.innerWidth > 900;
          zone.run(() => this.desktop.set(d));
        };
        onResize();
        window.addEventListener('resize', onResize);
        destroy.onDestroy(() => {
          window.removeEventListener('resize', onResize);
          this.fx?.stop();
        });
      });
    });
  }

  addToCart(item: { slug: string; snapshot: PublicProductSummary }) {
    this.cart.add(item.slug, 1, item.snapshot);
    queueMicrotask(() => this.fx?.applyShine());
  }

  toggleCat(cat: ProductCategory) {
    this.cats.update((c) => ({ ...c, [cat]: !c[cat] }));
  }

  setAvail(v: ShopAvail) {
    this.avail.set(v);
  }

  onSort(ev: Event) {
    this.sort.set((ev.target as HTMLSelectElement).value as SortKey);
  }

  onMaxPrice(ev: Event) {
    this.maxPrice.set(+(ev.target as HTMLInputElement).value);
  }

  clearFilters() {
    this.cats.set({ anillo: true, collar: true });
    this.avail.set('all');
    this.maxPrice.set(this.priceMax() || Number.POSITIVE_INFINITY);
  }
}
