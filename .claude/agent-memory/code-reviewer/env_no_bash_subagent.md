---
name: env no bash subagent
description: code-reviewer 서브에이전트 실행 환경에 Bash 도구가 제공되지 않는 경우가 있음 (git status/diff 직접 실행 불가)
type: project
---

2026-08-31 재검토(BLOCKED 후속) 세션에서 ToolSearch로 "bash", "git status diff", "run terminal command" 등을 검색했으나 Bash 도구를 찾지 못했고, 초기 노출된 도구 목록(Read/Edit/Write/Skill/ToolSearch/Glob/Grep)과 deferred 목록(CronCreate/Delete/List, EnterWorktree/ExitWorktree, NotebookEdit, TaskCreate/Get/List/Update, WebFetch, WebSearch)에도 Bash가 없었다. 즉 이 프로젝트의 code-reviewer 서브에이전트 launch 설정은 Bash를 아예 허용하지 않는 것으로 보인다 (프로젝트 `.claude/settings.json`의 `permissions.allow: ["Bash"]`는 최상위 세션 권한이며 서브에이전트 tools 목록과는 별개).

**Why:** [[claude_agents_config_issues]]에서 지적한 git-commit-pusher.md의 tools 목록에 Bash가 없는 문제와 같은 패턴 — 이 리포지토리의 여러 에이전트 정의에서 git 실행이 필요한 워크플로우인데도 Bash가 tools에서 누락되는 경우가 반복됨.

**How to apply:** git status/diff/log 등 git 명령이 필요한 재검토·리뷰 요청을 받으면, 먼저 Bash 사용 가능 여부를 ToolSearch로 확인하고, 없다면 Read/Grep으로 대상 파일 내용을 직접 읽어 "커밋 대상에 실제로 포함됐는지"까지는 확정하지 말고 "파일 내용상 문제 해소 여부"까지만 판단한 뒤, 사용자에게 최종 `git status`/`git diff` 확인을 요청하는 방식으로 조건부 판정(APPROVED 조건부)을 내릴 것. 이 문제는 서브에이전트 설정(tools 목록)을 만드는 쪽에서 고쳐야 하는 사안이므로, 리뷰 대상 diff에 해당 agent 정의 파일의 tools 목록이 포함된 경우가 아니라면 이 자체를 Critical/Major 이슈로 지적하지 않는다.
