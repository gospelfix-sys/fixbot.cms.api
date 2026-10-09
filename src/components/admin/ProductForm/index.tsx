'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, ImageIcon, FileIcon } from 'lucide-react';
import { createClient } from '@/libs/supabase/client';
import { AlertDialog } from '@/components/ui/alert-dialog';
import type { ProductFormInput, ProductOption, ProductPriceType, ProductStatus } from '@/types/product';

interface ProductFormProps {
  initialValues?: Partial<ProductFormInput>;
  initialStatus?: ProductStatus;
  onSubmit: (input: ProductFormInput, status: ProductStatus) => Promise<void>;
  submitLabel?: string;
}

const INPUT_CLASS =
  'w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm';

const CATEGORIES = ['landing', 'template', 'plugin', 'component', 'starter', '기타'];

const ACTIVE_LABEL = '활성화 (프론트에 노출)';

const THUMBNAIL_MAX_BYTES = 5 * 1024 * 1024;
const DOWNLOAD_MAX_BYTES = 200 * 1024 * 1024;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w가-힣-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function uploadToStorage(file: File, folder: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage.from('products').upload(path, file, { upsert: false });
  if (error) throw new Error(`파일 업로드 실패: ${error.message}`);
  const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path);
  return publicUrl;
}

export default function ProductForm({
  initialValues,
  initialStatus,
  onSubmit,
  submitLabel = '등록',
}: ProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialValues?.name ?? '');
  const [slug, setSlug] = useState(initialValues?.slug ?? '');
  const [category, setCategory] = useState(initialValues?.category ?? '');
  const [basePrice, setBasePrice] = useState(initialValues?.base_price ?? 0);
  const [demoUrl, setDemoUrl] = useState(initialValues?.demo_url ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [includes, setIncludes] = useState(initialValues?.includes ?? '');
  const [options, setOptions] = useState<ProductOption[]>(initialValues?.options ?? []);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(initialValues?.thumbnail_url ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(initialValues?.thumbnail_url ?? '');

  const [downloadFile, setDownloadFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>(initialValues?.file_path ?? '');

  const [priceType, setPriceType] = useState<ProductPriceType>(initialValues?.price_type ?? 'free');
  const [isActive, setIsActive] = useState(initialStatus === 'active');
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const thumbnailRef = useRef<HTMLInputElement>(null);
  const downloadRef = useRef<HTMLInputElement>(null);

  // Object URL 메모리 누수 방지: 언마운트 시 revoke
  useEffect(() => {
    return () => {
      if (thumbnailFile && thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailFile, thumbnailPreview]);

  const handlePriceTypeChange = (type: ProductPriceType) => {
    setPriceType(type);
    if (type === 'free') setBasePrice(0);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!initialValues?.slug) setSlug(slugify(value));
  };

  const handleThumbnailSelect = (file: File) => {
    if (file.size > THUMBNAIL_MAX_BYTES) {
      setAlertMessage('썸네일은 5MB 이하 파일만 업로드할 수 있습니다.');
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const clearThumbnail = () => {
    if (thumbnailPreview && thumbnailFile) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailFile(null);
    setThumbnailPreview(thumbnailUrl);
    if (thumbnailRef.current) thumbnailRef.current.value = '';
  };

  const handleDownloadSelect = (file: File) => {
    if (file.size > DOWNLOAD_MAX_BYTES) {
      setAlertMessage('다운로드 파일은 200MB 이하만 업로드할 수 있습니다.');
      return;
    }
    setDownloadFile(file);
  };

  const addOption = () => {
    setOptions((prev) => [...prev, { id: crypto.randomUUID(), name: '', price: 0, description: '' }]);
  };

  const removeOption = (id: string) => setOptions((prev) => prev.filter((o) => o.id !== id));

  const updateOption = (id: string, field: keyof ProductOption, value: string | number) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  };

  const handleSave = async () => {
    if (loading) return;
    if (!name.trim()) { setAlertMessage('상품명을 입력해주세요.'); return; }
    if (!slug.trim()) { setAlertMessage('슬러그를 입력해주세요.'); return; }
    if (priceType === 'paid' && options.some((o) => !o.name.trim())) {
      setAlertMessage('옵션명을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      let finalThumbnailUrl = thumbnailUrl;
      let finalFilePath = filePath;

      if (thumbnailFile) finalThumbnailUrl = await uploadToStorage(thumbnailFile, 'thumbnails');
      if (downloadFile) finalFilePath = await uploadToStorage(downloadFile, 'files');

      await onSubmit(
        {
          slug,
          name,
          description,
          category,
          thumbnail_url: finalThumbnailUrl,
          demo_url: demoUrl,
          includes,
          file_path: finalFilePath,
          price_type: priceType,
          base_price: basePrice,
          options: priceType === 'paid' ? options : [],
        },
        isActive ? 'active' : 'inactive',
      );
    } catch (err) {
      setAlertMessage(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const saveButtonLabel = loading ? '저장 중...' : submitLabel;

  const activeCheckboxClass = 'w-4 h-4 rounded border-gray-300 accent-black dark:accent-white focus:ring-black dark:focus:ring-white';

  return (
    <>
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start max-w-5xl w-full">
      {/* 모바일 전용 액션 바 */}
      <div className="lg:hidden w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <label htmlFor="isActive-mobile" className="flex items-center gap-2 cursor-pointer mr-auto">
            <input
              id="isActive-mobile"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className={activeCheckboxClass}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{ACTIVE_LABEL}</span>
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

      {/* 메인 폼 */}
      <div className="w-full lg:flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        <div className="space-y-5">
          {/* 상품명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              상품명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="상품명을 입력하세요"
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
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">카테고리 선택</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 가격 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              가격 유형 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              {(['free', 'paid'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handlePriceTypeChange(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    priceType === type
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {type === 'free' ? '무료 (FREE)' : '유료'}
                </button>
              ))}
            </div>
            {priceType === 'paid' && (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={basePrice === 0 ? '' : basePrice.toLocaleString('ko-KR')}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setBasePrice(raw === '' ? 0 : parseInt(raw, 10));
                  }}
                  placeholder="가격을 입력하세요"
                  className={INPUT_CLASS}
                />
                <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">원</span>
              </div>
            )}
          </div>

          {/* 유료 옵션 */}
          {priceType === 'paid' && (
            <div className="pl-4 border-l-2 border-gray-300 dark:border-gray-600 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">추가 옵션</label>
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  <Plus size={13} />
                  옵션 추가
                </button>
              </div>

              {options.length === 0 ? (
                <p className="text-xs text-gray-400 py-1">옵션을 추가하면 구매자가 선택할 수 있습니다.</p>
              ) : (
                <div className="space-y-3">
                  {options.map((option, idx) => (
                    <div key={option.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">옵션 {idx + 1}</span>
                        <button type="button" onClick={() => removeOption(option.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">옵션명 *</label>
                          <input type="text" value={option.name} onChange={(e) => updateOption(option.id, 'name', e.target.value)} placeholder="예: 고급 플랜" className={INPUT_CLASS} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">옵션 가격 (원)</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={option.price === 0 ? '' : option.price.toLocaleString('ko-KR')}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, '');
                              updateOption(option.id, 'price', raw === '' ? 0 : parseInt(raw, 10));
                            }}
                            placeholder="0"
                            className={INPUT_CLASS}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">옵션 설명</label>
                        <input type="text" value={option.description} onChange={(e) => updateOption(option.id, 'description', e.target.value)} placeholder="이 옵션에 포함된 내용" className={INPUT_CLASS} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 썸네일 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">썸네일 대표 이미지</label>
              <span className="text-xs text-gray-400">권장 사이즈: 1200 × 800px</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
              {/* 이미지 미리보기 */}
              <div className="relative w-full sm:w-64 h-40 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700">
                {thumbnailPreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbnailPreview} alt="썸네일 미리보기" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={clearThumbnail}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl">
                    <ImageIcon size={32} className="text-gray-300 dark:text-gray-600" />
                  </div>
                )}
              </div>

              {/* 버튼 영역 */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => thumbnailRef.current?.click()}
                  className="px-8 py-3.5 text-sm bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-80 transition-opacity"
                >
                  {thumbnailPreview ? '이미지 변경' : '이미지 선택'}
                </button>
                <p className="text-xs text-gray-400">JPG, PNG, WebP · 최대 5MB</p>
              </div>
            </div>
            <input
              ref={thumbnailRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleThumbnailSelect(e.target.files[0])}
            />
          </div>

          {/* 데모 URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">데모 URL</label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://..."
              className={INPUT_CLASS}
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상품 설명을 입력하세요"
              rows={4}
              className={`${INPUT_CLASS} resize-none`}
            />
          </div>

          {/* 포함 항목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">포함 항목 (쉼표로 구분)</label>
            <input
              type="text"
              value={includes}
              onChange={(e) => setIncludes(e.target.value)}
              placeholder="예: 소스 파일, 문서, 1년 업데이트"
              className={INPUT_CLASS}
            />
          </div>

          {/* 다운로드 파일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">다운로드 파일</label>
            <div className="flex items-center gap-3 px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
              <div className="flex-1 flex items-center gap-2 min-w-0">
                {downloadFile ? (
                  <>
                    <FileIcon size={16} className="text-gray-700 dark:text-gray-300 shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{downloadFile.name}</span>
                  </>
                ) : filePath ? (
                  <>
                    <FileIcon size={16} className="text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{filePath}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">ZIP · PDF 최대 200MB</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => downloadRef.current?.click()}
                className="shrink-0 px-3 py-1.5 text-xs bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity font-medium"
              >
                파일 선택
              </button>
            </div>
            <input
              ref={downloadRef}
              type="file"
              accept=".zip,.pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleDownloadSelect(e.target.files[0])}
            />
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
          <label htmlFor="isActive-desktop" className="flex items-center gap-2.5 cursor-pointer pt-3 mt-1 border-t border-gray-100 dark:border-gray-700">
            <input
              id="isActive-desktop"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className={activeCheckboxClass}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{ACTIVE_LABEL}</span>
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
