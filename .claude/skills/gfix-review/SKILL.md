---
name: gfix-review
description: >
  This skill activates when the user asks to "review", "check", or "verify"
  code specifically for Next.js App Router patterns, Supabase RLS, Recoil,
  or Axios usage in this project. Focus: stack-specific anti-patterns (wrong
  supabase client, unnecessary 'use client', Recoil over-subscription, etc.).
  NOTE: For general code quality review (security, architecture, pull request
  review), use the code-review skill instead. This skill is complementary —
  not a replacement — for general code review.
version: 1.0.0
---

# GFix Review — 스택 특화 코드 리뷰

## 리뷰 체크리스트 (순서대로 확인)

### 1. GFix Craft 위반 여부

- [ ] 불필요한 새 npm 의존성이 추가되었는가?
- [ ] Supabase나 Next.js가 처리하는 기능을 직접 구현했는가?
- [ ] 기존 `lib/` 패턴을 무시하고 새 인스턴스를 생성했는가?
- [ ] 이미 존재하는 컴포넌트/훅을 중복 구현했는가?

### 2. Next.js App Router 패턴

- [ ] **Server vs Client 컴포넌트 구분**: 불필요한 `'use client'` 지시문이 있는가?
  - `useState`, `useEffect`, 이벤트 핸들러 → Client Component 필요
  - 데이터 페칭, DB 접근 → Server Component 권장
- [ ] **데이터 페칭 위치**: 클라이언트에서 불필요하게 fetch하는가? Server Component에서 처리 가능한가?
- [ ] **Link vs anchor**: `<a href>` 대신 `<Link href>` 사용하는가?
- [ ] **Image 최적화**: `<img>` 대신 `<Image>` (next/image) 사용하는가?
- [ ] **메타데이터**: `document.title` 직접 변경 대신 `metadata` export 사용하는가?

### 3. Supabase 패턴

- [ ] **클라이언트 선택**: 클라이언트 컴포넌트에서 `server.ts` 클라이언트를 잘못 사용하지 않는가?
  - 클라이언트 컴포넌트 → `createClient()` from `lib/supabase/client.ts`
  - 서버 컴포넌트 → `await createClient()` from `lib/supabase/server.ts`
- [ ] **RLS 의존**: 앱 코드에서 권한 체크 로직을 직접 구현하는 대신 RLS 정책에 위임하는가?
- [ ] **에러 처리**: Supabase 쿼리 결과의 `error` 객체를 처리하는가?
- [ ] **타입 안전성**: `Database` 제네릭 타입을 활용하는가?

### 4. Recoil 성능 (frontend/)

- [ ] **과도한 구독**: 컴포넌트가 필요 이상의 atom을 구독하지 않는가?
- [ ] **selector 활용**: 파생 상태를 `useRecoilValue(atom)`으로 직접 계산하지 않고 `selector`로 분리했는가?
- [ ] **atom 범위**: 전역 atom이 로컬 상태(useState로 충분한)를 대체하지 않는가?
- [ ] **초기화**: 로그아웃 시 auth 관련 atom이 초기화되는가?

### 5. Axios 패턴

- [ ] **인터셉터 활용**: 토큰 주입을 `lib/axios/interceptors.ts` 없이 수동으로 하지 않는가?
- [ ] **엔드포인트 관리**: API URL을 하드코딩하지 않고 `lib/axios/endpoints.ts`에 정의하는가?
- [ ] **새 인스턴스 생성**: `axios.create()` 를 새로 호출하지 않고 기존 인스턴스를 사용하는가?

### 6. 일반 품질

- [ ] **타입 안전성**: `any` 타입 사용이 없는가?
- [ ] **에러 경계**: try/catch 또는 `.catch()`로 에러를 처리하는가?
- [ ] **환경변수**: 하드코딩된 URL, API 키, 비밀 값이 없는가?
- [ ] **접근성**: 인터랙티브 요소에 `aria-*` 속성이 있는가?

## 출력 형식

```
파일: src/components/Profile.tsx

[GF-CRAFT] ✗ axios.create()를 새로 호출함 → lib/axios/instance.ts 재사용 권장
[NEXT]     ✗ 'use client' 불필요 — 이벤트 핸들러 없음, Server Component로 변경 가능
[SUPABASE] ✓ createClient 올바르게 사용
[RECOIL]   ✗ authAtom 전체 구독 → isAuthenticatedSelector 사용 권장

개선 필요: 3건 | 통과: 1건
```

## 판정 기준

```
APPROVED      — 개선 필요 0건, 또는 LOW 우선순위만 있는 경우
NEEDS REVISION — HIGH/CRITICAL 우선순위 이슈가 1건 이상인 경우
```

> 일반 코드 품질 리뷰(보안, 아키텍처, PR 리뷰)는 `/code-review` 커맨드를 사용한다.
