'use server';

import {
  createPost,
  updatePost,
  deletePost,
  duplicatePost,
  updatePostsSortOrder,
} from '@/libs/supabase/queries/posts.admin';
import type { Post, PostFormInput, PostStatus } from '@/types/post';

export async function createPostAction(input: PostFormInput, status: PostStatus): Promise<Post> {
  return createPost(input, status);
}

export async function updatePostAction(id: string, input: PostFormInput, status: PostStatus): Promise<Post> {
  return updatePost(id, input, status);
}

export async function deletePostAction(id: string): Promise<void> {
  return deletePost(id);
}

export async function duplicatePostAction(id: string): Promise<Post> {
  return duplicatePost(id);
}

export async function updatePostsSortOrderAction(
  updates: { id: string; sort_order: number }[],
): Promise<void> {
  return updatePostsSortOrder(updates);
}
