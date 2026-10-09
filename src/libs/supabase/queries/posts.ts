import { createClient } from '@/libs/supabase/client';
import type { Post, PostFormInput } from '@/types/post';

export async function getPosts(): Promise<Post[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPostById(id: string): Promise<Post | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createPost(input: PostFormInput, authorId: string): Promise<Post> {
  const supabase = createClient();
  const payload = {
    ...input,
    author_id: authorId,
    published_at: input.status === 'published' ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from('posts')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePost(id: string, input: Partial<PostFormInput>): Promise<Post> {
  const supabase = createClient();
  const payload: Record<string, unknown> = { ...input };

  if (input.status === 'published') {
    const { data: current } = await supabase
      .from('posts')
      .select('status, published_at')
      .eq('id', id)
      .single();

    // draft → published 전환 시에만 published_at 설정 (재발행 시 기존 날짜 유지)
    if (current?.status !== 'published' && !current?.published_at) {
      payload.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from('posts')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}
