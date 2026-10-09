# service.supabase.v2 ROADMAP

> Supabase 인증 + Next.js 14 기반 사용자/관리자 분리 풀스택 스타터킷
> 최종 갱신: 2026-04-28

---

## 프로젝트 개요

**비전**: 새 프로젝트 착수 시 인증/인가 구현을 반복하지 않고, 복사 후 즉시 비즈니스 로직 개발에 집중할 수 있는 모노레포 스타터킷

**성공 지표**
- 스타터킷 복사 후 인증/인가 추가 구현 시간 0
- frontend(포트 3000)와 admin(포트 3001)이 독립 배포 가능한 상태 유지

**전체 타임라인**

| Phase | 상태 | 요약 |
|-------|------|------|
| Phase 1 - 기반 인프라 | 완료 | 모노레포, Supabase 연결, 미들웨어 |
| Phase 2 - 인증 기능 | 진행 중 | 로그인/회원가입 페이지, Recoil, Axios |
| Phase 3 - 대시보드 UI | 진행 중 | 대시보드 레이아웃, 프로필 수정, 관리자 기능 |
| Phase 4 - 안정화 | 예정 | RLS, 테스트, 문서화 |

---

## 기술 아키텍처

| 구분 | frontend | admin |
|------|----------|-------|
| 프레임워크 | Next.js 14 (App Router) | Next.js 14 (App Router) |
| 스타일 | Tailwind CSS v3 + shadcn/ui (base-nova) | - |
| 상태 관리 | Recoil | @tanstack/react-query |
| HTTP | Axios (인터셉터) | Axios |
| 인증 | @supabase/ssr | @supabase/ssr |

**주요 설계 원칙**
- Supabase 스키마는 대시보드에서 직접 관리 (CLI 마이그레이션 미사용)
- shadcn/ui base-nova 스타일 사용 -- `asChild` prop 없음, `<Link className={buttonVariants()}>` 패턴 필수
- admin과 frontend의 미들웨어 인증 흐름이 다름 (CLAUDE.md 참조)

---

## Phase 1: 기반 인프라 -- 완료

**목표**: 모노레포 구조 수립 및 Supabase 인프라 연결

- [x] 모노레포 구조 설정 (`frontend/`, `admin/`)
- [x] Supabase 프로젝트 연결 및 환경변수 설정
- [x] `profiles` 테이블 + `handle_new_user()` 자동 생성 트리거
- [x] 미들웨어 인증 흐름 구현 (frontend `updateSession`, admin `updateSession`)

---

## Phase 2: 인증 기능 -- 진행 중

**목표**: 이메일/비밀번호 기반 인증 전체 흐름 완성

### 완료

- [x] Recoil 상태 관리 설정 (`authAtom`, `userAtom`, `uiAtom`, `authSelector`)
- [x] Axios 인터셉터 (토큰 자동 주입 + 401 갱신)
- [x] `useAuth()` 훅
- [x] admin 로그인 (`/sign/in`) / 회원가입 (`/sign/up`) 페이지

### 미완료

- [ ] frontend 로그인 페이지 (`/login`) -- 난이도: 중, 예상: 1d
- [ ] frontend 회원가입 페이지 (`/register`) -- 난이도: 중, 예상: 1d
- [ ] frontend 로그아웃 처리 -- 난이도: 하, 예상: 0.5d
- [ ] `AuthProvider` 컴포넌트 (`onAuthStateChange` 구독 -> Recoil atoms 동기화) -- 난이도: 중, 예상: 1d
- [ ] `useUser()` 훅 (`userProfileAtom` 기반) -- 난이도: 하, 예상: 0.5d

### 테스트 (Playwright MCP)

- [ ] 이메일/비밀번호 로그인 Playwright 테스트 -- 시나리오: 정상 로그인 후 `/dashboard` 도달 / 잘못된 비밀번호 입력 시 에러 메시지 표시 / 미가입 이메일 입력 시 에러 처리
- [ ] 회원가입 Playwright 테스트 -- 시나리오: 정상 회원가입 후 로그인 가능 / 이미 존재하는 이메일로 가입 시도 시 에러 / 필수 필드 미입력 시 유효성 검사
- [ ] 로그아웃 Playwright 테스트 -- 시나리오: 로그아웃 후 보호 라우트 접근 불가 / 로그아웃 후 Recoil 상태 초기화 확인
- [ ] 인증 리다이렉트 Playwright 테스트 -- 시나리오: 비인증 상태에서 `/dashboard` 접근 시 `/login` 리다이렉트 / 인증 상태에서 `/login` 접근 시 `/dashboard` 리다이렉트
- [ ] 토큰 갱신 Playwright 테스트 -- 시나리오: 세션 만료 후 자동 갱신 동작 확인 / 갱신 실패 시 `/login` 리다이렉트

### 완료 기준

- 로그인 -> `/dashboard` 접근 가능
- 비인증 상태에서 보호 라우트 접근 시 `/login` 리다이렉트
- 인증 상태에서 `/login` 접근 시 `/dashboard` 리다이렉트
- 로그인/로그아웃 시 Recoil 상태 즉시 반영
- 해당 Phase의 모든 Playwright MCP 테스트가 통과됨

---

## Phase 3: 대시보드 UI -- 진행 중

**목표**: 사용자/관리자 대시보드 기본 기능 구현

### 완료

- [x] frontend 대시보드 기본 레이아웃 (`(dashboard)/layout.tsx`)

### 미완료

- [ ] 프로필 수정 기능 (이름, 아바타 URL 변경) -- 난이도: 중, 예상: 2d
- [ ] admin 사용자 목록 페이지 (@tanstack/react-query 기반) -- 난이도: 중, 예상: 2d
- [ ] 관리자 역할 변경 기능 (user <-> admin) -- 난이도: 중, 예상: 1.5d

### 테스트 (Playwright MCP)

- [ ] 프로필 수정 Playwright 테스트 -- 시나리오: 이름 변경 후 저장 성공 / 아바타 URL 변경 후 반영 확인 / 빈 이름으로 저장 시 유효성 검사 / 비인증 상태에서 프로필 수정 API 호출 시 차단
- [ ] 사용자 목록 조회 Playwright 테스트 -- 시나리오: 관리자 계정으로 전체 사용자 목록 표시 / 일반 사용자 계정으로 접근 시 권한 거부 / 목록 데이터가 올바르게 렌더링됨
- [ ] 역할 변경 Playwright 테스트 -- 시나리오: 관리자가 user -> admin 역할 변경 성공 / admin -> user 역할 변경 성공 / 일반 사용자가 역할 변경 시도 시 차단 / 자기 자신의 역할 변경 시 엣지 케이스 처리

### 완료 기준

- 사용자가 자신의 프로필 정보를 수정하고 저장할 수 있음
- 관리자가 전체 사용자 목록을 조회할 수 있음
- 관리자가 특정 사용자의 역할을 변경할 수 있음
- 해당 Phase의 모든 Playwright MCP 테스트가 통과됨

---

## Phase 4: 안정화 및 스타터킷 완성 -- 예정

**목표**: 프로덕션 수준의 안정성 확보 및 재사용 가능한 스타터킷 완성

- [ ] admin RLS 정책 설계 (관리자만 전체 데이터 접근) -- 난이도: 상, 예상: 2d
- [ ] `profiles` 테이블 RLS 정책 (본인 데이터만 수정 가능) -- 난이도: 중, 예상: 1d
- [ ] 에러 처리 통합 (Axios 에러 -> toast 알림) -- 난이도: 중, 예상: 1d
- [ ] `libs/` vs `lib/` 디렉토리 네이밍 통일 결정 및 적용 -- 난이도: 하, 예상: 0.5d
- [ ] 스타터킷 사용 가이드 작성 (README) -- 난이도: 하, 예상: 1d

### 테스트 (Playwright MCP)

- [ ] RLS 정책 검증 Playwright 테스트 -- 시나리오: 일반 사용자가 타인의 프로필 수정 시도 시 차단 / 일반 사용자가 본인 프로필만 수정 가능 / 비인증 상태에서 profiles 데이터 접근 시 차단
- [ ] 관리자 RLS 정책 검증 Playwright 테스트 -- 시나리오: 관리자가 전체 사용자 데이터 조회 가능 / 일반 사용자가 관리자 전용 API 호출 시 403 응답 / 관리자가 사용자 역할 변경 가능
- [ ] 에러 처리 통합 Playwright 테스트 -- 시나리오: Axios 에러 발생 시 toast 알림 표시 / 네트워크 오류 시 사용자 친화적 에러 메시지 / 401 응답 시 자동 리다이렉트 동작

### 완료 기준

- RLS 정책이 적용되어 비인가 데이터 접근 차단됨
- 스타터킷을 복사하여 새 프로젝트를 5분 내에 시작할 수 있음
- 해당 Phase의 모든 Playwright MCP 테스트가 통과됨

---

## 리스크 및 미결정 사항

| 항목 | 영향도 | 상태 | 비고 |
|------|--------|------|------|
| admin RLS 정책 미설계 | 높음 | 미결정 | Phase 4에서 설계 필요. 관리자만 전체 데이터 접근 가능하도록 정책 수립 |
| shadcn/ui base-nova 제약 | 중간 | 인지됨 | `asChild` prop 없음. 신규 개발자 온보딩 시 가이드 필요 |
| `libs/` vs `lib/` 네이밍 불일치 | 낮음 | 미결정 | admin `src/libs/` vs frontend `src/lib/` -- 통일 여부 결정 필요 |
| Supabase 스키마 관리 방식 | 중간 | 관찰 중 | 현재 대시보드 직접 관리. 팀 규모 확장 시 Supabase CLI 마이그레이션 도입 검토 |
| frontend 인증 페이지 미구현 | 높음 | Phase 2 | `/login`, `/register` 라우트가 아직 생성되지 않은 상태 |

---

## Future: MVP 이후 (v2+)

아래 항목은 현재 MVP 범위에 포함되지 않으며, 스타터킷 기반 위에 프로젝트별로 선택 구현한다.

- [ ] OAuth 소셜 로그인 (Google, GitHub 등)
- [ ] 이메일 인증 커스터마이징 (인증 메일 템플릿, 리다이렉트)
- [ ] 관리자 상세 UI (통계 대시보드, 차트, 활동 로그)
- [ ] 파일 업로드 (아바타 이미지, Supabase Storage 연동)
- [ ] 비밀번호 재설정 플로우
- [ ] Supabase CLI 마이그레이션 체계 도입

---

## 진행 상황 추적

**마일스톤 체크포인트**

| 마일스톤 | 기준 | 상태 |
|----------|------|------|
| M1: 인프라 완료 | Phase 1 전체 완료 | 완료 |
| M2: 인증 흐름 완성 | frontend 로그인/회원가입 동작, Recoil 상태 연동 | 진행 중 |
| M3: 대시보드 기능 완성 | 프로필 수정, 사용자 관리 동작 | 예정 |
| M4: 스타터킷 릴리스 | RLS 적용, README 작성, 복사 후 즉시 사용 가능 | 예정 |

**갱신 규칙**: 태스크 완료 시 해당 체크박스를 `[x]`로 변경하고, 마일스톤 상태를 갱신한다.
