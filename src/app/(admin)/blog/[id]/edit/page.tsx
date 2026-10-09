import { notFound } from 'next/navigation';
import EditPostForm from './EditPostForm';
import { getPostByIdAdmin } from '@/libs/supabase/queries/posts.admin';

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const post = await getPostByIdAdmin(params.id);
  if (!post) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">글 편집</h1>
        <p className="text-sm text-gray-400 mt-0.5">{post.title}</p>
      </div>
      <EditPostForm post={post} />
    </div>
  );
}
