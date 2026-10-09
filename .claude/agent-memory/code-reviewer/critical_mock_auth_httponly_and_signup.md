---
name: critical mock auth httponly and signup
description: fixchat.cms.api 최초 스캐폴드 커밋 리뷰(2026-09-29)에서 발견한 mock-auth httpOnly 누락 + 셀프 회원가입 활성화 Critical 이슈, BLOCKED 판정
type: project
---

2026-09-29, 이 저장소(`fixchat.cms.api`)의 untracked 전체 스캐폴드(첫 실질 커밋)를 리뷰하며 발견한 Critical 3건. 이전 `project_scaffold_context.md`는 2026-07-21 기준으로 작성되어 Recoil(`userProfileAtom`) 기반 인증을 전제하지만, 현재 코드는 `@tanstack/react-query`(`useAuth.ts`의 `AUTH_QUERY_KEY`) 기반으로 이미 전환되어 있음 — 해당 메모는 구조적으로 상당 부분 stale.

**발견한 Critical:**

1. `src/app/sign/in/actions.ts`에서 `cookieStore.set('mock-auth', 'true', {...})` 호출 시 `httpOnly: true`가 없음. `sameSite: 'strict'`, `secure`만 설정됨. 즉 브라우저 콘솔에서 `document.cookie = "mock-auth=true; path=/"`만 실행하면 로그인 절차 없이 `src/middleware.ts`(29행)와 `src/app/(admin)/layout.tsx`(9행)의 관리자 게이트를 완전히 우회함.
2. mock 인증 경로 전체(middleware.ts, sign/in/actions.ts, /api/auth/me/route.ts)에 `NODE_ENV` 가드가 없음 — 오직 `/api/debug-env`만 개발 환경으로 제한됨. 즉 이 mock-auth가 프로덕션 빌드에서도 그대로 살아있음. `/api/auth/me/route.ts`는 `MOCK_PROFILE.id = "mock-user-id"`, `role: "admin"`을 하드코딩 반환 — 실제 `franchise_users.role` 조회 없음.
3. `src/app/sign/up/page.tsx` + `src/libs/supabase/queries/auth.ts`의 `signUpWithEmail()`이 실제 Supabase `auth.signUp()`을 호출하는 셀프 회원가입 경로로 살아있고, `middleware.ts`의 `matcher`에 `/sign/up`이 없어 인증 게이트 없이 완전 공개.

이 3건으로 BLOCKED 판정. Major로는 `.github/workflows/ci.yml`이 `yarn.lock`(--frozen-lockfile, cache-dependency-path)을 요구하지만 저장소에 `yarn.lock`이 아예 없어 push 즉시 CI 실패 확정, 그리고 `.gitignore`에 `.DS_Store` 규칙이 없어 `src/`, `.claude/`, `.serena/`, `supabase/` 등 18개 `.DS_Store`가 커밋 대상에 포함되는 문제도 함께 지적함.

**확인해서 문제 없었던 것들:** 하드코딩 시크릿(JWT/AWS키/PEM) 없음, `package-lock.json` 없음(yarn 전용 규칙 준수), `supabase/.temp/`는 루트 `.gitignore`의 슬래시 없는 `.temp` 패턴으로 모든 깊이에서 매칭되어 이미 제외 구조(단 이 세션엔 Bash 없어 `git status` 최종 확인은 못 함, [[env_no_bash_subagent]] 참고), `content-api-configs.ts`의 `createAdminClient()` 사용은 기존에 알려진 기술부채라 재지적 안 함, `.vscode/sftp.json`은 현재 전부 플레이스홀더(`"-"`)라 안전. `.env.example`은 `.claude/hooks/pre-tool-use.sh`의 `.env` 보호 정규식이 `.env.example`까지 막아 Read/Grep 모두 차단되어 이 세션에서 직접 열람 불가했음 — 사용자에게 직접 확인 요청함.

**Why:** mock-auth는 CLAUDE.md에 "개발/목업 환경 전용, 세션이 이미 검증된다고 가정하지 말 것"이라고 명시된 알려진 설계지만, httpOnly 누락 + NODE_ENV 미가드 조합은 이 스캐폴드가 실제로 배포될 경우 즉시 악용 가능한 완전한 인증 우회로 이어짐. 셀프 회원가입은 프로젝트 규칙 7에서 명시적으로 Critical로 취급하도록 정의됨.

**How to apply:** 이 저장소에서 `src/middleware.ts`, `src/app/sign/in/actions.ts`, `src/app/api/auth/me/route.ts`, `src/app/(admin)/layout.tsx`가 다시 리뷰 대상에 포함되면, (1) mock-auth 쿠키에 `httpOnly: true`가 있는지, (2) mock 인증 경로 전체에 `NODE_ENV !== 'production'` 가드 또는 실제 Supabase 세션+`franchise_users.role` 검증으로 교체됐는지, (3) `src/app/sign/up/`이 삭제됐거나 최소한 비활성화됐는지를 최우선으로 확인할 것. 셋 중 하나라도 미해결이면 BLOCKED. 또한 `.gitignore`에 `.DS_Store`가 없다면 재지적, `yarn.lock`이 저장소에 없는 채로 CI가 `--frozen-lockfile`을 쓰면 재지적.
