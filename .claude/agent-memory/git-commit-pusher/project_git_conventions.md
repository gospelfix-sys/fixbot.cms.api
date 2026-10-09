---
name: statkit.cms.api Git 관례
description: statkit.cms.api 프로젝트의 브랜치 구조, 패키지 매니저, 보호 브랜치 등 Git 관련 관례
type: project
---

패키지 매니저는 yarn만 사용한다. npm 명령어는 절대 사용하지 않음.

**Why:** CLAUDE.md에 "npm 사용 절대 금지"로 명시되어 있으며, .husky/pre-commit도 yarn lint-staged로 설정됨.

**How to apply:** git 커밋/스테이징과 무관하지만, 커밋 메시지나 훅 관련 안내 시 항상 yarn 기준으로 작성할 것.

보호 브랜치: `master`, `dev`, `prod` (pre-push 훅으로 직접 push 차단됨).

**How to apply:** 이 브랜치들에 직접 push 시도 시 경고 후 사용자 확인 요청.

현재 메인 브랜치: `main`
