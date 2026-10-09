# Task Completion Checklist

작업 완료 전 실행:
1. `yarn lint`
2. `yarn pretty` (또는 커밋 시 lint-staged가 자동 실행)
3. 커밋 시 Husky pre-commit이 lint-staged + yarn test를 자동 실행 — 훅 우회(--no-verify) 금지
4. master/dev/prod 브랜치로 직접 push 불가 (pre-push 훅) — 별도 브랜치 + PR 필요