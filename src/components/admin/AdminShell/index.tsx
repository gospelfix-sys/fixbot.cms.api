'use client';

import { Menu } from 'lucide-react';
import { useMobileMenu } from '@/components/admin/MobileMenuContext';
import { useAuth } from '@/hooks/useAuth';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { isOpen, open, close } = useMobileMenu();
  const { profile } = useAuth();

  return (
    <>
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 h-14 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-black overflow-hidden flex items-center justify-center text-white font-bold text-xs shrink-0">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              <span>G</span>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">GOSPELFIX</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">ADMIN</p>
          </div>
        </div>
        <button
          onClick={open}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu size={20} />
        </button>
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={close}
        />
      )}

      {children}
    </>
  );
}
