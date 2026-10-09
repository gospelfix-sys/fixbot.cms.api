import Link from 'next/link';
import { Plus } from 'lucide-react';
import EmptyState from '@/components/admin/EmptyState';
import BlogTable from './BlogTable';
import { getAllPosts } from '@/libs/supabase/queries/posts.admin';

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">소식 (Blog)</h1>
          <p className="text-sm text-gray-400 mt-0.5">총 {posts.length}건</p>
        </div>
        <Link
          href="/blog/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
        >
          <Plus size={15} />
          새 글 작성
        </Link>
      </div>

      {posts.length === 0 ? (
        <EmptyState message="등록된 소식이 없습니다" />
      ) : (
        <BlogTable posts={posts} />
      )}
    </div>
  );
}
