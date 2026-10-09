---
name: gfix-craft
description: >
  This skill MUST be used when the user asks to "implement", "create", "add a feature",
  "build", "write code", or "make" anything in a Next.js or Supabase project.
  Also activates when the user asks how to approach an implementation, choosing between
  libraries, or deciding whether to add a new file or dependency.
  Applies the GFix Craft Decision Ladder before any code is written to prevent
  over-engineering. The best code is the code you never wrote.
version: 1.0.0
---

# GFix Craft — 결정 사다리 (Decision Ladder)

코드를 작성하기 전, 반드시 아래 9단계를 순서대로 확인한다.
이전 단계에서 해결되면 즉시 중단하고 그 방법을 사용한다.

## 9단계 결정 사다리

### 1단계 [NEED] — 이 기능이 지금 정말 필요한가?

- 사용자가 명시적으로 요청했는가, 아니면 "나중에 필요할 것 같아서" 추가하려는가?
- 현재 요구사항을 해결하는 데 이 기능이 없으면 실제로 동작이 안 되는가?
- **NO → 구현하지 않는다. 이유를 한 줄로 설명한다.**

### 2단계 [EXIST] — 코드베이스에 이미 존재하는가?

확인 대상:
- `src/lib/` 또는 `src/libs/` — 유틸리티, Supabase 클라이언트, Axios 인스턴스
- `src/hooks/` — 커스텀 훅 (useAuth, useUser 등)
- `src/store/` — Recoil atoms, selectors
- `src/components/ui/` — shadcn/ui 컴포넌트
- **YES → 기존 코드를 재사용한다. 새 파일 생성 금지.**

자세한 내용: [`references/decision-ladder.md`](references/decision-ladder.md)

### 3단계 [NEXT] — Next.js 내장 기능으로 처리되는가?

확인 대상:
- **라우팅**: `app/` 디렉토리, 동적 라우트 `[id]`, 중첩 레이아웃
- **데이터 페칭**: Server Components에서 직접 `async/await`
- **폼 처리**: Server Actions (`'use server'`)
- **API**: Route Handlers (`route.ts`)
- **이미지**: `next/image` (자동 최적화)
- **링크**: `next/link` (프리페치 포함)
- **폰트**: `next/font` (자동 최적화)
- **미들웨어**: `middleware.ts` (인증, 리다이렉트)
- **메타데이터**: `export const metadata` (SEO)
- **YES → Next.js 내장 기능을 사용한다. 별도 라이브러리 설치 금지.**

자세한 내용: [`references/nextjs-patterns.md`](references/nextjs-patterns.md)

### 4단계 [SUPA] — Supabase가 처리하는가?

확인 대상:
- **인증**: `supabase.auth.*` (로그인, 회원가입, 소셜 로그인, 세션)
- **데이터 접근 제어**: Row Level Security (RLS) 정책
- **실시간**: `supabase.channel().on()` (실시간 구독)
- **파일 저장**: Supabase Storage
- **서버 로직**: Edge Functions (Deno)
- **이메일**: Auth 이메일 템플릿
- **YES → Supabase 기능을 사용한다. 직접 구현 금지.**

자세한 내용: [`references/supabase-patterns.md`](references/supabase-patterns.md)

### 5단계 [PKG] — 이미 설치된 패키지로 가능한가?

**frontend/** 에서 사용 가능한 패키지:
- **유효성 검사**: `zod`
- **폼**: `react-hook-form`
- **상태 관리**: `recoil`
- **HTTP**: `axios` (인터셉터 포함, `src/lib/axios/`)
- **UI 컴포넌트**: `shadcn/ui` (Button, Input, Dialog, Card 등)
- **토스트**: `sonner`
- **아이콘**: `lucide-react`
- **클래스 병합**: `cn()` (`src/lib/utils.ts`)

**admin/** 에서 사용 가능한 패키지:
- **서버 상태**: `@tanstack/react-query`
- **HTTP**: `axios`
- **유효성 검사**: `zod`

- **YES → 기존 패키지를 사용한다. `yarn add` 금지.**

### 6단계 [PATTERN] — 기존 lib/ 패턴을 따를 수 있는가?

확인 대상:
- **Supabase 클라이언트**: `src/lib/supabase/client.ts` 또는 `server.ts` 패턴 재사용
- **API 호출**: `src/lib/axios/instance.ts` + `endpoints.ts` 패턴
- **인터셉터**: `src/lib/axios/interceptors.ts` (토큰 자동 주입, 이미 완성됨)
- **YES → 기존 파일을 확장하거나 동일 패턴을 따른다. 새 인스턴스 생성 금지.**

### 7단계 [INLINE] — 한 줄 / 한 함수로 해결되는가?

- 별도 파일 없이 컴포넌트 내에서 인라인으로 처리 가능한가?
- 10줄 미만의 로직인가?
- **YES → 인라인으로 작성한다. 새 파일 생성 금지.**

### 8단계 [SHARED] — frontend/와 admin/ 양쪽에 필요한가?

- 동일한 로직이 두 앱 모두에서 사용되는가?
- **YES → 두 앱에 각각 복사하거나, `packages/shared/` 공유 모듈 도입을 논의한다.**
  - 주의: 현재 이 프로젝트에 `packages/shared/`는 존재하지 않음. 도입 시 모노레포 설정(turborepo 등) 필요.
- **NO → 필요한 앱에만 작성한다.**

### 9단계 [BUILD] — 그때만: 최소 구현

1~8단계 모두 해당 없을 때만 새 코드를 작성한다.

규칙:
- **최소 파일**: 새 파일 하나로 해결
- **최소 의존성**: `yarn add` 전에 반드시 1~5단계 재확인
- **최소 추상화**: 지금 필요한 것만 구현, 미래 확장성 설계 금지
- **기존 파일 확장 우선**: 새 파일 생성 전 기존 파일에 추가 가능한지 확인

## 출력 형식

결정 사다리 적용 후 다음 형식으로 결과를 보고한다:

```
[NEED]   ✓ 필요한 기능
[EXIST]  ✗ 없음
[NEXT]   ✗ 해당 없음
[SUPA]   ✓ → supabase.auth.signIn() 사용 가능
결론: 3단계에서 해결. 별도 구현 불필요.
```

또는:

```
[NEED]   ✓
[EXIST]  ✗
[NEXT]   ✗
[SUPA]   ✗
[PKG]    ✓ → zod + react-hook-form 이미 설치됨
결론: 5단계에서 해결. 추가 설치 없이 기존 패키지 활용.
```
