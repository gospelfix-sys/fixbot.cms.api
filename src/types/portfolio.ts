export interface Portfolio {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  tags: string[];
  thumbnail_url: string | null;
  site_url: string | null;
  images: string[];
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioFormInput {
  title: string;
  category: string;
  tags: string[];
  thumbnail_url: string;
  images: string[];
  description: string;
  site_url: string;
  is_published: boolean;
}
