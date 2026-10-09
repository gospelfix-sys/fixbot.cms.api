'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { CheckCircle2, Moon, Sun, SunMoon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const THEMES = [
  { value: 'light', label: '라이트', Icon: Sun },
  { value: 'dark', label: '다크', Icon: Moon },
  { value: 'system', label: '자동', Icon: SunMoon },
] as const;

export default function SettingsClientSection() {
  const { profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* 계정 설정 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">계정 설정</h2>
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-gray-700 dark:text-gray-300">로그인 계정</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{profile?.email ?? ''}</span>
            <CheckCircle2 size={16} className="text-green-500 shrink-0" />
          </div>
        </div>
      </div>

      {/* 서비스 설정 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">서비스 설정</h2>
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-gray-700 dark:text-gray-300">테마</span>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {THEMES.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  mounted && theme === value
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
