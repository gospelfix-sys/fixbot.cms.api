#!/bin/bash
# PreToolUse 훅: 도구 사용 전 파일 접근 검증

INPUT=$(cat)
FILE=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)

# 파일 경로가 없으면 통과
[ -z "$FILE" ] && exit 0

# .env 파일 보호
if printf '%s' "$FILE" | grep -qE '(^|/)\.env(\.|$|_)'; then
  printf '🚫 [BLOCKED] .env 파일은 수정할 수 없습니다: %s\n' "$FILE" >&2
  exit 2
fi
