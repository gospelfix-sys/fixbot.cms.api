#!/bin/bash
# SessionStart 훅: 세션 시작 시 프로젝트 컨텍스트 로딩

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 statkit.cms.api — 세션 시작"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Git 상태
BRANCH=$(git branch --show-current 2>/dev/null || echo "(git 없음)")
echo ""
echo "🌿 브랜치: $BRANCH"

echo "📝 최근 커밋:"
git log --oneline -5 2>/dev/null | sed 's/^/  /' || echo "  (없음)"

CHANGED=$(git status --short 2>/dev/null)
if [ -n "$CHANGED" ]; then
  echo ""
  echo "⚠️  미커밋 변경 파일:"
  printf '%s\n' "$CHANGED" | sed 's/^/  /'
fi

# 핵심 규칙 요약
echo ""
echo "📌 핵심 규칙:"
echo "  • 패키지 매니저 : yarn 전용 (npm 금지)"
echo "  • Supabase 쿼리 : src/libs/supabase/queries/ 에서만 작성"
echo "  • Recoil 접근   : useAuth() / useUser() 훅만 사용"
echo "  • shadcn utils  : @/libs/utils"
echo "  • 목 인증       : profile.id === 'mock-user-id' 체크 후 Supabase 호출 건너뜀"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
