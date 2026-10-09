'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GripVertical, MoreVertical, Pencil, Trash2, ExternalLink, Copy } from 'lucide-react';
import { deleteProductAction, updateProductsSortOrderAction, duplicateProductAction } from './actions';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import type { Product } from '@/types/product';

const STATUS_CLASS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

const PRICE_TYPE_CLASS: Record<string, string> = {
  free: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  paid: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
};

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

export default function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [items, setItems] = useState(products);
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
    setItems(products);
  }, [products]);

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
      await updateProductsSortOrderAction(
        items.map((p, i) => ({ id: p.id, sort_order: i + 1 })),
      );
    } catch {
      setAlertMessage('순서 저장에 실패했습니다.');
      setItems(products);
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
      await duplicateProductAction(id);
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
      await deleteProductAction(pendingDeleteId);
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

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="px-2 py-3 w-8" />
              <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">상품명</th>
              <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium w-16">유형</th>
              <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium w-28 hidden sm:table-cell">가격</th>
              <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium w-20">상태</th>
              <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium w-32 hidden sm:table-cell">등록일</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {items.map((product, index) => (
              <tr
                key={product.id}
                ref={(el) => { if (el) rowRefMap.current.set(product.id, el); }}
                onDragStart={() => handleDragStart(index, product.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-750 ${
                  draggingId === product.id ? 'opacity-40' : ''
                }`}
              >
                <td className="pl-3 pr-1 py-3">
                  <GripVertical
                    size={16}
                    className="text-gray-300 dark:text-gray-600 cursor-grab active:cursor-grabbing"
                    onMouseDown={() => rowRefMap.current.get(product.id)?.setAttribute('draggable', 'true')}
                    onMouseUp={() => rowRefMap.current.get(product.id)?.removeAttribute('draggable')}
                  />
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">{product.name}</p>
                    {product.category && (
                      <span className="text-xs text-gray-400">{product.category}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRICE_TYPE_CLASS[product.price_type]}`}>
                    {product.price_type === 'free' ? 'FREE' : '유료'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                  {product.price_type === 'free' ? '—' : formatPrice(product.base_price)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[product.status]}`}>
                    {product.status === 'active' ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                  {new Date(product.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-4 py-3">
                  <div className="relative flex justify-end z-50">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === product.id ? null : product.id)}
                      className="p-1.5 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {menuOpenId === product.id && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 py-1">
                        <Link
                          href={`/products/${product.id}/edit`}
                          onClick={() => setMenuOpenId(null)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Pencil size={14} className="text-gray-400 shrink-0" />
                          상세 편집
                        </Link>
                        <button
                          onClick={() => {
                            if (product.demo_url) window.open(product.demo_url, '_blank');
                            setMenuOpenId(null);
                          }}
                          disabled={!product.demo_url}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ExternalLink size={14} className="text-gray-400 shrink-0" />
                          새 탭에서 열기
                        </button>
                        <button
                          onClick={() => handleDuplicate(product.id)}
                          disabled={duplicating !== null}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Copy size={14} className="text-gray-400 shrink-0" />
                          복사
                        </button>
                        <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                        <button
                          onClick={() => handleDeleteClick(product.id)}
                          disabled={deleting !== null}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={14} className="shrink-0" />
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
