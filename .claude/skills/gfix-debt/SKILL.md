---
name: gfix-debt
description: >
  This skill should be used when the user asks about "technical debt", "TODO",
  "FIXME", "things to clean up", "deferred work", or "what needs to be improved".
  Scans the codebase for TODO/FIXME/HACK tags, version inconsistencies, and
  known shortcuts to generate an actionable debt register.
version: 1.0.0
---

# GFix Debt — 기술 부채 추적

## 스캔 항목

### 1. 코드 내 태그 수집

```bash
grep -rn "TODO\|FIXME\|HACK\|XXX\|TEMP\|@deprecated" frontend/src/ admin/src/ --include="*.ts" --include="*.tsx"
```

### 2. 알려진 부채 목록 (이 프로젝트 기준)

- **패키지 버전 불일치**: `@supabase/supabase-js`, `@supabase/ssr`, `zod`의 frontend/admin 버전 차이
- **네이밍 불일치**: `src/lib/` (frontend) vs `src/libs/` (admin)
- **Supabase 쿠키 처리**: admin은 동기 `cookies()`, frontend는 `await cookies()` — Next.js 15 마이그레이션 시 영향
- **공유 코드 미분리**: Supabase 초기화 코드가 양쪽에 중복

### 3. 부채 우선순위 기준

| 우선순위 | 기준 |
|---------|------|
| P1 (즉시) | 보안 취약점, 런타임 에러 가능성 |
| P2 (이번 스프린트) | 기능 버그, 성능 문제 |
| P3 (다음 스프린트) | 코드 품질, 일관성 |
| P4 (백로그) | 리팩토링, 최적화 |

## 출력 형식

```
=== GFix Debt 리포트 ===

[P2] 패키지 버전 불일치 (3건)
  admin/을 최신 버전으로 업그레이드 필요
  
[P3] TODO 태그 (N건)
  src/components/auth/LoginForm.tsx:15 — TODO: 소셜 로그인 추가
  
[P4] 코드 중복 (2건)
  Supabase 초기화 → packages/shared/ 분리 검토

총 부채: N건
```
