import { resolveAssetUrl } from './resolve-asset-url';
import { applyRuntimeConfig, resetRuntimeConfig } from './runtime-config';

describe('resolveAssetUrl', () => {
  afterEach(() => {
    resetRuntimeConfig({ apiBaseUrl: '/api/public', assetBaseUrl: '' });
  });

  it('deja intactas URLs absolutas HTTPS', () => {
    expect(resolveAssetUrl('https://cdn.example/a.webp')).toBe('https://cdn.example/a.webp');
  });

  it('conserva paths /uploads en same-origin', () => {
    expect(resolveAssetUrl('/uploads/lookbook/x.png')).toBe('/uploads/lookbook/x.png');
  });

  it('resuelve /uploads contra el host de la API', () => {
    applyRuntimeConfig({
      apiBaseUrl: 'https://api.example.com/api/public',
      assetBaseUrl: 'https://api.example.com',
    });
    expect(resolveAssetUrl('/uploads/products/x.webp')).toBe(
      'https://api.example.com/uploads/products/x.webp',
    );
  });

  it('usa el origin de apiBaseUrl si assetBaseUrl está vacío', () => {
    applyRuntimeConfig({
      apiBaseUrl: 'https://api.example.com/api/public',
      assetBaseUrl: '',
    });
    expect(resolveAssetUrl('uploads/products/x.webp')).toBe(
      'https://api.example.com/uploads/products/x.webp',
    );
  });

  it('devuelve vacío si no hay path', () => {
    expect(resolveAssetUrl(null)).toBe('');
    expect(resolveAssetUrl('  ')).toBe('');
  });
});
