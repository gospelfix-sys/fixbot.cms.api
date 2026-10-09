# service.supabase.v2 PRD

> **한 줄 요약**: Supabase 인증(이메일 + Google/Kakao OAuth) 기반의 Next.js 14 관리자(admin) 앱
> **작성일**: 2026-04-22 | **최종 갱신**: 2026-07-17 | **상태**: 인증 완료 · 관리 기능 정의 대기

---

## 1. 문제 정의

**해결하는 문제**

새 프로젝트에서 관리자 대시보드를 만들 때마다 인증(이메일/비밀번호/OAuth) 흐름, 세션 갱신, 라우트 보호, Supabase 연동을 처음부터 반복 구현해야 하는 비효율이 발생한다. 이 프로젝트는 Supabase 기반의 관리자 인증이 이미 세팅된 스캐폴드로, 비즈니스 관리 기능만 얹으면 되는 상태를 목표로 한다.

**성공 지표**

- 관리자 로그인·회원가입·소셜 로그인·세션 유지가 별도 구현 없이 동작
- 새 관리 화면 추가 시 인증/라우트 보호 코드를 다시 작성할 필요 없음

---

## 2. 사용자

**주요 사용자**

- **관리자**: 이메일/비밀번호 또는 Google/Kakao 계정으로 로그인 → 관리자 홈(`/`)에서 향후 관리 기능 사용

**핵심 사용 시나리오**

1. 관리자가 `/sign/up`에서 이메일로 회원가입 → 확인 메일 수신 → 이메일 링크 클릭 → `/auth/callback` 세션 교환 → 홈(`/`) 진입
2. 관리자가 `/sign/in`에서 이메일/비밀번호로 로그인 또는 Google/Kakao OAuth로 로그인 → 홈(`/`) 진입
3. 로그인 상태에서 `/sign/in`, `/sign/up` 접근 시 자동으로 홈(`/`)으로 리다이렉트
4. 비로그인 상태에서 보호 경로 접근 시 `/sign/in`으로 리다이렉트

---

## 3. 핵심 기능 (MVP)

### 이메일/비밀번호 인증 -- 완료

- **설명**: Supabase Auth의 이메일/비밀번호 기반 회원가입·로그인
- **동작**:
  - `/sign/up`에서 `signUp()` 호출 → 확인 이메일 발송 (`emailRedirectTo: /auth/callback`)
  - `/sign/in`에서 `signInWithPassword()` 호출 → 성공 시 `/` 이동
  - 에러 메시지는 폼 하단에 인라인 표시
- **완료 기준**: 회원가입 → 확인 메일 클릭 → 로그인 → 홈 접근 흐름 성공 ✅

### OAuth 소셜 로그인 (Google · Kakao) -- 완료

- **설명**: Supabase Auth의 OAuth 위임 로그인
- **동작**:
  - `/sign/in`의 소셜 버튼 → `signInWithOAuth({ provider, redirectTo: /auth/callback })`
  - `/auth/callback` 라우트에서 `exchangeCodeForSession(code)` → 성공 시 `next` 파라미터 또는 `/`로 이동
  - 실패 시 `?error=` 파라미터와 함께 `/sign/in`으로 리다이렉트
- **완료 기준**: Google·Kakao 버튼 클릭 → 각 OAuth 화면 → 콜백 성공 → 홈 접근 ✅ (Supabase 대시보드에서 각 provider 활성화 필요)

### 세션 갱신 + 라우트 보호 -- 완료

- **설명**: 모든 요청에서 세션을 자동 갱신하고 보호 경로 접근을 제어
- **동작**:
  - 루트 `middleware.ts`가 모든 경로에 대해 `updateSession()` 호출
  - `src/libs/supabase/middleware.ts`의 `updateSession()`이 요청/응답 쿠키를 동기화하며 `getUser()`로 세션 확인
  - `PUBLIC_PATHS = ['/sign/in', '/sign/up', '/auth/callback']` 외 경로는 비인증 시 `/sign/in` 리다이렉트
  - 로그인 상태에서 `/sign/in`, `/sign/up` 접근 시 홈으로 리다이렉트
  - 매처: `_next/static`, `_next/image`, `favicon.ico` 제외 전체
- **완료 기준**: 리다이렉트 4가지 케이스가 모두 정상 동작 ✅

### 프로필 관리 (스키마만 정의) -- Supabase 대시보드 설정 필요

- **설명**: 회원가입 시 `profiles` 테이블에 자동으로 프로필 레코드 생성 및 역할 부여
- **동작**:
  - `handle_new_user()` DB 트리거로 `auth.users` INSERT 시 `profiles` 행 자동 생성
  - `role` 필드: `user` (기본) / `admin` — 관리자 앱이므로 최초 등록 계정의 role을 수동으로 `admin`으로 승격 필요
- **완료 기준**: 회원가입 후 `profiles` 테이블에 해당 레코드 자동 생성 확인 (README의 SQL을 Supabase SQL Editor에서 실행)

> ⚠️ **MVP 제외 항목 (향후 결정)**
>
> - 관리 대상 컨텐츠 정의 (지금은 홈에 이메일만 표시하는 스켈레톤)
> - 사용자 목록·역할 변경 등 관리자 UI
> - 프로필 편집 (이름, 아바타)
> - 비밀번호 재설정
> - RLS 정책 세밀화

---

## 4. 기술 명세

**기술 스택**

| 항목 | 사용 |
| --- | --- |
| 프레임워크 | Next.js 14.2.3 (App Router) |
| 인증 | `@supabase/ssr` 0.5.x + `@supabase/supabase-js` 2.45.x |
| 데이터 패칭 (계획) | `@tanstack/react-query` 5.x — 의존성 설치됨, 아직 미사용 |
| HTTP 클라이언트 (계획) | `axios` 1.7.x — 의존성 설치됨, 아직 미사용 |
| 검증 (계획) | `zod` 3.22.x — 의존성 설치됨, 아직 미사용 |
| 스타일 | 현재는 인라인 스타일 (`style={{ ... }}`) — 스타일 시스템 미결정 |
| 개발 포트 | 3001 |

> Tailwind CSS · shadcn/ui · Recoil · React Hook Form은 **도입하지 않았음**. 필요 시 [.claude/GOSPELFIX.md](../.claude/GOSPELFIX.md)의 결정 사다리(2~5단계) 통과 후 추가.

**주요 데이터 모델**

```sql
-- profiles 테이블
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

`handle_new_user()` 트리거 및 상세 SQL은 [README.md](../README.md#supabase-스키마-설정) 참고.

**주요 파일 구조**

```
api.gospelfix/
├── middleware.ts                    # 루트 라우트 보호 (PUBLIC_PATHS 정의)
├── next.config.mjs
├── package.json
├── tsconfig.json
├── vercel.json
├── docs/
│   ├── PRD.md
│   └── ROADMAP.md
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                 # 보호 홈 (비인증 시 /sign/in)
    │   ├── globals.css
    │   ├── sign/
    │   │   ├── in/page.tsx          # 이메일 + Google + Kakao 로그인
    │   │   └── up/page.tsx          # 이메일 회원가입 (확인 메일)
    │   └── auth/callback/route.ts   # OAuth · 이메일 확인 콜백
    └── libs/
        └── supabase/
            ├── client.ts            # 브라우저 컴포넌트용
            ├── server.ts            # 서버 컴포넌트/라우트용
            └── middleware.ts        # updateSession() — 세션 자동 갱신
```

**환경변수** (`.env.example` 참고)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...   # 서버 전용

GOOGLE_OAUTH_ID=
GOOGLE_OAUTH_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
```

---

## 5. 화면 흐름

```
/ (홈, 보호)
  ├── 비인증 → /sign/in
  │     ├── 이메일 로그인 성공 → /
  │     ├── Google/Kakao OAuth → /auth/callback → /
  │     └── 회원가입 링크 → /sign/up
  │           └── 가입 성공 → "확인 이메일 발송" 안내
  │                 └── 이메일 링크 클릭 → /auth/callback → /
  └── 인증
        └── /sign/in, /sign/up 접근 시 → / 리다이렉트
```

---

## 6. 개발 태스크 (체크리스트)

**Phase 1 - 인증 인프라 -- 완료**

- [x] Next.js 14 프로젝트 초기 세팅 (App Router, TypeScript)
- [x] Supabase SSR 클라이언트 3종 (client/server/middleware) 구현
- [x] 루트 미들웨어 + `PUBLIC_PATHS` 라우트 보호
- [x] 이메일/비밀번호 로그인·회원가입 페이지
- [x] Google/Kakao OAuth 로그인 + 콜백 라우트
- [x] `.env.example` 및 README 스키마 SQL

**Phase 2 - 관리 대상 정의 -- 미정**

- [ ] 관리자가 무엇을 관리할지 결정 (예: 사용자 목록 / 갤러리 컨텐츠 / 게시글 등)
- [ ] 관리 대상 스키마 설계 (Supabase 테이블 + RLS 정책)
- [ ] 스타일 시스템 결정 (Tailwind 도입 여부 등)
- [ ] 데이터 패칭 패턴 확립 (react-query 실사용 시작)

**Phase 3 - 관리 UI -- 대기**

- [ ] 관리 대상별 목록/상세/편집/삭제 화면
- [ ] 프로필 편집 (이름, 아바타)
- [ ] 사용자 목록 (`role='admin'`만 접근)
- [ ] 사용자 역할 변경 (user ↔ admin)

**Phase 4 - 안정화 -- 대기**

- [ ] `profiles` RLS 정책 (본인 데이터만 수정 / 관리자만 전체 조회)
- [ ] 에러 처리 통합 (toast 등)
- [ ] 비밀번호 재설정 플로우

---

## 7. 리스크 & 결정 필요 사항

- **관리 대상 미정 (최우선)**: 현재 홈이 "GospelFix Admin — 안녕하세요, {email}" 텍스트만 출력. 이 앱이 무엇을 관리할지 정의되지 않으면 Phase 2 진행 불가
- **스타일 시스템 미결정**: 인라인 스타일로 유지하기엔 확장성 부족. Tailwind vs CSS Modules vs vanilla-extract 등 도입 시점 결정 필요
- **최초 관리자 승격 방법**: 회원가입한 첫 계정을 `admin`으로 만드는 절차 미정 (Supabase 대시보드 수동 UPDATE vs 시드 스크립트)
- **RLS 미적용**: `profiles` 테이블에 RLS 정책이 없어 클라이언트에서 임의 조회 가능. Phase 4에서 정책 필수
- **의존성 미사용**: `axios`, `zod`, `@tanstack/react-query`가 설치돼 있으나 아직 코드에서 쓰이지 않음. 실사용 시점까지 삭제 여부 검토 (GFix 결정 사다리 1단계 "NEED")
- **OAuth Provider 활성화**: Google·Kakao 로그인 코드는 있으나 실제 동작하려면 Supabase 대시보드 → Authentication → Providers 에서 각 Provider의 Client ID/Secret 등록 및 활성화 필요
