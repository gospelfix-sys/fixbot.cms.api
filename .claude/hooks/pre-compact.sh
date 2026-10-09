#!/bin/bash
# PreCompact 훅: 컨텍스트 압축 전 핵심 컨텍스트 출력

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚡ 컨텍스트 압축 — 핵심 컨텍스트 보존"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "=== CLAUDE.md ==="
head -80 CLAUDE.md 2>/dev/null || echo "(CLAUDE.md 없음)"

echo ""
echo "=== 프로젝트 상태 ==="
cat .claude/agent-memory/project-state.md 2>/dev/null || echo "(project-state.md 없음)"

echo ""
echo "=== Git 상태 ==="
echo "브랜치: $(git branch --show-current 2>/dev/null || echo '없음')"
git log --oneline -3 2>/dev/null | sed 's/^/  /' || echo "  (없음)"
CHANGED=$(git status --short 2>/dev/null)
if [ -n "$CHANGED" ]; then
  echo "미커밋 변경:"
  printf '%s\n' "$CHANGED" | sed 's/^/  /'
fi

echo ""
echo "=== 핵심 규칙 ==="
echo "  yarn 전용 | Supabase 쿼리는 queries/ 에서만 | @/libs/utils | mock-user-id 체크"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
