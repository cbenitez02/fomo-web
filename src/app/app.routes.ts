import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { CatalogPage } from './shop/catalog/catalog';
import { ProductPage } from './shop/product/product';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'catalogo', component: CatalogPage },
  { path: 'producto/:id', component: ProductPage },
  { path: '**', redirectTo: '' },
];
