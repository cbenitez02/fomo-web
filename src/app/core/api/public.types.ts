export type ProductCategory = 'anillo' | 'collar';

export type CatalogAvailability = 'all' | 'stock' | 'sold_out';

export type DropStatus = 'unscheduled' | 'upcoming' | 'current' | 'ended';

export type PromotionSlot = 'topbar' | 'band_1' | 'band_2';

export interface PublicCatalogFilters {
  category?: ProductCategory;
  availability?: CatalogAvailability;
}

export interface PublicProductImage {
  url: string;
  alt: string | null;
  primary: boolean;
}

export interface PublicDrop {
  code: string;
  startsAt: string | null;
  endsAt: string | null;
  status: DropStatus;
}

export interface PublicProductSummary {
  slug: string;
  category: ProductCategory;
  num: string;
  name: string;
  price: number;
  tag: string | null;
  soldOut: boolean;
  limited: boolean;
  image: PublicProductImage | null;
}

export interface PublicProductDetail {
  slug: string;
  category: ProductCategory;
  num: string;
  name: string;
  price: number;
  tag: string | null;
  soldOut: boolean;
  limited: boolean;
  description: string[];
  images: PublicProductImage[];
  drop: PublicDrop | null;
}

export interface PublicDropWithProducts extends PublicDrop {
  products: PublicProductSummary[];
}

export interface PublicPromotion {
  slot: PromotionSlot;
  text: string;
  startsAt: string | null;
  endsAt: string | null;
}

export interface PublicFeatured {
  kicker: string | null;
  lede: string | null;
  stockRemaining: number | null;
  stockTotal: number | null;
  product: PublicProductDetail | null;
}

export interface PublicLookbookItem {
  tag: string;
  alt: string | null;
  url: string;
}

export interface PublicInstagramPost {
  url: string;
  alt: string | null;
  permalink: string | null;
}

export interface PublicSettings {
  whatsapp: string;
  instagram: string;
  locationLine: string;
  hashtag: string;
  responseSla: string;
  copyrightText: string;
  seoTitle: string;
  contactKicker: string;
  contactHeadline: string;
  waGeneralText: string;
  soldOutMessage: string | null;
  lookbookCredit: string | null;
  lookWords: string;
  lookOverlay1: string | null;
  lookOverlay2: string | null;
  lookOverlay3: string | null;
  bandTopbar: string | null;
  band1: string | null;
  band2: string | null;
}

export interface PublicHomeResponse {
  settings: PublicSettings;
  featured: PublicFeatured;
  promotions: PublicPromotion[];
  lookbook: PublicLookbookItem[];
  instagram: PublicInstagramPost[];
  drops: PublicDropWithProducts[];
  drop: PublicDropWithProducts | null;
  catalog: {
    anillo: PublicProductSummary[];
    collar: PublicProductSummary[];
  };
}

export interface PublicCatalogResponse {
  items: PublicProductSummary[];
}

export interface PublicProductResponse {
  product: PublicProductDetail;
  related: PublicProductSummary[];
}

export interface PublicPromotionsResponse {
  items: PublicPromotion[];
}

export interface PublicApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
