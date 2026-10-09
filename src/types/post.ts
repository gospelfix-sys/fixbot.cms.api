export type PostStatus = 'draft' | 'published';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  status: PostStatus;
  published_at: string | null;
  author_id: string | null;
  tags: string[];
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface PostFormInput {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string;
  tags: string[];
  status: PostStatus;
}
