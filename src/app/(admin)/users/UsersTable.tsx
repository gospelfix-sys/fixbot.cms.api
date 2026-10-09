'use client';

import { useState, useRef } from 'react';
import { GripVertical, MoreVertical, Trash2 } from 'lucide-react';

type UserRow = {
  id: string;
  email: string;
  role: '일반' | '관리자';
  joinedAt: string;
};

export default function UsersTable({ users }: { users: UserRow[] }) {
  const [items, setItems] = useState(users);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const rowRefMap = useRef<Map<string, HTMLElement>>(new Map());
  const dragIndex = useRef<number | null>(null);

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

  const handleDrop = () => {
    setDraggingId(null);
    dragIndex.current = null;
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    rowRefMap.current.forEach((el) => el.removeAttribute('draggable'));
    dragIndex.current = null;
  };

  return (
    <>
      {menuOpenId && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)} />
      )}

      <div className="flex flex-col gap-2">
        {items.map((user, index) => (
          <div
            key={user.id}
            ref={(el) => { if (el) rowRefMap.current.set(user.id, el); }}
            onDragStart={() => handleDragStart(index, user.id)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            className={`bg-white dark:bg-gray-800 rounded-xl px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3 shadow-sm transition-opacity ${
              draggingId === user.id ? 'opacity-40' : ''
            }`}
          >
            <GripVertical
              size={16}
              className="text-gray-300 dark:text-gray-600 cursor-grab active:cursor-grabbing shrink-0"
              onMouseDown={() => rowRefMap.current.get(user.id)?.setAttribute('draggable', 'true')}
              onMouseUp={() => rowRefMap.current.get(user.id)?.removeAttribute('draggable')}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.email}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
                    user.role === '관리자'
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                {user.id}...&nbsp;&nbsp;{user.joinedAt} 가입
              </p>
            </div>

            <div className="relative shrink-0 z-50">
              <button
                onClick={() => setMenuOpenId(menuOpenId === user.id ? null : user.id)}
                className={`p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  menuOpenId === user.id ? 'border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm' : ''
                }`}
              >
                <MoreVertical size={16} />
              </button>
              {menuOpenId === user.id && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[100px] z-50">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left">
                    <Trash2 size={14} />
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
