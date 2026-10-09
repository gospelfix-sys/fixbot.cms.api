# Suggested Commands

패키지 매니저: **yarn 전용** — npm 사용 금지.

- `yarn dev` — 개발 서버 (:3001)
- `yarn build` / `yarn start`
- `yarn lint` — next lint
- `yarn pretty` — prettier --write "src/**/*.{ts,js,tsx,jsx}"
- `yarn shadcn add <component>` — shadcn/ui 컴포넌트 추가 (추가 후 import 경로가 `@/lib/utils`로 생성되면 `@/libs/utils`로 수정 필요, `mem:conventions` 참고)

Husky 훅:
- pre-commit: lint-staged + yarn test
- pre-push: master/dev/prod 브랜치 직접 push 차단

Supabase 스키마 변경: 로컬 마이그레이션 워크플로우 미사용, Supabase 대시보드 SQL Editor에서 직접 실행 (supabase/migrations, supabase/backups 디렉토리는 존재).