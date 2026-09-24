import type {
  ProductCategory,
  PublicCatalogFilters,
  PublicProductSummary,
} from '../core/api/public.types';

export type ShopAvail = 'all' | 'stock' | 'soldout';

/** Filtro en memoria sobre el catálogo completo ya cargado (precio sigue aparte). */
export function filterCatalog(
  items: PublicProductSummary[],
  cats: Record<ProductCategory, boolean>,
  avail: ShopAvail,
): PublicProductSummary[] {
  if (!cats.anillo && !cats.collar) return [];
  return items.filter((item) => {
    if (!cats[item.category]) return false;
    if (avail === 'stock' && item.soldOut) return false;
    if (avail === 'soldout' && !item.soldOut) return false;
    return true;
  });
}

export function toCatalogQuery(
  cats: Record<ProductCategory, boolean>,
  avail: ShopAvail,
): PublicCatalogFilters | 'empty' {
  if (!cats.anillo && !cats.collar) return 'empty';
  const query: PublicCatalogFilters = {};
  if (cats.anillo !== cats.collar) {
    query.category = cats.anillo ? 'anillo' : 'collar';
  }
  if (avail === 'stock') query.availability = 'stock';
  if (avail === 'soldout') query.availability = 'sold_out';
  return query;
}
