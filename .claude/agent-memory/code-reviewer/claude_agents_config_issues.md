---
name: claude agents config issues
description: .claude/agents, .claude/skills 등 Claude Code 설정 파일 자체에서 발견된 구조적 이슈 (앱 코드가 아닌 에이전트/스킬 설정)
type: project
---

`.claude/agents/git-commit-pusher.md`의 `tools:` 목록에 Bash(또는 git 실행 가능한 도구)가 없음.

**Why:** 이 에이전트의 워크플로우 전체(git status/diff/add/commit/push)가 실제 shell 명령 실행을 전제로 작성되어 있으나, frontmatter의 `tools:` 목록은 Glob, Grep, Read, WebFetch, WebSearch, Edit, Write, NotebookEdit, Skill, TaskCreate/Get/Update/List, EnterWorktree, ExitWorktree, CronCreate/Delete/List, ToolSearch뿐이라 실제로 git 명령을 실행할 수단이 없어 보임. 2026-07-25 리뷰(git-commit-pusher.md에 git-commit 스킬 규칙 병합 diff) 당시 작업 계획(plan) 문서에서 "이번 요청과 무관한 별개 사안"으로 명시적으로 스코프 제외되었고, 해당 diff에서 `tools:` 라인 자체는 변경되지 않았으므로 그 커밋은 BLOCKED 사유로 삼지 않았음.

**How to apply:** `.claude/agents/git-commit-pusher.md`를 다시 다루는 리뷰(특히 `tools:` 라인이 diff에 포함된 경우)에서는 이 문제를 Critical로 취급할 것. 아직 별도 커밋으로 수정되지 않았다면 계속 유효한 이슈임 — 최신 상태는 파일을 직접 읽어 `tools:` 라인에 Bash 계열 도구가 추가됐는지 재확인.
