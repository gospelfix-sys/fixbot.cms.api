'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toggleApiConfigAction } from '@/app/(admin)/settings/actions';
import type { ContentApiConfig } from '@/libs/supabase/queries/content-api-configs';

const SLUG_META: Record<string, { label: string; page: string }> = {
  blog:      { label: '블로그 API',      page: '/blog'      },
  products:  { label: '상품 API',        page: '/products'  },
  portfolio: { label: '포트폴리오 API',  page: '/portfolio' },
  orders:    { label: '주문 API',        page: '/orders'    },
  quotes:    { label: '견적 신청 API',   page: '/quotes'    },
  users:     { label: '유저 API',        page: '/users'     },
};

interface ApiConfigCardProps {
  config: ContentApiConfig;
}

export default function ApiConfigCard({ config }: ApiConfigCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  useEffect(() => {
    setOptimistic(null);
  }, [config.is_enabled]);

  const isEnabled = optimistic ?? config.is_enabled;
  const meta = SLUG_META[config.resource_slug] ?? {
    label: `${config.label} API`,
    page: `/${config.resource_slug}`,
  };
  const { label, page } = meta;

  const handleToggle = () => {
    const next = !isEnabled;
    setOptimistic(next);
    startTransition(async () => {
      await toggleApiConfigAction(config.id, next);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{label}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-400 dark:text-gray-500">{page} 페이지</span>
            <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
            <code className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              GET /api/v1/{config.resource_slug}
            </code>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={`${label} ${isEnabled ? '비활성화' : '활성화'}`}
        className="ml-4 flex-shrink-0 flex items-center gap-2 disabled:opacity-50"
      >
        <span className={`text-xs font-medium ${isEnabled ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
          {isEnabled ? 'ON' : 'OFF'}
        </span>
        <div
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            isEnabled ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white dark:bg-black shadow transform transition-transform ${
              isEnabled ? 'translate-x-[23px]' : 'translate-x-[3px]'
            }`}
          />
        </div>
      </button>
    </div>
  );
}
