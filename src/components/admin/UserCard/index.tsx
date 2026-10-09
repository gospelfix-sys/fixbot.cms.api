'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';

type UserRow = {
  id: string;
  email: string;
  role: '일반' | '관리자';
  joinedAt: string;
};

export default function UserCard({ user }: { user: UserRow }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="bg-white rounded-xl px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shadow-sm gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-medium text-gray-900 truncate">{user.email}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
              user.role === '관리자'
                ? 'bg-green-50 text-green-600 border-green-200'
                : 'bg-white text-gray-500 border-gray-300'
            }`}
          >
            {user.role}
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate">
          {user.id}...&nbsp;&nbsp;{user.joinedAt} 가입
        </p>
      </div>

      <div className="relative shrink-0" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className={`p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors ${
            open ? 'border border-gray-200 bg-white shadow-sm' : ''
          }`}
        >
          <MoreVertical size={16} />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[100px] z-10">
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-50 w-full text-left">
              <Trash2 size={14} />
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
