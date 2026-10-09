# Known Drift / Gotchas

**portfolio 리소스 테이블명 불일치**: `statkit_content_api_configs`의 portfolio 시드 행은 `table_name = 'portfolios'`(접두사 없음)인데 실제 관리자 CRUD는 `statkit_portfolios` 테이블을 사용. portfolio 리소스의 `is_enabled`를 켜기 전에 `table_name`을 `statkit_portfolios`로 수정해야 공개 API가 정상 동작함.

**`.claude/memory/architecture.md`, `.claude/memory/conversation-insights.md`가 구식**: Recoil 기반 서술(atoms/selectors, RecoilRoot 번들링 함정, Recoil atom으로 전역 UI 동기화)이 남아있으나 2026-08-31 커밋(`4f8e2b7`)으로 Recoil은 완전히 제거되고 React Query(useAuth/useUser + /api/auth/me)로 대체됨(package.json에 recoil 의존성 없음, src 전체에 recoil import 없음 확인됨). 실제 구현은 `mem:architecture` 참고 — 이 두 파일의 Recoil 관련 서술은 신뢰하지 말 것. CLAUDE.md 자체도 이 갱신이 아직 필요하다고 명시.

**미구현 상태**: 실제 Supabase 세션 기반 인증(`updateSession()` 미들웨어 미연결), orders/quotes 전용 쿼리 레이어, 사용자 역할 변경 UI, 비밀번호 재설정, 아바타 Supabase Storage 실제 업로드(현재 dataURL 로컬 프리뷰만 React Query 캐시에 반영, 새로고침 시 초기화됨).