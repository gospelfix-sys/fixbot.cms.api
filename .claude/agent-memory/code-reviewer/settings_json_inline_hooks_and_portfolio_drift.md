---
name: settings json inline hooks and portfolio drift
description: .claude/settings.json 인라인 훅 후퇴 + statkit_portfolios 테이블명 드리프트, BLOCKED→재검토 APPROVED(조건부) 이력
type: project
---

2026-08-31 이전(agentId a21739a8f6905633a) 커밋 대기 변경사항 리뷰에서 두 Major로 BLOCKED:

1. `.claude/settings.json`의 `SessionStart`/`PreToolUse`/`PostToolUse`/`PreCompact` 훅이 스크립트 파일 참조에서 인라인 명령으로 후퇴.
2. `statkit_content_api_configs`의 `portfolio` 시드 행이 `table_name = 'portfolios'`(접두사 없음)를 가리키는데 실제 관리자 CRUD(`portfolios.admin.ts`)는 `statkit_portfolios`를 사용 — 스키마 드리프트가 문서화되어 있지 않음.

같은 날 재검토 시 조치 확인:

1. `.claude/settings.json`을 `git checkout`으로 완전히 되돌려 4개 훅 모두 다시 스크립트 파일(`bash .claude/hooks/*.sh`) 참조로 복원. (`Stop` 이벤트의 인라인 `echo` 명령은 애초에 지적 대상 아니었고 그대로 유지됨.)
2. `README.md` 203행과 `CLAUDE.md` 38행에 각각 드리프트 경고 각주 추가 — `portfolio` 리소스 `is_enabled` 활성화 전 `table_name`을 `statkit_portfolios`로 맞춰야 한다고 명시.

재검토 결과 두 이슈 모두 내용상 해소 확인 → APPROVED(조건부). 단 이 재검토 세션에는 Bash 도구가 없어(자세한 내용은 [[env_no_bash_subagent]]) `git status`/`git diff`로 실제 스테이징 상태까지는 확인하지 못하고 파일 내용 검증만 수행함.

**Why:** 사용자가 문제 파일을 직접 고치지 않고 이전 상태로 되돌리는(revert) 방식으로 해소하는 경우가 있음 — [[feedback_scope_narrowing]]과 유사하지만 이번엔 "제외"가 아니라 "원복".

**How to apply:** `.claude/settings.json`을 다시 다루는 리뷰에서 4개 훅(SessionStart/PreToolUse/PostToolUse/PreCompact)이 스크립트 파일 참조 형태를 유지하는지 확인. `portfolio` 리소스의 `is_enabled`를 `true`로 켜는 diff가 들어오면, README.md/CLAUDE.md의 드리프트 각주에서 언급한 `table_name` 수정(`statkit_portfolios`로 일치)이 함께 포함됐는지 반드시 확인 — 안 됐다면 Critical(런타임에서 존재하지 않는/불일치 테이블 조회).
