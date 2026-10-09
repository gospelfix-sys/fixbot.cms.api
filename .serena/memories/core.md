# statkit.cms.api — Core

**정체성**: 방문자용 홈페이지가 아니라, 별도 운영되는 고객용 홈페이지에 노출할 콘텐츠를 관리하는 헤드리스 CMS 관리자(Admin) 서비스.
- `(admin)` 라우트 그룹: 블로그·상품·포트폴리오·주문·견적·회원 CRUD (src/app/(admin)/)
- `/api/v1/{resource}`: statkit_content_api_configs 테이블로 리소스별 노출 토글 (코드 배포 불필요), X-API-Key 인증, 외부 홈페이지가 소비

**소스맵**
- src/app/(admin)/ — 관리자 CRUD 페이지 (Server Component + actions.ts + *Table.tsx/*Form.tsx 'use client')
- src/app/api/v1/[resource]/ — 동적 공개 REST API
- src/app/api/auth/me/route.ts — 클라이언트 인증 상태 조회 엔드포인트 (useAuth/useUser의 데이터 소스)
- src/libs/supabase/ — client.ts(anon)/server.ts(anon)/admin.ts(service_role)/middleware.ts(updateSession, 미연결)/queries/ (실제 쿼리 함수)
- src/middleware.ts — mock-auth 쿠키 라우팅 + CORS(OPTIONS preflight) 처리, 단일 관리 지점
- src/hooks/useAuth.ts, useUser.ts — React Query 기반 인증 상태 훅 (Recoil 아님, 2026-08-31 이전됨)

**참조**
- 기술 스택·버전: `mem:tech_stack`
- 명령어(yarn 전용 등): `mem:suggested_commands`
- 코드 컨벤션·데이터 접근 규칙: `mem:conventions`
- 인증/Supabase 클라이언트 3중 구조, 공개 API, CORS: `mem:architecture`
- 작업 완료 전 체크리스트: `mem:task_completion`
- 알려진 드리프트(문서 vs 실제 코드 불일치): `mem:known_drift`