---
name: hooks_formatter_path_validation
description: .claude/hooks/formatter.sh의 CLAUDE_PROJECT_DIR 경로 검증 삭제/복원 이력 — 2026-07-25 복원 확인, APPROVED
metadata:
  type: project
---

`.claude/hooks/formatter.sh` (PostToolUse, Write|Edit 매처)에서 한때 아래 경로 검증 블록이 삭제되어 이전 리뷰(agentId a9ef8ea06cd398015)에서 Critical로 지적된 바 있음. 2026-07-25 재리뷰에서 정확히 원래 형태로 복원된 것을 확인:

```bash
case "$FILE" in
  "$CLAUDE_PROJECT_DIR"/*) ;;
  *) echo "[formatter] 허용되지 않은 경로: $FILE" >&2; exit 0 ;;
esac
```

같은 diff에 stdin 처리 방식 변경(`INPUT=$(cat)` 제거 → `jq -r '.tool_input.file_path // empty'`가 stdin을 직접 읽음)도 포함되어 있었으나, 이 변경 자체는 이전 세션에서 이미 있었고 이번에 처음 리뷰 대상에 포함된 것. `jq`가 stdin을 소비한 뒤 결과를 `FILE`에 담고 나서 case 검증이 실행되므로 두 변경 사이 상호작용 문제 없음.

**Why:** `.claude/settings.json`의 PostToolUse 훅(`bash .claude/hooks/formatter.sh`)은 Claude Code 런타임이 `CLAUDE_PROJECT_DIR` 환경변수를 항상 주입하는 컨텍스트에서만 실행되므로, 이 값이 비어 있어 검증이 무력화되는 시나리오는 정상 운영에서는 발생하지 않음.

**How to apply:** 이 파일이 다시 diff에 포함되고 `case "$FILE" in "$CLAUDE_PROJECT_DIR"/*)` 블록이 또 사라져 있다면 Critical로 재차 지적할 것. 알려진 잔여 약점(신규 아님, blocking 아님): prefix 문자열 매칭이라 `$CLAUDE_PROJECT_DIR/../../etc/passwd`처럼 `..`를 포함한 경로도 문자열상 prefix가 일치하면 통과함 — 원 코드에도 있던 설계 한계이며 realpath 정규화로 개선 가능하나 이번 리뷰의 BLOCKED 근거로는 삼지 않음(선택적 개선, Minor).
