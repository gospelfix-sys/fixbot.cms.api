---
name: mcp-serena-config-review
description: .mcp.json + .serena/ 툴링 설정 파일을 커밋 대상으로 리뷰한 결과 (2026-09-17) — 민감정보 없음, .gitignore 구조 확인, APPROVED
type: project
---

2026-09-17, `.mcp.json`(context7/sequential-thinking/supabase/serena MCP 서버 등록)과 `.serena/`(Serena 코드 인텔리전스 툴 설정 + 온보딩 메모리)가 최초로 git에 추가되는 것을 리뷰함. 결과: APPROVED, 민감정보 없음.

**확인한 것:**

- `.mcp.json`의 supabase MCP 엔트리는 URL 쿼리에 `project_ref=lrqqxzlxuilwfumitwmc`를 노출하지만 API 키/토큰이 아님 — Supabase project ref는 `https://<ref>.supabase.co` 형태로 어차피 클라이언트 코드에 공개되는 값이라 시크릿으로 취급하지 않는다. serena 엔트리는 `env: {}`로 비어있고 나머지 서버들도 키를 담지 않는 순수 URL/커맨드 설정.
- `.serena/.gitignore`(`/cache`, `/project.local.yml`)는 `.serena/` 디렉터리 기준 상대 경로라 `.serena/cache/*.pkl`(언어서버 심볼 캐시, 바이너리)과 `.serena/project.local.yml`을 정확히 제외한다. `.serena/project.local.yml`은 현재 주석뿐이라 내용상으로도 이중 안전.
- `.serena/memories/*.md`(core/tech_stack/suggested_commands/conventions/task_completion/architecture/known_drift/memory_maintenance)는 Serena 온보딩이 생성한 프로젝트 구조 요약으로, 환경변수는 이름만 나열(`INTERNAL_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 등)하고 값은 없음. [[project_scaffold_context]]/기존 CLAUDE.md 내용과 중복되는 수준의 정보.

**Why:** Serena/MCP 관련 신규 인프라 파일이 처음 커밋되는 시점이라 팀 전체에 공유되기 전에 시크릿 하드코딩 여부를 반드시 확인해야 했음.

**How to apply:** 향후 `.mcp.json`에 새 MCP 서버가 추가되거나 `.serena/memories/*.md`가 갱신되어 다시 리뷰 대상이 될 때, 이 패턴(URL 쿼리의 project_ref/식별자는 시크릿 아님, 실제 API 키·비밀번호·서비스롤 키 값이 텍스트로 박혀있는지가 진짜 체크포인트)을 기준으로 삼는다. `.serena/cache/`, `.serena/project.local.yml`은 구조적으로 이미 제외되므로 매번 처음부터 검증할 필요 없이 `.serena/.gitignore` 내용만 그대로인지 확인하면 됨.
