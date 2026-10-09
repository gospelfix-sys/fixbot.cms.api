---
name: gfix-audit
description: >
  This skill should be used when the user asks to "audit", "analyze the whole project",
  "find duplicates", "check consistency", "what's wrong with the codebase", or
  "clean up the project". Performs a full repository scan across frontend/ and admin/
  to identify duplication, inconsistencies, unused code, and architectural issues.
version: 1.0.0
---

# GFix Audit — 저장소 전체 감사

## 감사 항목

### 1. frontend/ ↔ admin/ 중복 코드

- Supabase 초기화 로직 (`client.ts`, `server.ts`, `middleware.ts`) — 거의 동일한 코드가 양쪽에 존재
- 공통 TypeScript 타입 정의 (`User`, `Profile` 등)
- 공통 유틸리티 함수
- 중복 발견 시 → `packages/shared/` 분리 제안

### 2. 네이밍 불일치

- `src/lib/` (frontend) vs `src/libs/` (admin) — 동일한 역할인데 폴더명 상이
- 컴포넌트 파일명 규칙 일관성

### 3. 미사용 코드

- 임포트했지만 사용하지 않는 모듈
- 선언했지만 호출되지 않는 함수/컴포넌트
- 참조되지 않는 Recoil atom

### 4. 하드코딩 탐지

- 직접 작성된 URL (`https://`, `http://`)
- 매직 넘버 (의미 없는 숫자 리터럴)
- 환경변수로 분리해야 할 값

### 5. 패키지 버전 불일치

- `frontend/package.json` vs `admin/package.json` 주요 패키지 버전 비교
  - `@supabase/supabase-js`: frontend 2.103.0 vs admin 2.45.4
  - `@supabase/ssr`: frontend 0.10.2 vs admin 0.5.1
  - Zod: frontend 4.3.6 vs admin 3.22.4

### 6. Supabase RLS 누락 확인

- 데이터를 반환하는 테이블에 RLS가 활성화되었는가?
- 앱 코드에서 수동으로 권한을 체크하는 패턴이 있는가? (RLS로 이관 권장)

## 출력 형식

```
=== GFix Audit 결과 ===

[중복] Supabase 클라이언트 초기화 코드 2곳
  - frontend/src/lib/supabase/client.ts
  - admin/src/libs/supabase/client.ts
  → 권장: packages/shared/supabase/ 로 분리

[불일치] 패키지 버전 차이
  - @supabase/supabase-js: frontend(2.103.0) vs admin(2.45.4)
  → 권장: admin을 2.103.0으로 업그레이드

[하드코딩] 3건 발견
  - admin/src/app/dashboard/page.tsx:42 → "https://api.example.com"

총 이슈: 6건 | 즉시 수정: 2건 | 검토 권장: 4건
```
