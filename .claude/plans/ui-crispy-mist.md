# 프로필 편집 페이지 구현 계획

## Context

관리자가 자신의 프로필(이름, 아바타 이미지)을 편집할 수 있는 페이지가 필요하다.
레퍼런스 이미지(블로그 설정 UI)를 기반으로, 어드민 패널 디자인 언어(orange accent, rounded-xl card, shadow-sm)에 맞게 구현한다.

현재 `UserProfile` 인터페이스에서 편집 가능한 필드:
- `full_name: string | null` → 이름
- `avatar_url: string | null` → 프로필 이미지 (로컬 프리뷰만, 실제 업로드는 향후)
- `email: string` → 이메일 (읽기 전용)

---

## 변경 파일 목록

### 1. `src/app/(admin)/profile/page.tsx` ← 신규 생성

**레이아웃 구조 (레퍼런스 이미지 기반):**

```
[프로필 설정]              ← 페이지 제목 (h1)

┌─────────────────────────┐
│    [아바타 이미지]        │  ← 클릭 시 파일 선택. "-" 버튼으로 초기화
└─────────────────────────┘

┌─────────────────────────┐
│ 이름                     │
│ [input: full_name]      │
│                         │
│ 이메일                   │
│ [input: email, disabled] │
└─────────────────────────┘

┌─────────────────────────┐
│ [썸네일] 프로필 이미지     │  [불러오기] [삭제]
│         JPG, PNG, GIF   │
│                   [변경사항 저장]  │
└─────────────────────────┘
```

**핵심 구현 코드:**

```tsx
'use client';

import { useState, useRef } from 'react';
import { useSetRecoilState } from 'recoil';
import { toast } from 'sonner';
import { Minus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/libs/supabase/client';
import { userProfileAtom } from '@/store/atoms/userAtom';

// Zod schema
const schema = z.object({
  full_name: z.string().min(1, '이름을 입력해주세요').max(50),
});

// Avatar state: avatarPreview(string|null) — dataURL 로컬 프리뷰
// fileInputRef → hidden <input type="file" accept="image/*">
// 클릭 시 ref.current.click() 트리거

// 저장 시:
// 1. supabase.from('profiles').update({ full_name }).eq('id', profile.id)
// 2. setUserProfile 갱신
// 3. toast.success('프로필이 저장되었습니다')
```

**아바타 이미지 처리:**
- 현재 스캐폴드 단계 → `FileReader`로 `dataURL` 로컬 프리뷰만 제공
- `avatar_url` DB 저장은 Supabase Storage 연결 후 별도 구현 예정
- 현재는 `full_name`만 실제 DB에 저장

---

### 2. `src/components/admin/Sidebar/index.tsx` ← 수정

`NAV_ITEMS`에 프로필 항목 추가:

```tsx
const NAV_ITEMS = [
  { label: '유저', href: '/users' },
  { label: '주문 관리', href: '/orders' },
  { label: '견적 신청', href: '/quotes' },
  { label: '소식 (Blog)', href: '/blog' },
  { label: '상품', href: '/products' },
  { label: '포트폴리오', href: '/portfolio' },
  { label: '프로필 설정', href: '/profile' },   // ← 추가
];
```

---

## 디자인 토큰 (기존 패턴 유지)

| 요소 | 클래스 |
|------|--------|
| 카드 | `bg-white rounded-xl shadow-sm p-6` |
| 입력창 | `w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-400 transition-colors` |
| 아웃라인 버튼 | `border border-gray-200 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors` |
| 저장 버튼 | `bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors` |
| 아바타 컨테이너 | `relative w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] mx-auto rounded-xl bg-gray-100 overflow-hidden` |
| 섹션 간격 | `flex flex-col gap-4` |

---

## 재사용 파일

| 파일 | 용도 |
|------|------|
| `src/hooks/useAuth.ts` | `profile`, `user` 접근 |
| `src/store/atoms/userAtom.ts` | `userProfileAtom` — 저장 후 갱신 |
| `src/libs/supabase/client.ts` | `createClient()` — profiles 업데이트 |
| `src/libs/utils.ts` | `cn()` — className 병합 |

---

## 검증 방법

1. `yarn dev` → `/profile` 접속
2. 이름 필드 변경 후 "변경사항 저장" 클릭 → 토스트 성공 메시지 확인
3. Supabase 대시보드 `profiles` 테이블에서 `full_name` 업데이트 확인
4. 아바타 영역 클릭 → 파일 선택 → 프리뷰 표시 확인
5. "-" 버튼 → 아바타 회색 플레이스홀더로 복귀 확인
6. "삭제" 버튼(업로드 행) → 동일하게 초기화 확인
7. 이메일 필드가 수정 불가(disabled)인지 확인
8. 사이드바에 "프로필 설정" 항목이 표시되고 클릭 시 이동 확인
9. 모바일(375px) 레이아웃 깨짐 없는지 확인
