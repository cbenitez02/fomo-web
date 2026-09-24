import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  ViewChild,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FomoApiError } from '../core/api/fomo-api.error';
import { FomoApiService } from '../core/api/fomo-api.service';
import { resolveAssetUrl } from '../core/api/resolve-asset-url';
import { SettingsStore } from '../core/api/settings.store';
import { CatalogStore } from '../shop/catalog.store';
import type {
  PublicHomeResponse,
  PublicLookbookItem,
  PublicProductSummary,
} from '../core/api/public.types';
import {
  formatCopyright,
  igHandleParts,
  igProfileHref,
  marqueeLoop,
  padStock,
  waHref,
} from '../core/site-links';
import { FlaapsFooter } from '../flaaps-footer/flaaps-footer';
import { FomoNavbar } from '../shop/navbar/navbar';
import { money } from '../shop/products';
import { SOLD_MASK } from '../shop/shop-fx';
import { shouldShowDropCountdown } from '../shop/drop-countdown';
import { CONFIG } from './fx';
import { FomoRuntime } from './engine';
import { assignLookbookSlots } from './lookbook-slots';

type HomeCard = {
  slug: string;
  num: string;
  name: string;
  priceLabel: string;
  tag: string | null;
  soldOut: boolean;
  imageUrl: string;
  wa: string;
  cta: string;
};

@Component({
  selector: 'app-landing',
  imports: [FomoNavbar, FlaapsFooter],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
  encapsulation: ViewEncapsulation.None,
})
export class Landing {
  @ViewChild('rootEl') rootEl?: ElementRef<HTMLElement>;
  @ViewChild('rotEl') rotEl?: ElementRef<HTMLElement>;
  @ViewChild('trackEl') trackEl?: ElementRef<HTMLElement>;
  @ViewChild('barEl') barEl?: ElementRef<HTMLElement>;
  @ViewChild('cdEl') cdEl?: ElementRef<HTMLElement>;

  private readonly api = inject(FomoApiService);
  private readonly settingsStore = inject(SettingsStore);
  private readonly catalogStore = inject(CatalogStore);
  private readonly zone = inject(NgZone);
  readonly mobile = signal(typeof window !== 'undefined' && window.innerWidth < 720);
  readonly failed = signal<string | null>(null);
  readonly home = signal<PublicHomeResponse | null>(null);
  readonly soldMask = SOLD_MASK;

  readonly settings = this.settingsStore.value;
  readonly locationLine = computed(() => this.settings()?.locationLine ?? '');
  readonly hashtag = computed(() => this.settings()?.hashtag ?? '');
  readonly responseSla = computed(() => this.settings()?.responseSla ?? '');
  readonly copyrightText = computed(() => this.settings()?.copyrightText ?? '');
  readonly copyrightLine = computed(() => formatCopyright(this.copyrightText()));
  readonly contactKicker = computed(() => this.settings()?.contactKicker?.trim() ?? '');
  readonly contactHeadline = computed(() => this.settings()?.contactHeadline?.trim() ?? '');
  readonly lookbookCredit = computed(() => this.settings()?.lookbookCredit ?? '');
  readonly overlay1 = computed(() => this.settings()?.lookOverlay1?.trim() ?? '');
  readonly overlay2 = computed(() => this.settings()?.lookOverlay2?.trim() ?? '');
  readonly overlay3 = computed(() => this.settings()?.lookOverlay3?.trim() ?? '');
  readonly igHref = computed(() => igProfileHref(this.settings()?.instagram ?? ''));
  readonly igParts = computed(() => igHandleParts(this.settings()?.instagram ?? ''));
  readonly waGeneral = computed(() => {
    const s = this.settings();
    if (!s) return '';
    return waHref(s.whatsapp, s.waGeneralText);
  });
  readonly band1Text = computed(() => marqueeLoop(this.settings()?.band1 ?? ''));
  readonly band2Text = computed(() => marqueeLoop(this.settings()?.band2 ?? ''));
  readonly rings = computed(() => this.toCards(this.home()?.catalog.anillo ?? [], 'anillo'));
  readonly necklaces = computed(() => this.toCards(this.home()?.catalog.collar ?? [], 'collar'));
  readonly lookSlots = computed(() => assignLookbookSlots(this.home()?.lookbook ?? []));
  readonly igTiles = computed(() => this.home()?.instagram ?? []);
  readonly featured = computed(() => this.home()?.featured ?? null);
  readonly featuredProduct = computed(() => this.featured()?.product ?? null);
  readonly featuredImage = computed(() => {
    const product = this.featuredProduct();
    const cover = product?.images.find((img) => img.primary) ?? product?.images[0];
    return cover ? resolveAssetUrl(cover.url) : '';
  });
  readonly featuredNameLines = computed(() => {
    const name = this.featuredProduct()?.name?.trim() ?? '';
    if (!name) return [];
    const parts = name.split(/\s+/);
    if (parts.length < 2) return [name];
    return [parts.slice(0, -1).join(' '), parts[parts.length - 1]];
  });
  readonly featuredPrice = computed(() => {
    const product = this.featuredProduct();
    return product ? money(product.price) : '';
  });
  readonly featuredWa = computed(() => {
    const s = this.settings();
    const product = this.featuredProduct();
    if (!s || !product) return '';
    const ask = product.soldOut
      ? [s.soldOutMessage?.trim(), product.name].filter(Boolean).join(' — ')
      : `Hola FOMO! Quiero el ${product.name} (${money(product.price)})`;
    return waHref(s.whatsapp, ask);
  });
  readonly featuredCta = computed(() => {
    if (!this.featuredProduct()?.soldOut) return 'LO QUIERO POR WHATSAPP';
    return this.settings()?.soldOutMessage?.trim() || 'AVISAME';
  });
  readonly dropEndsAt = computed(() => {
    const featuredDrop = this.featuredProduct()?.drop;
    if (shouldShowDropCountdown(featuredDrop)) return featuredDrop?.endsAt ?? null;
    const homeDrop = this.home()?.drop;
    if (shouldShowDropCountdown(homeDrop)) return homeDrop?.endsAt ?? null;
    return null;
  });
  readonly dropCode = computed(
    () => this.featuredProduct()?.drop?.code ?? this.home()?.drop?.code ?? null,
  );
  readonly stockRemaining = computed(() => this.featured()?.stockRemaining ?? null);
  readonly stockTotal = computed(() => this.featured()?.stockTotal ?? null);
  readonly stockBarPct = computed(() => {
    const rem = this.stockRemaining();
    const tot = this.stockTotal();
    if (rem == null || tot == null || tot <= 0) return 0;
    return Math.max(0, Math.min(100, (rem / tot) * 100));
  });
  readonly stockRemainingLabel = computed(() => {
    const rem = this.stockRemaining();
    return rem == null ? '' : padStock(rem);
  });
  readonly stockRatioLabel = computed(() => {
    const rem = this.stockRemaining();
    const tot = this.stockTotal();
    if (rem == null || tot == null) return '';
    return `${padStock(rem)} / ${padStock(tot)}`;
  });

  private runtime?: FomoRuntime;

  constructor() {
    const destroy = inject(DestroyRef);

    this.api
      .getHome()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (home) => this.applyHome(home),
        error: (err: unknown) => {
          this.home.set(null);
          this.failed.set(
            err instanceof FomoApiError
              ? err.message
              : 'No pudimos cargar el catálogo. Probá de nuevo.',
          );
        },
      });

    afterNextRender(() => {
      this.zone.runOutsideAngular(() => {
        this.runtime = new FomoRuntime({
          intensity: CONFIG.intensity,
          chains: CONFIG.chains,
          sparkles: CONFIG.sparkles,
          lookWords: this.settings()?.lookWords ?? '',
          endsAt: this.dropEndsAt(),
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          root: () => this.rootEl?.nativeElement ?? null,
          rot: () => this.rotEl?.nativeElement ?? null,
          track: () => this.trackEl?.nativeElement ?? null,
          bar: () => this.barEl?.nativeElement ?? null,
          cd: () => this.cdEl?.nativeElement ?? null,
          onMobile: (mob: boolean) => this.zone.run(() => this.mobile.set(mob)),
        });
        this.runtime.start();
        const id = location.hash.replace('#', '');
        if (id) {
          requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
        }
      });
    });

    destroy.onDestroy(() => this.runtime?.stop());
  }

  slide(dir: number) {
    this.runtime?.slide(dir);
  }

  dragStart(event: PointerEvent) {
    this.runtime?.dragStart(event);
  }

  igPostHref(permalink: string | null): string {
    return permalink || this.igHref();
  }

  lookUrl(item: PublicLookbookItem | null): string {
    return item ? resolveAssetUrl(item.url) : '';
  }

  assetUrl(path: string | null | undefined): string {
    return resolveAssetUrl(path);
  }

  private applyHome(home: PublicHomeResponse) {
    this.failed.set(null);
    this.settingsStore.hydrate(home.settings);
    this.catalogStore.hydrateFromHome(home.catalog);
    this.home.set(home);
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.runtime?.setLookWords(home.settings.lookWords ?? '');
        this.runtime?.setEndsAt(this.dropEndsAt());
      });
    });
  }

  private toCards(items: PublicProductSummary[], kind: 'anillo' | 'collar'): HomeCard[] {
    const s = this.settings();
    const soldCta = s?.soldOutMessage?.trim() ?? '';
    return items.map((item) => {
      const priceLabel = money(item.price);
      const soldOut = item.soldOut;
      const ask = soldOut
        ? [soldCta, item.name].filter(Boolean).join(' — ')
        : `Hola! Quiero el ${kind} ${item.name} (${priceLabel})`;
      return {
        slug: item.slug,
        num: item.num,
        name: item.name,
        priceLabel,
        tag: item.tag,
        soldOut,
        imageUrl: item.image ? resolveAssetUrl(item.image.url) : '',
        wa: s ? waHref(s.whatsapp, ask) : '',
        cta: soldOut ? soldCta || 'AVISAME' : 'LO QUIERO',
      };
    });
  }
}
