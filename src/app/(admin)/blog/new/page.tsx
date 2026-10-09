import NewPostForm from './NewPostForm';

export default function NewBlogPostPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">새 글 작성</h1>
        <p className="text-sm text-gray-400 mt-0.5">작성 후 발행하면 공개 API에서 즉시 노출됩니다.</p>
      </div>
      <NewPostForm />
    </div>
  );
}
