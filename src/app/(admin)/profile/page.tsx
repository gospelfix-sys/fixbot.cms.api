'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Minus } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { updateProfile } from '@/libs/supabase/queries/profile';

const schema = z.object({
  full_name: z.string().min(1, '이름을 입력해주세요').max(50, '이름은 50자 이하여야 합니다'),
});

export default function ProfilePage() {
  const { profile } = useAuth();
  const { setProfile: setUserProfile } = useUser();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('JPG, PNG, GIF, WEBP 형식만 업로드 가능합니다.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearAvatar = () => setAvatarPreview(null);

  const handleSave = async () => {
    setError('');
    const result = schema.safeParse({ full_name: fullName });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    if (!profile) return;

    setSaving(true);
    try {
      const isMock = profile.id === 'mock-user-id';
      if (!isMock) await updateProfile(profile.id, result.data.full_name);

      setUserProfile((prev) =>
        prev ? { ...prev, full_name: result.data.full_name, avatar_url: avatarPreview } : prev,
      );
      toast.success('프로필이 저장되었습니다');
    } catch {
      toast.error('저장 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">프로필 설정</h1>

      <div className="flex flex-col gap-4">
        {/* 아바타 이미지 카드 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex justify-center">
          <div className="relative w-[200px] h-[200px] sm:w-[240px] sm:h-[240px]">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden cursor-pointer flex items-center justify-center"
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="프로필 이미지" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-bold text-gray-300 dark:text-gray-600 select-none">
                  {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
                </span>
              )}
            </div>
            {avatarPreview && (
              <button
                onClick={clearAvatar}
                className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                aria-label="이미지 삭제"
              >
                <Minus size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 입력 필드 카드 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">이름</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setError(''); }}
              placeholder="이름을 입력하세요"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-black transition-colors"
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">이메일</span>
            <input
              type="email"
              value={profile?.email ?? ''}
              disabled
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            />
          </label>
        </div>

        {/* 업로드 행 + 저장 버튼 카드 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="썸네일" className="w-full h-full object-cover" />
              ) : (
                <span className="text-base font-bold text-gray-300 dark:text-gray-600">
                  {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">프로필 이미지</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">최적 사이즈 200×200 / 파일형식 JPG, PNG, GIF</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                불러오기
              </button>
              <button
                onClick={clearAvatar}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
            >
              {saving ? '저장 중...' : '변경사항 저장'}
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
