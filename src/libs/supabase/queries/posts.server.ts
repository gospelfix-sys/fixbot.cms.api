import { createClient } from '@/libs/supabase/server';
import type { Post } from '@/types/post';

export async function getPublishedPosts(page = 1, limit = 10): Promise<{ posts: Post[]; total: number }> {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('published_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { posts: data ?? [], total: count ?? 0 };
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}
