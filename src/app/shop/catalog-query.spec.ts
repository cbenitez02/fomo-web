import { filterCatalog, toCatalogQuery } from './catalog-query';
import type { PublicProductSummary } from '../core/api/public.types';

function card(partial: Partial<PublicProductSummary> & Pick<PublicProductSummary, 'slug' | 'category'>): PublicProductSummary {
  return {
    num: '01',
    name: partial.slug,
    price: 1000,
    tag: null,
    soldOut: false,
    limited: false,
    image: null,
    ...partial,
  };
}

describe('filterCatalog', () => {
  const items = [
    card({ slug: 'a', category: 'anillo', soldOut: false }),
    card({ slug: 'b', category: 'collar', soldOut: true }),
  ];

  it('filtra categoría y agotados sobre datos reales', () => {
    expect(filterCatalog(items, { anillo: true, collar: false }, 'all').map((p) => p.slug)).toEqual(['a']);
    expect(filterCatalog(items, { anillo: true, collar: true }, 'soldout').map((p) => p.slug)).toEqual(['b']);
    expect(filterCatalog(items, { anillo: false, collar: false }, 'all')).toEqual([]);
  });
});

describe('toCatalogQuery', () => {
  it('omite category si anillos y collares están activos', () => {
    expect(toCatalogQuery({ anillo: true, collar: true }, 'all')).toEqual({});
  });

  it('manda category=anillo', () => {
    expect(toCatalogQuery({ anillo: true, collar: false }, 'all')).toEqual({ category: 'anillo' });
  });

  it('manda category=collar y availability=stock', () => {
    expect(toCatalogQuery({ anillo: false, collar: true }, 'stock')).toEqual({
      category: 'collar',
      availability: 'stock',
    });
  });

  it('mapea agotados a sold_out', () => {
    expect(toCatalogQuery({ anillo: true, collar: true }, 'soldout')).toEqual({
      availability: 'sold_out',
    });
  });

  it('devuelve empty si no hay categoría', () => {
    expect(toCatalogQuery({ anillo: false, collar: false }, 'all')).toBe('empty');
  });
});
