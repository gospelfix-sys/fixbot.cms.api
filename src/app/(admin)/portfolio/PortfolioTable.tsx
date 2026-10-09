'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GripVertical, MoreVertical, Pencil, Trash2, ExternalLink, Copy } from 'lucide-react';
import { deletePortfolioAction, updatePortfoliosSortOrderAction, duplicatePortfolioAction } from './actions';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import type { Portfolio } from '@/types/portfolio';

export default function PortfolioTable({ portfolios }: { portfolios: Portfolio[] }) {
  const router = useRouter();
  const [items, setItems] = useState(portfolios);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const rowRefMap = useRef<Map<string, HTMLElement>>(new Map());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    setItems(portfolios);
  }, [portfolios]);

  const handleDragStart = (index: number, id: string) => {
    dragIndex.current = index;
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    const next = [...items];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(index, 0, moved);
    dragIndex.current = index;
    setItems(next);
  };

  const handleDrop = async () => {
    setDraggingId(null);
    dragIndex.current = null;
    try {
      await updatePortfoliosSortOrderAction(
        items.map((p, i) => ({ id: p.id, sort_order: i + 1 })),
      );
    } catch {
      setAlertMessage('순서 저장에 실패했습니다.');
      setItems(portfolios);
    }
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    rowRefMap.current.forEach((el) => el.removeAttribute('draggable'));
    dragIndex.current = null;
  };

  const handleDuplicate = async (id: string) => {
    setMenuOpenId(null);
    setDuplicating(id);
    try {
      await duplicatePortfolioAction(id);
      router.refresh();
    } catch {
      setAlertMessage('복사에 실패했습니다.');
    } finally {
      setDuplicating(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setMenuOpenId(null);
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    setConfirmOpen(false);
    setDeleting(pendingDeleteId);
    try {
      await deletePortfolioAction(pendingDeleteId);
      router.refresh();
    } catch {
      setAlertMessage('삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
      setPendingDeleteId(null);
    }
  };

  return (
    <>
      {menuOpenId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpenId(null)}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700">
        {items.map((portfolio, index) => (
          <div
            key={portfolio.id}
            ref={(el) => { if (el) rowRefMap.current.set(portfolio.id, el); }}
            onDragStart={() => handleDragStart(index, portfolio.id)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
              draggingId === portfolio.id ? 'opacity-40' : ''
            }`}
          >
            <GripVertical
              size={16}
              className="text-gray-300 dark:text-gray-600 cursor-grab active:cursor-grabbing shrink-0"
              onMouseDown={() => rowRefMap.current.get(portfolio.id)?.setAttribute('draggable', 'true')}
              onMouseUp={() => rowRefMap.current.get(portfolio.id)?.removeAttribute('draggable')}
            />

            {portfolio.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portfolio.thumbnail_url}
                alt={portfolio.title}
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide text-sm truncate">
                  {portfolio.title}
                </p>
                {portfolio.is_published && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium shrink-0">
                    발행
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {[portfolio.category, new Date(portfolio.created_at).toLocaleDateString('ko-KR')]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>

            <div className="relative shrink-0 z-50">
              <button
                onClick={() => setMenuOpenId(menuOpenId === portfolio.id ? null : portfolio.id)}
                className="p-1.5 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpenId === portfolio.id && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 py-1">
                  <Link
                    href={`/portfolio/${portfolio.id}/edit`}
                    onClick={() => setMenuOpenId(null)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Pencil size={14} className="text-gray-400 shrink-0" />
                    상세 편집
                  </Link>
                  <button
                    onClick={() => {
                      if (portfolio.site_url) window.open(portfolio.site_url, '_blank');
                      setMenuOpenId(null);
                    }}
                    disabled={!portfolio.site_url}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ExternalLink size={14} className="text-gray-400 shrink-0" />
                    새 탭에서 열기
                  </button>
                  <button
                    onClick={() => handleDuplicate(portfolio.id)}
                    disabled={duplicating !== null}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Copy size={14} className="text-gray-400 shrink-0" />
                    복사
                  </button>
                  <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                  <button
                    onClick={() => handleDeleteClick(portfolio.id)}
                    disabled={deleting !== null}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={14} className="shrink-0" />
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
      />
      <AlertDialog
        open={alertMessage !== null}
        message={alertMessage ?? ''}
        onConfirm={() => setAlertMessage(null)}
      />
    </>
  );
}
