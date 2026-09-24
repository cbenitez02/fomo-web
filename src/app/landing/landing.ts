import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  ViewChild,
  ViewEncapsulation,
  inject,
  signal,
} from '@angular/core';
import { FomoNavbar } from '../shop/navbar/navbar';
import { FlaapsFooter } from '../flaaps-footer/flaaps-footer';
import { CONFIG, buildCatalog } from './catalog';
import { FomoRuntime } from './engine';

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

  readonly catalog = buildCatalog();
  readonly mobile = signal(typeof window !== 'undefined' && window.innerWidth < 720);
  readonly soldMask =
    "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27220%27 height=%27120%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.9%27 numOctaves=%272%27 seed=%274%27/%3E%3CfeComponentTransfer%3E%3CfeFuncA type=%27discrete%27 tableValues=%271 1 1 1 1 1 1 0 1 1 1 1%27/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')";

  private runtime?: FomoRuntime;

  constructor() {
    const zone = inject(NgZone);
    const destroy = inject(DestroyRef);

    afterNextRender(() => {
      zone.runOutsideAngular(() => {
        this.runtime = new FomoRuntime({
          intensity: CONFIG.intensity,
          chains: CONFIG.chains,
          sparkles: CONFIG.sparkles,
          lookWords: CONFIG.lookWords,
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          root: () => this.rootEl?.nativeElement ?? null,
          rot: () => this.rotEl?.nativeElement ?? null,
          track: () => this.trackEl?.nativeElement ?? null,
          bar: () => this.barEl?.nativeElement ?? null,
          cd: () => this.cdEl?.nativeElement ?? null,
          onMobile: (mob: boolean) => zone.run(() => this.mobile.set(mob)),
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
}
