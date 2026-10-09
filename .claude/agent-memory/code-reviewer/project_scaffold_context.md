---
name: statkit.cms.api scaffold context
description: Next.js 14 + Supabase 기반 관리자 앱 스캐폴드의 아키텍처 결정 사항 및 알려진 기술 부채
type: project
---

이 프로젝트는 Supabase 인증(이메일 + Google/Kakao OAuth) 기반 Next.js 14 App Router 관리자 스캐폴드다.

**Why:** 반복 인증 구현 비용을 0으로 만들기 위한 재사용 가능한 스타터킷 목적.

**How to apply:** 코드 리뷰 시 "스캐폴드 목적"을 감안해 과도한 추상화보다 단순성을 우선 평가할 것.

## 알려진 기술 부채 (최종 업데이트: 2026-07-21)

- RLS 정책 미적용: `profiles` 테이블에 Row Level Security가 없어 클라이언트에서 임의 조회 가능 (Phase 4 예정)
- 미사용 의존성: `axios`, `zod`, `@tanstack/react-query`가 package.json에 있으나 코드에서 미사용
- test 스크립트 누락: pre-commit 훅이 `yarn test`를 호출하나 package.json에 test 스크립트 없음 → 모든 커밋 차단
- `open redirect` 취약점: `/auth/callback?next=` 파라미터가 origin 검증 없이 리다이렉트 경로로 사용됨 (현재 startsWith('/') 체크로 부분 완화)
- PRD와 코드 불일치: PRD는 Tailwind/shadcn/Recoil 미도입으로 기술하나 실제 코드에는 모두 존재
- NEXT_PUBLIC_MOCK_PASSWORD 노출: 비밀번호가 클라이언트 번들에 포함됨 (Critical — 수정 필요)
- 중복 미들웨어: 루트 middleware.ts + src/middleware.ts 두 파일 공존. src/middleware.ts가 실제 동작 파일. 루트 파일 삭제 필요.
- profile/page.tsx에서 userProfileAtom 직접 import — CLAUDE.md 규칙 위반 (useAuth 훅 경유 필요)
- updatePost N+1 쿼리: published 상태 변경 시 SELECT + UPDATE 2회 왕복 (의도적 동작 — draft→published 최초 전환 시에만 published_at 설정 목적으로 설계됨, 2026-07-19 리뷰에서 Minor 등급으로 재분류)
- pre-push hook에 main 브랜치 보호 누락: PROTECTED_BRANCHES가 master|dev|prod만 포함
- pre-commit hook에 main/ 디렉토리 빌드 로직 잔존 (이 레포와 무관)
- users/page.tsx가 MOCK_USERS 하드코딩 — Supabase 연동 미구현, UserCard 삭제 버튼 onClick 없음
- openapi spec servers에 localhost만 하드코딩 — 프로덕션 URL 환경변수화 필요
- updateProductsSortOrder / updatePostsSortOrder N+1 쿼리: upsert 배치로 수정 완료 (2026-07-21 해소)
- DnD handleDrop 경쟁 조건: 저장 중 두 번째 드래그가 발생하면 첫 번째 실패 시 두 번째 조작 결과도 롤백됨. isSaving 플래그 + 스냅샷 패턴으로 해결 권장 (Major, 2026-07-20 리뷰)
- getPublishedPosts가 anon key 클라이언트 사용: RLS 미적용 상태에서 posts 테이블 전체 접근 열릴 수 있음. adminClient로 교체 또는 RLS 적용 필요 (Major, 2026-07-20 리뷰)
- products.server.ts 데드 코드: getActiveProducts 등 3개 함수가 어떤 Route Handler/Page에서도 호출되지 않음. 파일 삭제 또는 호출 지점 연결 필요 (Major, 2026-07-21 리뷰) — createAdminClient→createClient 교체는 완료(2026-07-21), 데드 코드 여부는 미해소
- upsert({onConflict:'id'}) 미존재 id 방어 없음: updatePostsSortOrder/updateProductsSortOrder 양쪽 모두 존재하지 않는 id 전달 시 NOT NULL 에러 발생. JSDoc 또는 입력 검증 추가 권장 (Minor로 재분류, 2026-07-21 — upsert 배치 전환 완료, id 검증 미구현은 잔여)
- createAdminClient에 cache: no-store 전역 적용: 관리자 읽기 쿼리까지 캐시 미사용. 현재 규모에서 허용 가능하나 향후 unstable_noStore() 범위 한정 검토 필요 (Minor)
- Server Action(updateSortOrderAction 등)에 입력값 검증 없음: UUID, 양의 정수 검증 추가 권장 (Minor)
- portfolio/PortfolioTable.tsx에서 `/portfolio/${id}/edit` 링크 사용 중이나 해당 App Router 라우트(src/app/(admin)/portfolio/[id]/edit/)가 미구현 상태 — 수정 링크 클릭 시 404 (Major, 2026-07-22)
- PortfolioForm Object URL cleanup 누락: useEffect cleanup이 마운트 시점 newPreviews 스냅샷만 revoke, 이후 추가된 Object URL은 누수 가능. newPreviews를 dependency에 넣거나 removeNewImage에서 개별 revoke 일관 적용 필요 (Minor, 2026-07-22)
- updatePortfoliosSortOrder upsert에 UUID 검증 없음: actions.ts → portfolios.admin.ts 경로에서 배열 요소별 id 검증 누락 (Minor, 2026-07-22)
- RichEditor에서 window.prompt() 사용: alert() 제거 방침과 불일치. prompt()도 동일하게 커스텀 다이얼로그로 교체 권장 (Minor, 2026-07-22)
- PortfolioForm에서 thumbnail_url을 allImages[0]으로 자동 지정: 이미지 삭제/재정렬 시 의도치 않은 썸네일 변경 발생 가능 (Minor, 2026-07-22)
- Route Handler parseInt NaN 방어 누락: page/limit 파라미터에 isNaN 체크 필요 (Minor)
- UserSchema에 email 필드 포함: content_api_configs의 select_columns와 불일치 시 이메일 목록 노출 위험. select_columns 설정과 반드시 동기화 필요 (Critical, 2026-07-21 리뷰)
- QuoteSchema에 updated_at 필드 누락: 다른 schema(User/Order/Portfolio)와 달리 updated_at 없음. DB 스키마와 일치 여부 확인 필요 (Major, 2026-07-21 리뷰)
- portfolio.schema.ts description 불일치: "is_published=true" 필터 언급하나 PortfolioSchema에 is_published 필드 없음. description 수정 또는 필드 추가 필요 (Major, 2026-07-21 리뷰)
- NAV_ITEMS 배열 타입 선언 누락: external 필드가 암묵적으로 허용됨. NavItem 타입 명시 권장 (Minor, 2026-07-21 리뷰)
- POPUP_ITEMS 렌더링 시 filter+as 캐스팅 패턴: isLinkItem/isActionItem 타입 가드로 교체 권장 (Minor, 2026-07-21 리뷰)
- schema 파일 공통 ErrorResponseSchema 미추출: z.object({ error: z.string() })가 모든 schema 파일에 중복. common.ts로 추출 권장 (Minor, 2026-07-21 리뷰)

## 스택 확정 사항

- Supabase SSR 클라이언트 3종 분리: client.ts (브라우저), server.ts (Server Component/Route), middleware.ts (Edge). admin.ts는 service_role key + cache: no-store 전역 적용 (2026-07-20 추가)
- 상태 관리: Recoil (authAtom, userAtom, uiAtom + authSelector)
- UI: shadcn/ui (style: default, baseColor: neutral) + Tailwind CSS v4
- 로그인 페이지는 현재 인라인 스타일 — shadcn/ui 컴포넌트로 교체 예정
