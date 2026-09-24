export type ProductCategory = 'anillo' | 'collar';

export interface Product {
  id: string;
  category: ProductCategory;
  num: string;
  name: string;
  price: number;
  tag: string | null;
  soldOut: boolean;
  limited: boolean;
  desc: string[];
}

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  anillo: 'ANILLO',
  collar: 'COLLAR',
};

export const PRODUCTS: Product[] = [
  {
    id: 'an-candado',
    category: 'anillo',
    num: '01',
    name: 'ANILLO CANDADO XL',
    price: 28000,
    tag: 'NUEVO',
    soldOut: false,
    limited: false,
    desc: [
      'Baño de rodio, no se pone verde ni se opaca',
      'Regulable, se adapta a cualquier dedo',
      'Uso diario y agua sin problema',
    ],
  },
  {
    id: 'an-fomo',
    category: 'anillo',
    num: '02',
    name: 'ANILLO FOMO',
    price: 24000,
    tag: 'LIMITADO',
    soldOut: false,
    limited: true,
    desc: [
      'La palabra FOMO repetida forma el aro completo',
      'Baño de rodio sobre bronce',
      'Pieza de tirada corta, no se repone',
    ],
  },
  {
    id: 'an-cadena',
    category: 'anillo',
    num: '03',
    name: 'ANILLO CADENA DOBLE',
    price: 19000,
    tag: null,
    soldOut: true,
    limited: false,
    desc: ['Doble eslabón macizo', 'Baño de rodio', 'Ajuste medio, no regulable'],
  },
  {
    id: 'an-estrella',
    category: 'anillo',
    num: '04',
    name: 'ANILLO ESTRELLA',
    price: 21000,
    tag: 'NUEVO',
    soldOut: false,
    limited: false,
    desc: ['Estrella facetada tallada a mano', 'Baño de rodio, alto brillo', 'Regulable'],
  },
  {
    id: 'an-placa',
    category: 'anillo',
    num: '05',
    name: 'ANILLO PLACA GRABADA',
    price: 23000,
    tag: 'ÚLTIMAS UNIDADES',
    soldOut: false,
    limited: true,
    desc: ['Placa lisa, grabado a pedido sin cargo', 'Baño de rodio sobre bronce', 'Regulable'],
  },
  {
    id: 'an-aro',
    category: 'anillo',
    num: '06',
    name: 'ANILLO ARO GRUESO',
    price: 16000,
    tag: null,
    soldOut: false,
    limited: false,
    desc: ['Aro macizo de 6mm', 'Baño de rodio', 'Ajuste medio, no regulable'],
  },
  {
    id: 'co-candado',
    category: 'collar',
    num: '07',
    name: 'COLLAR CANDADO',
    price: 34000,
    tag: 'NUEVO',
    soldOut: false,
    limited: false,
    desc: [
      'Cadena de 45cm + 5cm de extensión',
      'Baño de rodio, no se pone verde',
      'Cierre de mosquetón reforzado',
    ],
  },
  {
    id: 'co-fomo',
    category: 'collar',
    num: '08',
    name: 'COLLAR FOMO PLACA',
    price: 29000,
    tag: 'LIMITADO',
    soldOut: false,
    limited: true,
    desc: [
      'Placa con la palabra FOMO en relieve',
      'Cadena de 42cm',
      'Pieza de tirada corta, no se repone',
    ],
  },
  {
    id: 'co-estrellas',
    category: 'collar',
    num: '09',
    name: 'COLLAR ESTRELLAS',
    price: 31000,
    tag: null,
    soldOut: true,
    limited: false,
    desc: ['Tres estrellas facetadas en cascada', 'Cadena de 44cm', 'Baño de rodio, alto brillo'],
  },
  {
    id: 'co-gruesa',
    category: 'collar',
    num: '10',
    name: 'COLLAR CADENA GRUESA',
    price: 27000,
    tag: null,
    soldOut: false,
    limited: false,
    desc: ['Eslabón grueso, estilo statement', 'Cadena de 48cm', 'Baño de rodio sobre bronce'],
  },
  {
    id: 'co-doble',
    category: 'collar',
    num: '11',
    name: 'COLLAR DOBLE VUELTA',
    price: 36000,
    tag: 'ÚLTIMAS UNIDADES',
    soldOut: false,
    limited: true,
    desc: ['Dos vueltas de cadena fina superpuestas', 'Largo total 50cm', 'Baño de rodio'],
  },
  {
    id: 'co-corazon',
    category: 'collar',
    num: '12',
    name: 'COLLAR MINI CORAZÓN',
    price: 22000,
    tag: null,
    soldOut: false,
    limited: false,
    desc: [
      'Dije corazón mini, 1.2cm',
      'Cadena de 40cm + 5cm de extensión',
      'Baño de rodio',
    ],
  },
];

export const PRICE_MIN = 16000;
export const PRICE_MAX = 40000;
export const PRICE_STEP = 1000;

export function money(n: number) {
  return '$' + n.toLocaleString('es-AR');
}

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

export function relatedProducts(product: Product, limit = 4) {
  return PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(
    0,
    limit,
  );
}
