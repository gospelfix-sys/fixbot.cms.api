---
name: pick-ui-library
description: 엄선된, 취향이 뚜렷한 목록에서 주어진 프런트엔드 작업에 딱 맞는 라이브러리를 고른다 — 숫자, OTP 입력, 차트, 커맨드 메뉴, 가상화, 드래그 앤 드롭, 토스트, 상태 관리, 스타일링 등. 명시적으로 호출됐을 때만 실행되며 스스로 트리거되지 않는다.
disable-model-invocation: true
---

# 올바른 라이브러리 고르기

조회(lookup) 스킬이다. "토스트가 필요해", "드래그 앤 드롭엔 뭘 써야 해?"처럼 작업이 주어지면 아래의 엄선된 목록에서 작업에 맞는 항목을 찾아 라이브러리를 추천한다. 이 목록은 의도적으로, 취향에 따라 고른 선택지들이다 — 사용자가 다른 것을 요청하거나 작업이 정말로 목록에 없는 경우가 아니라면 목록 밖의 대안으로 대체하지 않는다.

## 사용 방법

1. **사용자가 언급한 라이브러리가 아니라 작업 자체를 파악한다.** "드롭다운을 보여줘야 해"는 사용자가 다른 걸 물었더라도 UI 프리미티브 작업(base-ui)이다.
2. **이미 설치된 것을 먼저 확인한다.** `package.json`을 먼저 본다. 프로젝트가 이미 목록에 있는 라이브러리를 쓰고 있다면 그것을 사용한다. 경쟁 라이브러리(예: Virtuoso 대신 react-window)를 쓰고 있다면 추천 사항은 짚어주되, 요청받지 않은 이상 의존성을 함부로 갈아엎지 않는다.
3. **라이브러리 하나를 추천하고**, 한 문장으로 용도를 설명하며, 요청의 일부라면 설치/연동까지 진행한다. 목록에 명확한 답이 있는데 여러 선택지를 나열하지 않는다.
4. 작업이 목록에 없다면 그 사실을 명시적으로 밝히고 자신의 지식을 바탕으로 추천한다 — 단, 엄선된 목록을 벗어났다는 점은 분명히 한다.

## 목록

### UI 컴포넌트 & 프리미티브

| 작업 | 라이브러리 |
| --- | --- |
| 스타일 없는 접근성 UI 컴포넌트(다이얼로그, 팝오버, 메뉴, 셀렉트…) | [base-ui](https://base-ui.com) |
| 커맨드 메뉴 (⌘K 팔레트) | [cmdk](https://cmdk.paco.me) |
| 토스트 / 알림 | [Sonner](https://sonner.emilkowal.ski) |
| 일회용 비밀번호 / 인증 코드 입력 | [input-otp](https://input-otp.rodz.dev) |
| 커스터마이즈 가능한 GUI / 컨트롤 패널 | [Leva](https://github.com/pmndrs/leva) — [dialkit](https://joshpuckett.me/dialkit)도 대안 |

### 모션 & 비주얼

| 작업 | 라이브러리 |
| --- | --- |
| 범용 애니메이션(스프링, 레이아웃 애니메이션, 진입/퇴장) | [motion](https://motion.dev) (Framer Motion) |
| 숫자 애니메이션(카운터, 가격, 통계) | [NumberFlow](https://number-flow.barvian.me) |
| 애니메이션 텍스트 컴포넌트 | [torph](https://torph.lochie.me/) |
| 3D 지구본 | [Cobe](https://cobe.vercel.app) |
| 동적 OG 이미지(HTML/CSS → SVG/PNG) | [Satori](https://github.com/vercel/satori) |
| 구문 강조(syntax highlighting) | [shiki](https://shiki.style) |

스프링, 레이아웃 애니메이션, 퇴장 애니메이션, 제스처 기반 값이 필요할 때 motion을 쓴다. 단순한 hover나 fade는 필요 없다 — 그런 경우엔 순수 CSS transition이 맞는 도구다.

### 차트

| 작업 | 라이브러리 |
| --- | --- |
| 실시간 / 스트리밍 차트 | [Liveline](https://github.com/benjitaylor/liveline) |
| 일반 차트(정적이거나 인터랙티브한 대시보드) | [recharts](https://recharts.org) |

구분 기준: 데이터가 실시간으로 들어오고 차트가 시간과 함께 스크롤된다면 Liveline. 그 외 모든 경우는 recharts.

### 인터랙션 & 성능

| 작업 | 라이브러리 |
| --- | --- |
| 드래그 앤 드롭 | [dnd kit](https://dndkit.com) |
| 가상화(긴 목록, 대용량 테이블) | [Virtuoso](https://virtuoso.dev) |

### 상태 & 스타일링

| 작업 | 라이브러리 |
| --- | --- |
| 상태 관리 | [zustand](https://zustand.docs.pmnd.rs) |
| 조건에 따른 `className` 문자열 구성 | [clsx](https://github.com/lukeed/clsx) |
| Tailwind용 타입 세이프, 베리언트 기반 스타일링 | [cva](https://cva.style) |
| 테마 전환 / 다크 모드(로드 시 깜빡임 없음) | [next-themes](https://github.com/pacocoursey/next-themes) |

스타일링 구분 기준: 임시로 조건부 클래스를 쓸 땐 clsx, 컴포넌트에 타입이 있는 API를 쓸 만한 진짜 베리언트(size, intent, state)가 있다면 cva. 둘은 함께 조합된다 — cva는 내부적으로 clsx 스타일 입력을 사용한다.

## 흔히 놓치는 불일치 사례

- **직접 만들거나 모달 라이브러리로 구현한 토스트** → Sonner가 정확히 이 용도로 존재한다.
- **수동 포커스 처리를 곁들인 `<div>` 기반 드롭다운/다이얼로그** → base-ui가 접근성, 포커스 트래핑, 닫기 처리를 담당한다.
- **텍스트를 다시 렌더링해서 숫자를 애니메이션하는 방식** → NumberFlow가 자릿수 전환을 제대로 처리한다.
- **1,000행 이상의 목록을 직접 렌더링** → 페이지네이션 임시방편 전에 Virtuoso부터.
- **컴포넌트마다 `useState`가 얽혀 만들어진 공유 상태용 props 웹** → zustand.
- **템플릿 리터럴 className 삼중 조건 중첩** → clsx(베리언트 형태라면 cva).
