'use client';

import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import RichEditor from '@/components/admin/RichEditor';
import { AlertDialog } from '@/components/ui/alert-dialog';
import type { PostFormInput, PostStatus } from '@/types/post';

interface PostFormProps {
  initialValues?: Partial<PostFormInput>;
  onSubmit: (input: PostFormInput, status: PostStatus) => Promise<void>;
  submitLabel?: string;
}

const INPUT_CLASS =
  'w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm';

const PUBLISHED_LABEL = '발행 (프론트에 노출)';
const CHECKBOX_CLASS = 'w-4 h-4 rounded border-gray-300 accent-black dark:accent-white focus:ring-black dark:focus:ring-white';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\wÀ-ɏ가-힣-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function PostForm({ initialValues, onSubmit, submitLabel = '저장' }: PostFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [slug, setSlug] = useState(initialValues?.slug ?? '');
  const [excerpt, setExcerpt] = useState(initialValues?.excerpt ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialValues?.cover_image_url ?? '');
  const [content, setContent] = useState(initialValues?.content ?? '');
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [isPublished, setIsPublished] = useState(initialValues?.status === 'published');
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!initialValues?.slug) setSlug(slugify(value));
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSave = async () => {
    if (loading) return;
    if (!title.trim()) { setAlertMessage('제목을 입력해주세요.'); return; }
    if (!slug.trim()) { setAlertMessage('슬러그를 입력해주세요.'); return; }
    const status: PostStatus = isPublished ? 'published' : 'draft';
    setLoading(true);
    try {
      await onSubmit({ title, slug, excerpt, cover_image_url: coverImageUrl, content, tags, status }, status);
    } catch (err) {
      setAlertMessage(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const saveButtonLabel = loading ? '저장 중...' : isPublished ? submitLabel : '임시저장';

  return (
    <>
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start max-w-5xl w-full">
      {/* 모바일 전용 액션 바 */}
      <div className="lg:hidden w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <label htmlFor="isPublished-mobile" className="flex items-center gap-2 cursor-pointer mr-auto">
            <input
              id="isPublished-mobile"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className={CHECKBOX_CLASS}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{PUBLISHED_LABEL}</span>
          </label>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {saveButtonLabel}
          </button>
        </div>
      </div>

      {/* 메인 폼 카드 */}
      <div className="w-full lg:flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        <div className="space-y-5">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="글 제목을 입력하세요"
              className={INPUT_CLASS}
            />
          </div>

          {/* 슬러그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              슬러그(URL) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-friendly-slug"
              className={`${INPUT_CLASS} font-mono`}
            />
            <p className="mt-1 text-xs text-gray-400">API URL: /api/v1/blog/{slug || 'slug'}</p>
          </div>

          {/* 요약 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">요약</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="글 요약 (목록에서 표시됩니다)"
              rows={2}
              className={`${INPUT_CLASS} resize-none`}
            />
          </div>

          {/* 커버 이미지 URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">커버 이미지 URL</label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
              className={INPUT_CLASS}
            />
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">태그</label>
            <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 min-h-[42px]">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                placeholder={tags.length === 0 ? '태그 입력 후 Enter 또는 쉼표' : ''}
                className="flex-1 min-w-[120px] text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* 본문 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">본문</label>
            <RichEditor value={content} onChange={setContent} />
          </div>
        </div>
      </div>

      {/* 우측 액션 패널 (데스크탑 전용) */}
      <div className="hidden lg:block w-52 shrink-0">
        <div className="sticky top-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-full px-4 py-2.5 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {saveButtonLabel}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            취소
          </button>
          <label htmlFor="isPublished-desktop" className="flex items-center gap-2.5 cursor-pointer pt-3 mt-1 border-t border-gray-100 dark:border-gray-700">
            <input
              id="isPublished-desktop"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className={CHECKBOX_CLASS}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{PUBLISHED_LABEL}</span>
          </label>
        </div>
      </div>
    </div>
    <AlertDialog
      open={!!alertMessage}
      message={alertMessage}
      onConfirm={() => setAlertMessage('')}
    />
    </>
  );
}
