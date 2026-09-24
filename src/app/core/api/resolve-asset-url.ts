import { getRuntimeConfig } from './runtime-config';

function isAbsoluteUrl(value: string): boolean {
  return /^(https?:|data:|blob:)/i.test(value);
}

function toHttpsIfPageIsHttps(url: string): string {
  if (typeof window === 'undefined') return url;
  if (window.location.protocol !== 'https:') return url;
  if (url.startsWith('http://')) return `https://${url.slice('http://'.length)}`;
  return url;
}

function assetOrigin(): string {
  const { assetBaseUrl, apiBaseUrl } = getRuntimeConfig();
  if (assetBaseUrl) return assetBaseUrl;
  if (isAbsoluteUrl(apiBaseUrl)) {
    try {
      return new URL(apiBaseUrl).origin;
    } catch {
      return '';
    }
  }
  return '';
}

/** Resuelve `/uploads/...` contra el host de la API. Deja intactas URLs absolutas. */
export function resolveAssetUrl(path: string | null | undefined): string {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (isAbsoluteUrl(trimmed)) return toHttpsIfPageIsHttps(trimmed);

  const origin = assetOrigin();
  const pathname = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const resolved = origin ? `${origin}${pathname}` : pathname;
  return toHttpsIfPageIsHttps(resolved);
}
