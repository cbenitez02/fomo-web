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
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { FomoApiError } from '../../core/api/fomo-api.error';
import { FomoApiService } from '../../core/api/fomo-api.service';
import type { PublicProductDetail, PublicProductSummary } from '../../core/api/public.types';
import { resolveAssetUrl } from '../../core/api/resolve-asset-url';
import { SettingsStore } from '../../core/api/settings.store';
import { igProfileHref, formatCopyright, waHref } from '../../core/site-links';
import { FlaapsFooter } from '../../flaaps-footer/flaaps-footer';
import { FomoCartDrawer } from '../cart-drawer/cart-drawer';
import { CartService } from '../cart.service';
import { CatalogStore, toProductSummary } from '../catalog.store';
import { formatCountdown, shouldShowDropCountdown } from '../drop-countdown';
import { FomoNavbar } from '../navbar/navbar';
import { CATEGORY_LABEL, money } from '../products';
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
  private readonly api = inject(FomoApiService);
  private readonly cart = inject(CartService);
  private readonly catalog = inject(CatalogStore);
  private readonly settingsStore = inject(SettingsStore);
  private readonly title = inject(Title);
  readonly soldMask = SOLD_MASK;
  readonly desktop = signal(typeof window === 'undefined' || window.innerWidth > 900);
  readonly qty = signal(1);
  readonly countdown = signal('00:00:00');
  readonly status = signal<'loading' | 'ready' | 'not_found' | 'error'>('loading');
  readonly failed = signal<string | null>(null);
  readonly product = signal<PublicProductDetail | null>(null);
  readonly relatedItems = signal<PublicProductSummary[]>([]);
  readonly selected = signal(0);

  readonly settings = this.settingsStore.value;
  readonly igHref = computed(() => igProfileHref(this.settings()?.instagram ?? ''));
  readonly soldOutMessage = computed(() => this.settings()?.soldOutMessage?.trim() ?? '');
  readonly responseSla = computed(() => this.settings()?.responseSla ?? '');
  readonly copyrightLine = computed(() => formatCopyright(this.settings()?.copyrightText ?? ''));
  readonly current = computed(() => {
    const p = this.product();
    const settings = this.settings();
    if (!p) return null;
    return {
      slug: p.slug,
      num: p.num,
      name: p.name,
      tag: p.tag,
      soldOut: p.soldOut,
      limited: p.limited,
      description: p.description,
      drop: p.drop,
      priceLabel: money(p.price),
      categoryLabel: CATEGORY_LABEL[p.category],
      wa: settings
        ? waHref(
            settings.whatsapp,
            p.soldOut
              ? [settings.soldOutMessage?.trim(), p.name].filter(Boolean).join(' — ')
              : `Hola! Me interesa el ${p.name} (${money(p.price)}).`,
          )
        : '',
      snapshot: toProductSummary(p),
    };
  });
  readonly images = computed(() => {
    const list = this.product()?.images ?? [];
    return list.map((image) => ({
      ...image,
      src: resolveAssetUrl(image.url),
      alt: image.alt || this.product()?.name || '',
    }));
  });
  readonly mainImage = computed(() => {
    const list = this.images();
    if (!list.length) return null;
    return list[Math.min(this.selected(), list.length - 1)] ?? list[0];
  });
  readonly showCountdown = computed(() => shouldShowDropCountdown(this.product()?.drop));
  readonly dropLabel = computed(() => {
    const code = this.product()?.drop?.code?.trim();
    return code ? `${code} CIERRA EN` : 'EL DROP CIERRA EN';
  });
  readonly related = computed(() =>
    this.relatedItems().map((item) => ({
      slug: item.slug,
      name: item.name,
      priceLabel: money(item.price),
      imageUrl: item.image ? resolveAssetUrl(item.image.url) : '',
      imageAlt: item.image?.alt || item.name,
    })),
  );

  private fx?: ReturnType<typeof bindShopFx>;
  private cdIv?: ReturnType<typeof setInterval>;

  constructor() {
    const zone = inject(NgZone);
    const destroy = inject(DestroyRef);

    this.route.paramMap
      .pipe(
        map((params) => params.get('slug')?.trim() ?? ''),
        distinctUntilChanged(),
        switchMap((slug) => {
          this.qty.set(1);
          this.selected.set(0);
          this.product.set(null);
          this.relatedItems.set([]);
          this.failed.set(null);
          if (!slug) {
            this.status.set('not_found');
            return of(null);
          }
          this.status.set('loading');
          return forkJoin({
            payload: this.api.getProduct(slug),
            settings: this.settingsStore.ensure().pipe(catchError(() => of(null))),
          }).pipe(
            catchError((err: unknown) => {
              if (err instanceof FomoApiError && (err.kind === 'not_found' || err.kind === 'invalid')) {
                this.status.set('not_found');
              } else {
                this.status.set('error');
                this.failed.set(
                  err instanceof FomoApiError
                    ? err.message
                    : 'No pudimos cargar el producto. Probá de nuevo.',
                );
              }
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        if (!result) return;
        this.product.set(result.payload.product);
        this.relatedItems.set(result.payload.related);
        this.catalog.merge([
          toProductSummary(result.payload.product),
          ...result.payload.related,
        ]);
        const primary = result.payload.product.images.findIndex((image) => image.primary);
        this.selected.set(primary >= 0 ? primary : 0);
        this.status.set('ready');
        if (result.payload.product.name) {
          this.title.setTitle(result.payload.product.name);
        }
        queueMicrotask(() => {
          this.fx?.rebuildSparks();
          this.fx?.applyShine();
        });
      });

    effect(() => {
      const drop = this.product()?.drop ?? null;
      const show = shouldShowDropCountdown(drop);
      untracked(() => this.bindCountdown(show ? drop?.endsAt ?? null : null));
    });

    effect(() => {
      this.cart.open();
      queueMicrotask(() => this.fx?.applyShine());
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
          clearInterval(this.cdIv);
          this.fx?.stop();
        });
      });
    });
  }

  selectImage(index: number) {
    this.selected.set(index);
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
    this.cart.add(p.slug, this.qty(), p.snapshot);
    this.qty.set(1);
    queueMicrotask(() => this.fx?.applyShine());
  }

  private bindCountdown(endsAt: string | null) {
    clearInterval(this.cdIv);
    if (!endsAt) {
      this.countdown.set('00:00:00');
      return;
    }
    const tick = () => {
      this.countdown.set(formatCountdown(endsAt) ?? '00:00:00');
    };
    tick();
    this.cdIv = setInterval(tick, 1000);
  }
}
