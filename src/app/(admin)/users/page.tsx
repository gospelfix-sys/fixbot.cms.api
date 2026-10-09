import EmptyState from '@/components/admin/EmptyState';
import UsersTable from './UsersTable';

const MOCK_USERS = [
  { id: 'e4962578', email: 'admin@example.com', role: '관리자' as const, joinedAt: '2026. 6. 12.' },
  { id: '1ec4f449', email: 'user1@example.com', role: '일반' as const, joinedAt: '2026. 7. 16.' },
  { id: '6109638e', email: 'user2@example.com', role: '일반' as const, joinedAt: '2026. 6. 12.' },
];

export default async function UsersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">유저 관리</h1>
          <p className="text-sm text-gray-400 mt-0.5">총 {MOCK_USERS.length}명</p>
        </div>
      </div>
      {MOCK_USERS.length === 0 ? (
        <EmptyState message="등록된 유저가 없습니다" />
      ) : (
        <UsersTable users={MOCK_USERS} />
      )}
    </div>
  );
}
