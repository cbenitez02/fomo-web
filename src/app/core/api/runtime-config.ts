export type FomoWebRuntimeConfig = {
  apiBaseUrl: string;
  assetBaseUrl: string;
};

function trimSlash(value: string): string {
  return value.replace(/\/$/, '');
}

function toHttpsIfAbsolute(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('http://')) return `https://${trimmed.slice('http://'.length)}`;
  return trimmed;
}

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

let current: FomoWebRuntimeConfig = {
  apiBaseUrl: '/api/public',
  assetBaseUrl: '',
};

export function getRuntimeConfig(): FomoWebRuntimeConfig {
  return current;
}

export function applyRuntimeConfig(
  partial: Partial<FomoWebRuntimeConfig>,
  opts: { production?: boolean } = {},
): FomoWebRuntimeConfig {
  const production = opts.production === true;
  const next: FomoWebRuntimeConfig = {
    apiBaseUrl:
      partial.apiBaseUrl !== undefined ? String(partial.apiBaseUrl).trim() : current.apiBaseUrl,
    assetBaseUrl:
      partial.assetBaseUrl !== undefined ? String(partial.assetBaseUrl).trim() : current.assetBaseUrl,
  };

  if (production) {
    if (isAbsoluteHttpUrl(next.apiBaseUrl)) next.apiBaseUrl = toHttpsIfAbsolute(next.apiBaseUrl);
    if (isAbsoluteHttpUrl(next.assetBaseUrl)) next.assetBaseUrl = toHttpsIfAbsolute(next.assetBaseUrl);
  }

  next.apiBaseUrl = trimSlash(next.apiBaseUrl);
  next.assetBaseUrl = trimSlash(next.assetBaseUrl);

  if (!next.assetBaseUrl && isAbsoluteHttpUrl(next.apiBaseUrl)) {
    try {
      next.assetBaseUrl = new URL(next.apiBaseUrl).origin;
    } catch {
      next.assetBaseUrl = '';
    }
  }

  current = next;
  return current;
}

export function resetRuntimeConfig(defaults: FomoWebRuntimeConfig): void {
  current = {
    apiBaseUrl: trimSlash(defaults.apiBaseUrl),
    assetBaseUrl: trimSlash(defaults.assetBaseUrl),
  };
}

export async function loadRuntimeConfig(production: boolean): Promise<FomoWebRuntimeConfig> {
  try {
    const res = await fetch('/config.json', { cache: 'no-store' });
    if (res.ok) {
      const json = (await res.json()) as Partial<FomoWebRuntimeConfig>;
      applyRuntimeConfig(json, { production });
    }
  } catch {
    /* se usan los defaults de environment */
  }
  return current;
}
