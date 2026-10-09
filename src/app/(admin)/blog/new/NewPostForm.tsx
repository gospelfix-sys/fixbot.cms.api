'use client';

import { useRouter } from 'next/navigation';
import PostForm from '@/components/admin/PostForm';
import { createPostAction } from '../actions';
import type { PostFormInput, PostStatus } from '@/types/post';

export default function NewPostForm() {
  const router = useRouter();

  const handleSubmit = async (input: PostFormInput, status: PostStatus) => {
    await createPostAction(input, status);
    router.push('/blog');
  };

  return <PostForm onSubmit={handleSubmit} submitLabel="발행" />;
}
