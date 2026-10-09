export type ProductPriceType = 'free' | 'paid';
export type ProductStatus = 'active' | 'inactive';

export interface ProductOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  thumbnail_url: string | null;
  demo_url: string | null;
  includes: string | null;
  file_path: string | null;
  price_type: ProductPriceType;
  base_price: number;
  options: ProductOption[];
  status: ProductStatus;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProductFormInput {
  slug: string;
  name: string;
  description: string;
  category: string;
  thumbnail_url: string;
  demo_url: string;
  includes: string;
  file_path: string;
  price_type: ProductPriceType;
  base_price: number;
  options: ProductOption[];
}
