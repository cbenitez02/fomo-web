import { Injectable, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import type { PublicSettings } from './public.types';
import { FomoApiService } from './fomo-api.service';

@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private readonly api = inject(FomoApiService);
  private readonly title = inject(Title);
  private inflight: Observable<PublicSettings> | null = null;
  readonly value = signal<PublicSettings | null>(null);

  /** Reusa `settings` de `GET /home` sin un segundo round-trip. */
  hydrate(settings: PublicSettings): void {
    this.value.set(settings);
    this.applyTitle(settings);
  }

  ensure(): Observable<PublicSettings> {
    const current = this.value();
    if (current) {
      this.applyTitle(current);
      return of(current);
    }
    if (!this.inflight) {
      this.inflight = this.api.getSettings().pipe(
        tap({
          next: (settings) => {
            this.value.set(settings);
            this.applyTitle(settings);
          },
          error: () => {
            this.inflight = null;
          },
        }),
        shareReplay(1),
      );
    }
    return this.inflight;
  }

  private applyTitle(settings: PublicSettings) {
    const seo = settings.seoTitle?.trim();
    if (seo) this.title.setTitle(seo);
  }
}
