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
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FomoCartDrawer } from '../cart-drawer/cart-drawer';
import { CartService } from '../cart.service';
import { FomoNavbar } from '../navbar/navbar';
import { FlaapsFooter } from '../../flaaps-footer/flaaps-footer';
import {
  CATEGORY_LABEL,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_STEP,
  PRODUCTS,
  money,
  type ProductCategory,
} from '../products';
import { SOLD_MASK, bindShopFx } from '../shop-fx';

type SortKey = 'novedad' | 'precio-asc' | 'precio-desc';
type Avail = 'all' | 'stock' | 'soldout';

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
  readonly soldMask = SOLD_MASK;
  readonly priceMin = PRICE_MIN;
  readonly priceMax = PRICE_MAX;
  readonly priceStep = PRICE_STEP;
  readonly desktop = signal(typeof window === 'undefined' || window.innerWidth > 900);
  readonly drawerOpen = signal(false);
  readonly sort = signal<SortKey>('novedad');
  readonly cats = signal<Record<ProductCategory, boolean>>({ anillo: true, collar: true });
  readonly avail = signal<Avail>('all');
  readonly maxPrice = signal(PRICE_MAX);

  readonly items = computed(() => {
    const filters = {
      cats: this.cats(),
      avail: this.avail(),
      maxPrice: this.maxPrice(),
    };
    const sort = this.sort();
    let list = PRODUCTS.filter(
      (p) =>
        filters.cats[p.category] &&
        p.price <= filters.maxPrice &&
        (filters.avail === 'all' ||
          (filters.avail === 'stock' && !p.soldOut) ||
          (filters.avail === 'soldout' && p.soldOut)),
    );
    if (sort === 'precio-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'precio-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list.map((p) => ({
      ...p,
      priceLabel: money(p.price),
      categoryLabel: CATEGORY_LABEL[p.category],
    }));
  });

  readonly activeFilterCount = computed(() => {
    const cats = this.cats();
    return (
      (!cats.anillo || !cats.collar ? 1 : 0) +
      (this.avail() !== 'all' ? 1 : 0) +
      (this.maxPrice() < PRICE_MAX ? 1 : 0)
    );
  });

  readonly maxPriceLabel = computed(() => money(this.maxPrice()));

  private fx?: ReturnType<typeof bindShopFx>;

  constructor() {
    const zone = inject(NgZone);
    const destroy = inject(DestroyRef);

    this.route.queryParamMap.subscribe((params) => {
      const cat = params.get('cat');
      if (cat === 'anillo') this.cats.set({ anillo: true, collar: false });
      else if (cat === 'collar') this.cats.set({ anillo: false, collar: true });
      else this.cats.set({ anillo: true, collar: true });
    });

    effect(() => {
      this.items();
      this.sort();
      queueMicrotask(() => this.fx?.rebuildSparks());
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

  addToCart(id: string) {
    this.cart.add(id, 1);
    queueMicrotask(() => this.fx?.applyShine());
  }

  toggleCat(cat: ProductCategory) {
    this.cats.update((c) => ({ ...c, [cat]: !c[cat] }));
  }

  setAvail(v: Avail) {
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
    this.maxPrice.set(PRICE_MAX);
  }
}
