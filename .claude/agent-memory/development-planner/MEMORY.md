# Development Planner Memory

## 프로젝트: service.supabase.v2

- PRD 위치: `docs/PRD.md`
- ROADMAP 위치: `docs/ROADMAP.md`
- 최초 ROADMAP 생성일: 2026-04-28

## ROADMAP 운영 원칙

- **Playwright MCP 테스트 내재화**: API 연동/비즈니스 로직/인증 흐름이 포함된 Phase에는 반드시 `### 테스트 (Playwright MCP)` 섹션 포함
- 테스트 태스크 형식: `- [ ] [기능명] Playwright 테스트 -- 시나리오: [정상 / 에러 / 엣지 케이스]`
- 해당 Phase 완료 기준에 "해당 Phase의 모든 Playwright MCP 테스트가 통과됨" 항목 필수
- Phase 1 같은 인프라 설정 단계는 테스트 섹션 불필요

## 실제 코드 현황 vs PRD 차이점 (2026-04-28 확인)

- frontend `/login`, `/register` 페이지가 아직 미구현 (PRD에서는 Phase 2 완료로 체크되어 있으나 실제 라우트 없음)
- `AuthProvider` 컴포넌트가 별도 파일로 존재하지 않음 (`RecoilProvider`만 있음)
- `useUser()` 훅 파일 미확인 (`useAuth.ts`만 존재)
- Recoil atoms는 `frontend/src/store/atoms/` 경로에 존재
- admin 앱에는 `/sign/in`, `/sign/up` 페이지 구현됨

## 공수 산정 참고치

- 인증 페이지 (로그인/회원가입): 각 1d (shadcn/ui 폼 + Supabase 연동)
- RLS 정책 설계 및 적용: 2d (테스트 포함)
- CRUD 목록 페이지 (@tanstack/react-query): 2d
