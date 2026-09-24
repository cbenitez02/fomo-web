import type { ProductCategory } from '../core/api/public.types';

export type { ProductCategory };

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  anillo: 'ANILLO',
  collar: 'COLLAR',
};

export function money(n: number) {
  return '$' + n.toLocaleString('es-AR');
}
