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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CONFIG } from '../../landing/catalog';
import { FomoCartDrawer } from '../cart-drawer/cart-drawer';
import { CartService } from '../cart.service';
import { FomoNavbar } from '../navbar/navbar';
import { FlaapsFooter } from '../../flaaps-footer/flaaps-footer';
import { CATEGORY_LABEL, getProduct, money, relatedProducts } from '../products';
import { SOLD_MASK, bindShopFx } from '../shop-fx';

@Component({
  selector: 'app-product',
  imports: [FomoNavbar, FomoCartDrawer, RouterLink, FlaapsFooter],
  templateUrl: './product.html',
  styleUrl: '../shop.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ProductPage {
  @ViewChild('rootEl') rootEl?: ElementRef<HTMLElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cart = inject(CartService);
  readonly soldMask = SOLD_MASK;
  readonly desktop = signal(typeof window === 'undefined' || window.innerWidth > 900);
  readonly qty = signal(1);
  readonly countdown = signal('00:00:00');
  readonly igHref = `https://instagram.com/${CONFIG.instagram.replace(/^@/, '')}`;
  readonly productId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly current = computed(() => {
    const p = getProduct(this.productId());
    if (!p) return null;
    return {
      ...p,
      priceLabel: money(p.price),
      categoryLabel: CATEGORY_LABEL[p.category],
      wa: `https://wa.me/${CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Me interesa el ${p.name} (${money(p.price)}).`)}`,
    };
  });
  readonly related = computed(() => {
    const p = this.current();
    if (!p) return [];
    return relatedProducts(p).map((r) => ({ ...r, priceLabel: money(r.price) }));
  });

  private fx?: ReturnType<typeof bindShopFx>;
  private cdIv?: ReturnType<typeof setInterval>;

  constructor() {
    const zone = inject(NgZone);
    const destroy = inject(DestroyRef);

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') ?? '';
      if (!getProduct(id)) {
        this.router.navigate(['/catalogo']);
        return;
      }
      this.productId.set(id);
      this.qty.set(1);
      queueMicrotask(() => {
        this.startCountdown();
        this.fx?.rebuildSparks();
        this.fx?.applyShine();
      });
    });

    effect(() => {
      this.cart.open();
      queueMicrotask(() => this.fx?.applyShine());
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
        this.startCountdown();
        destroy.onDestroy(() => {
          window.removeEventListener('resize', onResize);
          clearInterval(this.cdIv);
          this.fx?.stop();
        });
      });
    });
  }

  incQty() {
    this.qty.update((n) => n + 1);
  }

  decQty() {
    this.qty.update((n) => Math.max(1, n - 1));
  }

  addToCart() {
    const p = this.current();
    if (!p || p.soldOut) return;
    this.cart.add(p.id, this.qty());
    this.qty.set(1);
    queueMicrotask(() => this.fx?.applyShine());
  }

  private startCountdown() {
    clearInterval(this.cdIv);
    const p = this.current();
    if (!p?.limited) return;
    const target = Date.now() + 1000 * 60 * 60 * 24 * 3;
    const tick = () => {
      const d = Math.max(0, target - Date.now());
      const h = String(Math.floor(d / 3.6e6)).padStart(2, '0');
      const m = String(Math.floor(d / 6e4) % 60).padStart(2, '0');
      const s = String(Math.floor(d / 1e3) % 60).padStart(2, '0');
      this.countdown.set(`${h}:${m}:${s}`);
    };
    tick();
    this.cdIv = setInterval(tick, 1000);
  }
}
