'use client';

import { useRouter } from 'next/navigation';
import PostForm from '@/components/admin/PostForm';
import { updatePostAction } from '../../actions';
import type { Post, PostFormInput, PostStatus } from '@/types/post';

export default function EditPostForm({ post }: { post: Post }) {
  const router = useRouter();

  const handleSubmit = async (input: PostFormInput, status: PostStatus) => {
    await updatePostAction(post.id, input, status);
    router.push('/blog');
  };

  const initialValues: Partial<PostFormInput> = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? '',
    cover_image_url: post.cover_image_url ?? '',
    content: post.content ?? '',
    tags: post.tags,
    status: post.status,
  };

  return <PostForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel="수정 완료" />;
}
