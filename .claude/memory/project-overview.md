---
name: 프로젝트 개요
description: statkit.cms.api 기술 스택, 목적, 현재 구현 상태
type: project
---

# 프로젝트 개요

**statkit.cms.api**는 별도로 운영되는 일반 홈페이지(고객용 프론트엔드)에 노출할 콘텐츠를 관리하는 **헤드리스 CMS 관리자(Admin) 서비스**다. 방문자용 페이지가 아니라 관리자 전용 백오피스이며, 두 축으로 동작한다:

1. **콘텐츠 관리**: 블로그·상품·포트폴리오·주문·견적·회원 등을 `(admin)` 라우트 그룹에서 CRUD.
2. **동적 REST API**: `/settings`에서 리소스별 노출 여부를 토글하면 `/api/v1/{resource}`가 즉시 활성화/비활성화된다 (`statkit_content_api_configs` 테이블 기반, 코드 배포 불필요). 외부 일반 홈페이지가 이 API를 소비한다.

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 인증 | Supabase Auth (`@supabase/ssr`) — 이메일/비밀번호, Google OAuth, Kakao OAuth (현재 미들웨어는 mock-auth 쿠키 기반, 아래 "현재 구현 상태" 참고) |
| 전역 상태 | Recoil |
| UI 컴포넌트 | shadcn/ui + Tailwind CSS v4 |
| 리치 텍스트 에디터 | Tiptap (블로그/포트폴리오 본문) |
| 폼 관리 | react-hook-form + Zod |
| 데이터 패칭 | @tanstack/react-query + Axios |
| API 스펙 · 문서 | zod-to-openapi + swagger-ui-react (`/api-docs`) |
| 토스트 알림 | Sonner |
| 배포 | Vercel (포트 3001) |

## 현재 구현 상태

- **완료**: 콘텐츠 CRUD(블로그·상품·포트폴리오), 동적 REST API 토글 시스템(`statkit_content_api_configs` + `/api/v1/[resource]`), 동적 OpenAPI 스펙(`/api/openapi.json`) + Swagger UI(`/api-docs`), `X-API-Key` 기반 공개 API 인증, profiles 트리거, 관리자 UI 스캐폴드, 프로필 편집 페이지, 다크 모드, 메인 컬러 블랙(#000) 적용
- **미구현 / 진행 중**: 실제 Supabase 세션 기반 인증 — 현재 `src/middleware.ts`와 `src/app/page.tsx`는 `mock-auth` 쿠키로만 로그인 여부를 판단하는 개발용 인증이며, `updateSession()`(`src/libs/supabase/middleware.ts`)은 정의만 되어 있고 아직 연결되지 않았다. 실서비스 전환 시 가장 먼저 교체해야 하는 부분. 그 외 orders/quotes 관리 페이지의 전용 쿼리 레이어, 사용자 역할 변경 UI, 비밀번호 재설정, 아바타 Supabase Storage 실제 업로드도 미완성.
