'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { createClient } from '@/libs/supabase/client';
import RichEditor from '@/components/admin/RichEditor';
import { AlertDialog } from '@/components/ui/alert-dialog';
import type { PortfolioFormInput } from '@/types/portfolio';

const CATEGORIES = [
  '쇼핑몰 · 이커머스',
  '음악 · 신문사',
  '브랜딩 · 디자인',
  '랜딩 페이지',
  '포트폴리오',
  '기타',
];

const INPUT_CLASS =
  'w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm';

const CHECKBOX_CLASS =
  'w-4 h-4 rounded border-gray-300 accent-black dark:accent-white focus:ring-black dark:focus:ring-white';

const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

async function uploadImageToStorage(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from('portfolio-images')
    .upload(path, file, { upsert: false });
  if (error) throw new Error(`이미지 업로드 실패: ${error.message}`);
  const {
    data: { publicUrl },
  } = supabase.storage.from('portfolio-images').getPublicUrl(data.path);
  return publicUrl;
}

interface PortfolioFormProps {
  initialValues?: Partial<PortfolioFormInput>;
  onSubmit: (input: PortfolioFormInput) => Promise<void>;
  submitLabel?: string;
}

export default function PortfolioForm({
  initialValues,
  onSubmit,
  submitLabel = '등록',
}: PortfolioFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [category, setCategory] = useState(initialValues?.category ?? '');
  const [tagsInput, setTagsInput] = useState((initialValues?.tags ?? []).join(', '));
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [siteUrl, setSiteUrl] = useState(initialValues?.site_url ?? '');
  const [isPublished, setIsPublished] = useState(initialValues?.is_published ?? false);
  const [existingImages, setExistingImages] = useState<string[]>(initialValues?.images ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Object URL 메모리 누수 방지
  useEffect(() => {
    return () => {
      newPreviews.forEach(URL.revokeObjectURL);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilesSelect = (files: FileList) => {
    const valid = Array.from(files).filter((f) => {
      if (f.size > IMAGE_MAX_BYTES) {
        setAlertMessage(`${f.name}: 이미지는 10MB 이하만 업로드할 수 있습니다.`);
        return false;
      }
      return true;
    });
    const previews = valid.map((f) => URL.createObjectURL(f));
    setNewFiles((prev) => [...prev, ...valid]);
    setNewPreviews((prev) => [...prev, ...previews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx: number) => {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (loading) return;
    if (!title.trim()) {
      setAlertMessage('브랜드명을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const uploadedUrls = await Promise.all(newFiles.map(uploadImageToStorage));
      const allImages = [...existingImages, ...uploadedUrls];
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSubmit({
        title: title.trim(),
        category,
        tags,
        thumbnail_url: allImages[0] ?? '',
        images: allImages,
        description,
        site_url: siteUrl,
        is_published: isPublished,
      });
    } catch (err) {
      setAlertMessage(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const allPreviews = [
    ...existingImages.map((url, i) => ({ url, isExisting: true, idx: i })),
    ...newPreviews.map((url, i) => ({ url, isExisting: false, idx: i })),
  ];

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
            <span className="text-sm text-gray-700 dark:text-gray-300">발행 (프론트에 노출)</span>
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
            {loading ? '저장 중...' : submitLabel}
          </button>
        </div>
      </div>

      {/* 메인 폼 카드 */}
      <div className="w-full lg:flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        <div className="space-y-5">
          {/* 브랜드명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              브랜드명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="브랜드명을 입력하세요"
              className={INPUT_CLASS}
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">카테고리 선택</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="예: 쇼핑몰, 이커머스, Next.js"
              className={INPUT_CLASS}
            />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                썸네일 대표 이미지
              </label>
              <span className="text-xs text-gray-400">1080 × 1350px 권장</span>
            </div>

            {allPreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {allPreviews.map((item, i) => (
                  <div
                    key={item.url}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        item.isExisting
                          ? removeExistingImage(item.idx)
                          : removeNewImage(item.idx)
                      }
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <X size={10} />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 bg-orange-500 text-white rounded font-medium">
                        대표
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 text-sm bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-80 transition-opacity"
              >
                이미지 파일 선택
              </button>
              <p className="text-xs text-gray-400">JPG, PNG, WebP · 최대 10MB · 다중 선택 가능</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFilesSelect(e.target.files)}
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              설명
            </label>
            <RichEditor value={description} onChange={setDescription} />
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
            {loading ? '저장 중...' : submitLabel}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            취소
          </button>
          <label
            htmlFor="isPublished-desktop"
            className="flex items-center gap-2.5 cursor-pointer pt-3 mt-1 border-t border-gray-100 dark:border-gray-700"
          >
            <input
              id="isPublished-desktop"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className={CHECKBOX_CLASS}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">발행 (프론트에 노출)</span>
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
