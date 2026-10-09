# 기술스택 선택 우선순위 원칙

여러 프로젝트에 걸쳐 재사용하기 위한 범용 체크리스트다. 특정 프로젝트 이름에 종속된 내용이
아니라 "정적 사이트 → 프레임워크 전환" 또는 "새 프로젝트 스택 결정" 상황에서 반복적으로
적용할 판단 기준을 정리했다. 실제 적용 사례는 맨 아래 "적용 사례" 절 참고.

## 우선순위 (위에서부터 순서대로 적용)

1. **형제/레퍼런스 프로젝트가 있으면 그 버전과 동일하게 맞춘다.**
   같은 백엔드를 공유하거나 유지보수 주체가 같은 프로젝트가 이미 존재하면, 새 스택을
   독자적으로 고르지 않고 그 프로젝트의 패키지 버전·컨벤션·폴더 구조를 그대로 따른다.
   버전 불일치는 장기적으로 유지보수 비용과 코드 재사용성 저하로 이어진다.
   → 한쪽에서 보안 패치 등으로 버전을 올리면 **반드시 다른 쪽도 같이 올린다.**

2. **지금 당장 필요한 핵심 스택만 먼저 설치하고, 기능별 의존성은 그 기능을 만들 때 추가한다.**
   "핵심 스택"은 아래 카테고리처럼 프로젝트 전체의 뼈대가 되는 것만 가리킨다 — 이 categories에
   드는 것만 초기 세팅 단계에서 확정·설치하고, 그 외는 전부 미룬다.

   | 카테고리 | 이번 프로젝트(go.daepae)에서 고른 것 |
   |---|---|
   | 런타임/언어 | Node.js ≥22, TypeScript 5 |
   | 프레임워크 | Next.js 14(App Router) + React 18 |
   | 스타일링 엔진 | Tailwind CSS v4 (`@tailwindcss/postcss`, `postcss`, `autoprefixer`) |
   | UI 컴포넌트 기반 | shadcn/ui 체계(`class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, CLI `shadcn`) |
   | 린트/포맷 | ESLint(`eslint-config-next`, `eslint-config-prettier`, `eslint-plugin-prettier`) + Prettier |
   | 패키지 매니저 | yarn (레퍼런스와 동일하게 고정, npm과 혼용 안 함) |

   반대로 **특정 기능에만 쓰이는 의존성**(아래는 이번 프로젝트에서 실제로 미뤄둔 예)은 그
   기능을 실제로 구현하는 단계가 오기 전까지 설치하지 않는다:
   `@supabase/*`(DB/인증), `@tanstack/react-query`(서버 상태), `react-hook-form`+`zod`+
   `@hookform/resolvers`(폼 검증), `@tiptap/*`(리치 에디터), `swagger-ui-react`(API 문서),
   `axios`, `next-themes`, `sonner`, `date-fns`, `react-day-picker`, 개별 `@radix-ui/*`
   (shadcn CLI로 컴포넌트를 추가할 때 자동 설치되므로 미리 깔 필요 없음).

3. **기존에 동작하던 것은 새 스택 세팅 단계에서 손대지 않는다.**
   전환 작업을 "환경 세팅"과 "콘텐츠/로직 이식"으로 분리한다. 환경 세팅 단계에서는 기존
   소스(정적 파일, 레거시 코드 등)를 그대로 두고 새 스택을 옆에 독립적으로 구축해, 언제든
   기존 버전으로 되돌아갈 수 있는 상태를 유지한다. 이식은 별도 단계로 넘긴다.

4. **레퍼런스를 따르되, 레퍼런스의 결함까지 복제하지 않는다.**
   버전과 핵심 구조는 레퍼런스와 맞추더라도, 레퍼런스에 있는 미완성 설정(예: 린터/포매터
   설정 파일 부재, 문서화 누락)은 그대로 베끼지 말고 실제로 동작하는 상태로 새로 채워
   넣는다. "동일하게 맞춘다"는 원칙이 "레퍼런스의 버그까지 재현한다"를 의미하지 않는다.

5. **이미 여러 번 확정된 디자인/스타일 자산은 재작성하지 않고 이식한다.**
   디자인 토큰, CSS, 애니메이션 등이 이미 픽셀 단위로 여러 차례 피드백을 거쳐 확정된
   상태라면, 새 스택의 관용적 방식(예: 유틸리티 클래스 재작성)으로 갈아엎지 않는다. 기존
   스타일시트를 그대로 global import 하는 등 "새 스택 위에 기존 결과물을 얹는" 방식을
   우선한다. 스타일 재작성은 별도로 명시적인 요청이 있을 때만 진행한다.

## 판단이 갈릴 때 (트리아지 기준)

레퍼런스나 신규 후보 스택 요소를 검토할 때는 아래 두 갈래로 나눠 명시적으로 보고한다.

- **그대로 가져올 만한 부분**: 프레임워크/언어/스타일링 등 뼈대, 폴더 alias 구조,
  검증된 아키텍처 패턴(예: 클라이언트 분리 패턴, 서버 액션 패턴)
- **그대로 가져오면 안 되는 부분**: 미완성 설정, 인증·배포·보안 관련 구성(다른 도메인/
  운영 환경에 종속적인 부분), 알려진 결함

## 검증 순서

전환/세팅이 끝났다고 보고하기 전에 최소한 아래를 확인한다.

1. 신규 스택에서 install/build/lint(또는 해당 언어의 동급 명령)가 에러 없이 통과하는가
2. 기존 소스가 `git status`상 전혀 변경되지 않았는가 (회귀 없음)
3. 기존 사이트/앱과 신규 스택 결과물을 스크린샷 등으로 비교해 시각적으로 동일한가

---

## 적용 사례 (go.daepae, 2026-09-22)

이 원칙은 `go.daepae`(고품격대패 랜딩) 프로젝트를 정적 HTML/CSS/JS에서 Next.js로 전환할 때
실제로 적용한 결정에서 뽑아냈다.

- **레퍼런스**: 형제 프로젝트 `go.daepae.cms.api`(Next.js 14 App Router 기반 CMS 백오피스)와
  핵심 패키지 버전을 동일하게 맞췄다(Next.js 14.2.35, React 18, TypeScript 5, Tailwind v4,
  shadcn/ui 기반). 이후 `next` 보안 취약점(CVE-2025-55184/67779)이 발견됐을 때도 두 저장소
  모두 `14.2.3 → 14.2.35`로 함께 올렸다.
- **핵심 스택만 우선 설치 (실제 설치한 정확한 패키지·버전)**:
  - `next@14.2.35`(보안 패치 버전, 최초 설치는 `14.2.3`이었다가 CVE-2025-55184/67779 대응으로 업그레이드), `react@^18`, `react-dom@^18`
  - `typescript@^5`, `@types/node@^20`, `@types/react@^18`, `@types/react-dom@^18`
  - Tailwind v4: `tailwindcss@^4.3.3`, `@tailwindcss/postcss@^4.3.3`, `postcss@^8.5.19`, `autoprefixer@^10.5.4`, `tailwindcss-animate@^1.0.7`, `tw-animate-css@^1.4.0`
  - shadcn/ui 기반: `class-variance-authority@^0.7.1`, `clsx@^2.1.1`, `tailwind-merge@^3.6.0`, `lucide-react@^1.25.0`, `shadcn@^4.13.1`(CLI, devDependency)
  - Lint/Format(레퍼런스엔 없던 실제 설정 파일을 새로 작성): `eslint@^8`, `eslint-config-next@14.2.35`, `eslint-config-prettier@^10.1.1`, `eslint-plugin-prettier@^5.1.0`, `prettier@^3.1.1`
  - 패키지 매니저: yarn(`yarn.lock`만 사용, npm 사용 안 함), `engines.node >=22.0.0`

  반대로 `@supabase/*`, `@tanstack/react-query`, `react-hook-form`/`zod`/`@hookform/resolvers`,
  `@tiptap/*`, `swagger-ui-react` 등 CMS 어드민 전용 라이브러리는 이번 단계에서 설치하지 않고,
  실제로 그 기능을 마이그레이션할 때 추가하기로 했다.
- **기존 소스 보존**: 환경 세팅 단계(1단계)에서는 `index.html`/`assets/`/`data/`를 전혀
  건드리지 않고, 저장소 루트에 Next.js 프로젝트를 독립적으로 구축했다. 콘텐츠 이식은
  2단계로 분리해 진행했다.
- **레퍼런스의 결함은 복제하지 않음**: 레퍼런스에는 ESLint/Prettier 의존성만 있고 실제
  설정 파일이 없었다 — 이번 세팅에서는 실제로 동작하는 `.eslintrc.json`/`.prettierrc`를
  새로 작성했다.
- **기존 디자인 자산 이식**: 이미 여러 차례 픽셀 단위로 확정된 골드/레드 디자인 CSS
  4종(`init/fonts/animations/style.css`)을 Tailwind로 재작성하지 않고 `src/styles/legacy/`에
  그대로 복사해 global import 했다.

관련 메모리: `.claude/memory/gopumgyeok-nextjs-migration.md`,
`.claude/plans/purring-petting-firefly.md` (git 이력 `c22b979` 커밋 시점 버전).
