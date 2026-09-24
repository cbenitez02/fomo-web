import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { getRuntimeConfig } from './runtime-config';
import type {
  PublicCatalogFilters,
  PublicCatalogResponse,
  PublicHomeResponse,
  PublicProductResponse,
  PublicSettings,
} from './public.types';

@Injectable({ providedIn: 'root' })
export class FomoApiService {
  private readonly http = inject(HttpClient);

  private get base(): string {
    return getRuntimeConfig().apiBaseUrl.replace(/\/$/, '');
  }

  getHome(): Observable<PublicHomeResponse> {
    return this.http.get<PublicHomeResponse>(`${this.base}/home`);
  }

  getCatalog(filters?: PublicCatalogFilters): Observable<PublicCatalogResponse> {
    let params = new HttpParams();
    if (filters?.category) {
      params = params.set('category', filters.category);
    }
    if (filters?.availability && filters.availability !== 'all') {
      params = params.set('availability', filters.availability);
    }
    return this.http.get<PublicCatalogResponse>(`${this.base}/catalog`, { params });
  }

  getProduct(slug: string): Observable<PublicProductResponse> {
    return this.http.get<PublicProductResponse>(`${this.base}/products/${encodeURIComponent(slug)}`);
  }

  getSettings(): Observable<PublicSettings> {
    return this.http.get<PublicSettings>(`${this.base}/settings`);
  }
}
