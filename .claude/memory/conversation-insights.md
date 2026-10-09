---
name: 주요 구현 인사이트
description: isMock 패턴, Recoil+Client Component 번들링 함정, 반응형 사이드바, 다크 모드 규칙, 메인 컬러, 미들웨어 라우팅, Recoil atom으로 전역 UI 동기화
type: project
---

# 주요 구현 인사이트

## 목(Mock) 인증 isMock 패턴

`AuthProvider`가 개발 환경에서 `profile.id = 'mock-user-id'`(하드코딩 문자열, 실제 UUID 아님)를 설정한다. 이 ID에 해당하는 Supabase `profiles` 테이블 row가 없으므로 DB 업데이트가 실패하거나 RLS에 차단된다.

**해결 패턴**: Supabase 호출 전에 mock 여부를 확인하고 건너뛴다.

```ts
const isMock = profile.id === 'mock-user-id';
if (!isMock) await updateProfile(profile.id, result.data.full_name);
// 항상 Recoil atom은 업데이트 (UI 반영)
setUserProfile((prev) => prev ? { ...prev, full_name: result.data.full_name } : prev);
```

**예외 — isMock 체크 불필요한 경우**: Server Action + `admin.ts`(service_role key) 조합은 RLS를 우회하므로 mock 여부와 무관하게 동작한다. blog CMS 쓰기 작업(`createPost`, `updatePost`, `deletePost`)이 이에 해당한다. Client Component에서 anon key로 직접 Supabase를 호출하는 경우에만 isMock 체크가 필요하다.

실제 Supabase 인증이 연결되면 조건이 자동으로 false가 되어 DB 업데이트가 실행된다.

---

## Recoil + Client Component 번들링 함정

**증상**: `RecoilRoot` 상위에 있어야 할 컴포넌트가 Recoil을 찾지 못해 런타임 오류 발생.

**원인**: Client Component(AdminShell)가 Recoil을 사용하는 다른 Client Component(Sidebar)를 직접 import하면, Next.js가 두 컴포넌트를 같은 번들로 묶어 RecoilRoot 위에 있는 것처럼 실행한다.

**해결**: AdminShell은 Sidebar를 import하지 않는다. Sidebar는 Server Component(AdminLayout)에서 렌더링하고, 모바일 드로어 상태는 `MobileMenuContext`(React Context)를 통해 공유한다.

```tsx
// src/components/admin/MobileMenuContext.tsx — Context로 상태 공유
// src/app/(admin)/layout.tsx — Server Component에서 Sidebar 직접 렌더링
// src/components/admin/AdminShell/index.tsx — Sidebar import 없음
```

---

## 반응형 사이드바 패턴 (모바일 드로어 + PC 고정)

```tsx
// Sidebar aside className
`fixed inset-y-0 right-0 z-50 w-[260px]             // 모바일: 오른쪽 고정 오버레이
 lg:relative lg:inset-auto lg:z-auto lg:sticky       // PC: 일반 흐름 + sticky
 lg:top-3 lg:w-[220px] lg:h-[calc(100vh-1.5rem)]    // PC: 뷰포트 높이 채움
 transition-transform duration-300 ease-in-out
 ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`
```

- 모바일: `translate-x-full`(숨김) ↔ `translate-x-0`(표시) 슬라이드
- PC: `lg:translate-x-0`으로 항상 표시, `sticky`로 스크롤 시 유지
- `lg:h-[calc(100vh-1.5rem)]`: PC에서 뷰포트 전체 높이 (레이아웃 padding 3 = 1.5rem 제외)

---

## 프로필 페이지 레이아웃 패턴

3-카드 구조로 구성:
1. **아바타 카드**: 클릭 시 숨겨진 `<input type="file">` 트리거, `FileReader`로 dataURL 로컬 프리뷰, Minus 버튼으로 초기화
2. **입력 필드 카드**: `full_name`(편집 가능), `email`(disabled)
3. **업로드 행 + 저장 버튼 카드**: 썸네일 + 불러오기/삭제 버튼 + 변경사항 저장 버튼

아바타 실제 Storage 업로드는 미구현(향후 Supabase Storage 연결 후 추가 예정), 현재는 `full_name`만 DB에 저장.

---

## 다크 모드 구현 규칙

Tailwind v4 + `next-themes` 조합에서 다크 모드가 동작하려면 하드코딩된 팔레트 클래스마다 `dark:` 변형을 명시해야 한다.

**필수 매핑 패턴:**
```
bg-white          → dark:bg-gray-800
bg-gray-100       → dark:bg-gray-700
bg-gray-50        → dark:bg-gray-700
border-gray-100   → dark:border-gray-700
border-gray-200   → dark:border-gray-700
text-gray-900     → dark:text-gray-100
text-gray-700     → dark:text-gray-300
text-gray-400     → dark:text-gray-500
```

**`input` 요소 주의**: `border`만 바꾸면 내부 배경이 브라우저 기본 흰색으로 남는다. `dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500`을 모두 명시해야 한다.

**`next-themes` hydration 패턴**: `theme` 값은 SSR에서 `undefined`다. 반드시 `mounted` 상태로 guard해야 active 표시 버그가 없다.
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);
// 사용: mounted && theme === value
```

---

## 메인 컬러 토큰 (현재: 검정)

초기에 orange 계열이었으나 #000(블랙)으로 변경됨.

| 역할 | 클래스 |
|------|--------|
| 주요 버튼 배경 | `bg-black` |
| 버튼 hover | `hover:bg-gray-800` |
| 버튼 disabled | `disabled:bg-gray-400` |
| input focus 테두리 | `focus:border-black` |
| nav active 배경 (라이트) | `bg-gray-100` |
| nav active 배경 (다크) | `dark:bg-white/10` |
| nav active 텍스트 (다크) | `dark:text-white` |
| nav 점 인디케이터 | `bg-black dark:bg-white` |
| 로고 원형 | `bg-black` |

---

## Recoil atom으로 전역 UI 동기화 패턴

프로필 이미지처럼 여러 컴포넌트(Sidebar, AdminShell 헤더)에 동시에 반영해야 하는 값은 `userProfileAtom`에 저장하면 모든 `useAuth()` 구독자가 자동 리렌더된다.

```tsx
// profile/page.tsx — 저장 시 avatar_url도 atom에 반영
setUserProfile((prev) =>
  prev ? { ...prev, full_name, avatar_url: avatarPreview } : prev,
);

// Sidebar, AdminShell — profile?.avatar_url로 읽기
const { profile } = useAuth();
{profile?.avatar_url ? <img src={profile.avatar_url} .../> : <span>G</span>}
```

dataURL(로컬 프리뷰)을 atom에 저장하는 방식이므로 페이지 새로고침 시 초기화된다. Supabase Storage 업로드 후 실제 URL로 교체 예정.

---

## Server Component + Client Component 분리 패턴 (blog CMS 기준)

페이지 파일은 Server Component로 유지하고, 인터랙션이 필요한 부분만 Client Component로 분리한다.

```
page.tsx (async Server Component)  → DB 직접 조회 (queries/ 레이어 import)
  └── XxxTable.tsx ('use client')  → 삭제 버튼 클릭, Server Action 호출 후 router.refresh()
  └── XxxForm.tsx  ('use client')  → 폼 제출, Server Action 호출 후 router.push()
```

- **삭제 후 목록 갱신**: `router.refresh()` — Server Component를 재실행해 최신 DB 데이터 반영
- **삭제 중 다중 클릭 방지**: `useState<string | null>(null)`로 deleting ID 추적, `disabled={deleting !== null}`

---

## 사이드바 외부 링크 패턴

`NAV_ITEMS` 배열에 `external: true`를 추가하면 해당 항목만 새 탭으로 열린다.

```ts
const NAV_ITEMS = [
  { label: 'API 문서', href: '/api-docs', external: true },
];

// 렌더링
{...(external && { target: '_blank', rel: 'noopener noreferrer' })}
```

`external` 항목은 `active` 하이라이트 체크에서도 자동 제외된다(`!external &&` 조건).

---

## Next.js 미들웨어 인증 라우팅

`src/middleware.ts`에서 `mock-auth` 쿠키를 읽어 라우팅을 제어한다.

```ts
export const config = {
  matcher: ['/', '/sign/in'], // 필요한 경로만 명시해 정적 파일 실행 방지
};
```

| 경로 | 상태 | 결과 |
|------|------|------|
| `/` | 로그인 O | `/users` 리다이렉트 |
| `/` | 로그인 X | `/sign/in` 리다이렉트 |
| `/sign/in` | 로그인 O | `/users` 리다이렉트 |

(admin) 라우트 그룹의 `layout.tsx`도 서버 사이드에서 cookie를 체크하므로 이중 보호된다.
