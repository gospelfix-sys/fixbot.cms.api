# MEMORY.md — statkit.cms.api

- [프로젝트 개요](project-overview.md) — 기술 스택, 목적, 현재 구현 상태
- [아키텍처](architecture.md) — 인증 3중 레이어, Recoil 상태 구조, Supabase 클라이언트 분리(admin.ts 포함), Path Alias
- [데이터 접근 규칙](data-access-rules.md) — queries/ 디렉토리 전용, Server Action은 뮤테이션만, 읽기는 Server Component에서 직접 import (절대 규칙)
- [개발 환경 설정](dev-setup.md) — yarn 전용, 명령어, Git 훅, 환경변수, Supabase 스키마
- [주요 구현 인사이트](conversation-insights.md) — isMock 패턴(service_role 예외), Recoil 번들링 함정, Server Component+Client Component 분리 패턴, 사이드바 external 링크, 다크 모드, 메인 컬러(블랙)
- [Supabase 테이블 스키마 (DDL)](supabase_schema.md) — profiles·posts 테이블 DDL, 트리거, RLS, 실행 순서
- [CORS 설정](cors-setup.md) — middleware.ts 단일 관리, CORS_ALLOWED_ORIGINS 환경변수, OPTIONS 경로 필터, 핵심 규칙 6가지
- [createAdminClient() 사용 기준](feedback_admin_client_usage.md) — Public read 금지, admin 쓰기 전용. Public read는 createClient()(anon+RLS) 필수
- [sort_order 일괄 UPDATE upsert 배치](feedback_upsert_batch.md) — Promise.all+N개 UPDATE 금지, upsert({onConflict:'id'}) 단일 쿼리 사용
