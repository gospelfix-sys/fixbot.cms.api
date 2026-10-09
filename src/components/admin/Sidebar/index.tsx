'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ChevronUp, ExternalLink, LucideIcon, LogOut, Settings, User, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMobileMenu } from '@/components/admin/MobileMenuContext';

type NavItem = { label: string; href: string; external?: boolean };

const NAV_ITEMS: NavItem[] = [
  { label: '유저', href: '/users' },
  { label: '주문 관리', href: '/orders' },
  { label: '견적 신청', href: '/quotes' },
  { label: '소식 (Blog)', href: '/blog' },
  { label: '상품', href: '/products' },
  { label: '포트폴리오', href: '/portfolio' },
];

type PopupLinkItem = { type: 'link'; label: string; href: string; icon: LucideIcon; external?: boolean };
type PopupActionItem = { type: 'action'; label: string; icon: LucideIcon; action: 'signOut' };
type PopupItem = PopupLinkItem | PopupActionItem;

const isLinkItem = (item: PopupItem): item is PopupLinkItem => item.type === 'link';
const isActionItem = (item: PopupItem): item is PopupActionItem => item.type === 'action';

const POPUP_ITEMS: PopupItem[] = [
  { type: 'link',   label: '설정',       href: '/settings', icon: Settings },
  { type: 'link',   label: '프로필 설정', href: '/profile',  icon: User     },
  { type: 'link',   label: 'API 문서',   href: '/api-docs', icon: BookOpen, external: true },
  { type: 'action', label: '로그아웃',   icon: LogOut,      action: 'signOut' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut, profile } = useAuth();
  const { isOpen, close } = useMobileMenu();
  const [popupOpen, setPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <aside
      className={`
        fixed inset-y-0 right-0 z-50 w-[260px]
        lg:relative lg:inset-auto lg:z-auto lg:sticky lg:top-3 lg:w-[220px] lg:h-[calc(100vh-1.5rem)]
        bg-white dark:bg-gray-800 shadow-sm flex flex-col p-4
        rounded-l-2xl lg:rounded-2xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}
    >
      {/* 모바일 전용 닫기 버튼 */}
      <div className="flex justify-end mb-3 lg:hidden">
        <button
          onClick={close}
          className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="메뉴 닫기"
        >
          <X size={18} />
        </button>
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ label, href, external }) => {
          const active = !external && (pathname === href || pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              onClick={close}
              {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
              className={`flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                  active ? 'bg-black dark:bg-white' : 'bg-transparent'
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* 하단 로고 버튼 + 팝업 */}
      <div ref={popupRef} className="relative border-t border-gray-100 dark:border-gray-700 pt-3 mt-2">
        {/* 팝업 메뉴 */}
        {popupOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="py-1">
              {POPUP_ITEMS.filter(isLinkItem).map((linkItem) => {
                const active = pathname === linkItem.href || pathname.startsWith(linkItem.href + '/');
                return (
                  <Link
                    key={linkItem.href}
                    href={linkItem.href}
                    onClick={() => { setPopupOpen(false); close(); }}
                    {...(linkItem.external && { target: '_blank', rel: 'noopener noreferrer' })}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                      active
                        ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <linkItem.icon size={14} />
                    <span className="flex-1">{linkItem.label}</span>
                    {linkItem.external && <ExternalLink size={12} className="text-gray-400 dark:text-gray-500 shrink-0" />}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 py-1">
              {POPUP_ITEMS.filter(isActionItem).map((actionItem) => {
                return (
                  <button
                    key={actionItem.action}
                    onClick={() => { setPopupOpen(false); signOut(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <actionItem.icon size={14} />
                    {actionItem.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 로고 버튼 */}
        <button
          onClick={() => setPopupOpen((v) => !v)}
          className="w-full flex items-center gap-3 px-1 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-black overflow-hidden flex items-center justify-center text-white font-bold text-sm shrink-0">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              <span>{profile?.full_name?.[0]?.toUpperCase() ?? ''}</span>
            )}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight truncate">{profile?.full_name ?? ''}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">ADMIN</p>
          </div>
          <ChevronUp
            size={14}
            className={`text-gray-400 dark:text-gray-500 transition-transform shrink-0 ${popupOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </aside>
  );
}
