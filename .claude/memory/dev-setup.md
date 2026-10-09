---
name: 개발 환경 설정
description: 패키지 매니저(yarn 전용), 명령어, Git 훅, 환경변수, Supabase 스키마
type: project
---

# 개발 환경 설정

## 패키지 매니저

> **npm 사용 절대 금지.** 모든 패키지 설치 및 스크립트 실행은 **yarn**만 사용한다.

## 명령어

```bash
yarn dev        # 개발 서버 (http://localhost:3001)
yarn build      # 프로덕션 빌드
yarn lint       # ESLint
yarn pretty     # Prettier (src/**/*.{ts,js,tsx,jsx} 포맷)
yarn shadcn add <component>   # shadcn/ui 컴포넌트 추가
```

## Git 훅 (Husky)

- **pre-commit**: `lint-staged` + `yarn test` 실행
- **pre-push**: `master`, `dev`, `prod` 브랜치에 직접 push 차단

## 환경변수

`.env.local` 파일에 설정 (`.env.example` 참고):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # 서버 전용. src/libs/supabase/admin.ts(createAdminClient)가 사용 중 — 관리자 CRUD 전 구간의 RLS 우회 키
INTERNAL_API_KEY=              # 공개 REST API(/api/v1/*) 인증 키. 없으면 해당 요청 전부 500
```

OAuth(Google/Kakao)는 Supabase 대시보드 → Authentication → Providers에서 활성화.
`GOOGLE_OAUTH_*`, `KAKAO_CLIENT_*` 값도 대시보드에서 입력.

## Supabase 스키마

로컬 마이그레이션 미사용. Supabase 대시보드 SQL Editor에서 직접 실행.

`profiles` 테이블 + `handle_new_user()` 트리거는 README.md의 SQL을 실행해야 인증 후 프로필이 자동 생성된다. 최초 가입 계정의 `role`은 기본값 `'user'`이므로 관리자로 사용하려면 수동으로 `'admin'`으로 변경 필요.
