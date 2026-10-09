---
name: ask-sonner
description: React 토스트 라이브러리인 Sonner 사용 가이드 — Toaster 설치·연동, 알맞은 toast() 호출 선택, promise/loading 토스트, 업데이트·닫기·유지, 스타일링, 테마, 아이콘, 위치 지정 및 다중 toaster. Sonner를 다루거나 문제를 해결할 때 사용 — 토스트가 안 뜨거나, 두 번 뜨거나, 스타일이 깨지거나, Tailwind 클래스를 무시하거나, 모달 뒤에 깔리거나, 다크 모드를 따르지 않을 때.
---

# Sonner 다루기

토스트 라이브러리 [Sonner](https://sonner.emilkowal.ski)를 위한 가이드 스킬이다. Sonner와 관련된 작업 — 연동, 토스트 렌더링, 스타일링, 문제 해결 — 이라면 먼저 이 파일에서 답을 찾는다. `<Toaster />`와 `toast()`의 전체 prop 표는 [API.md](API.md)에 있으니, 정확한 prop 이름·타입·기본값이 필요할 때 참고한다.

## 설정

두 가지, 딱 두 가지뿐이다:

1. **`<Toaster />` 하나를, 한 번만** 루트에 최대한 가깝게 마운트한다 (Next.js에서는 `layout.tsx` — 서버 컴포넌트 안에서도 동작한다). 페이지마다, 또는 조건부로 렌더링하지 않는다 — Toaster가 두 번 마운트되면 모든 토스트가 중복된다.
2. **`toast()`는 클라이언트 코드에서 호출한다** — 이벤트 핸들러, effect, 콜백에서. 단순한 함수라 훅이나 provider가 필요 없지만, 서버에서는 아무 동작도 하지 않는다: 서버 액션에서는 결과를 반환하고, 그 결과를 받는 클라이언트 코드에서 `toast()`를 호출한다.

```jsx
import { Toaster } from 'sonner'; // layout에서 한 번만
import { toast } from 'sonner';   // 클라이언트 사이드 어디서든
```

## 알맞은 호출 고르기

| 원하는 것 | 호출 |
| --- | --- |
| 단순 메시지 | `toast('Title')` — 두 번째 줄이 필요하면 `{ description }` 추가 |
| 성공 / 오류 / 정보 / 경고 아이콘 | `toast.success('…')`, `toast.error('…')` 등 |
| 상태를 직접 관리하며 보여줄 스피너 | `toast.loading('…')` 후 id로 업데이트 |
| promise에 연결된 loading → success/error | `toast.promise(promise, { loading, success, error })` — success/error는 resolve된 값/에러를 받는 함수도 가능 |
| 뭔가 동작하는 버튼 | `{ action: { label, onClick } }` — `onClick`에서 `event.preventDefault()`를 호출하지 않는 한 토스트가 닫힘; `cancel`은 보조 variant |
| 커스텀 JSX, 기본 토스트 셸 유지 | `toast(<jsx />)` |
| 커스텀 JSX, 스타일 완전 제거 | `toast.custom((t) => <jsx />)` — headless, `t`로 해당 id를 받아 닫기 가능 |

## 레시피

**토스트 업데이트** — 같은 `id`로 `toast()`를 다시 호출한다; 전달한 prop만 바뀐다. `toast.success(…, { id })`로 전환하면 타입이 바뀐다. `toast.promise` 없이 loading → success 흐름을 만드는 방법이 이것이다:

```jsx
const id = toast.loading('Uploading…');
toast.success('Uploaded', { id });
```

**유지** — `{ duration: Infinity }`. **닫기** — `toast.dismiss(id)`, 전체는 `toast.dismiss()`. **활성 토스트 읽기** — React 안에서는 `useSonner()`, 밖에서는 `toast.getActiveToasts()`.

**텍스트 안의 링크나 컴포넌트** — 제목이나 설명에 함수를 전달한다: `toast(() => <a href="…">View</a>)`.

**다중 toaster** — 각각에 `id`를 부여하고 `toast('…', { toasterId: 'canvas' })`로 대상을 지정한다. `toasterId`가 없으면 모든 toaster가 해당 토스트를 렌더링한다.

**닫힘 콜백** — `onDismiss`는 닫기 버튼이나 스와이프에서, `onAutoClose`는 타임아웃에서 발생한다. 둘은 별개이며, 단일 "닫힘" 콜백은 없다.

## 스타일링 — 단계적 에스컬레이션

변경에 필요한 만큼만 올라간다; 처음부터 최상단으로 바로 가는 건 괜찮지만(권장되는 최종 상태), 중간 단계에 머무르는 건 좋지 않다.

1. **기본값** — Toaster에 `richColors`를 추가하면 성공/오류가 컬러풀해지고, `invert`로 테마 반전이 가능하다.
2. **인라인 조정** — 모든 토스트에는 Toaster의 `toastOptions={{ style: {…} }}`, 개별 호출에는 `toast()`의 `style`.
3. **부분별 클래스** — `toastOptions={{ classNames: { toast, title, description, actionButton, cancelButton, closeButton } }}`. Sonner가 주입한 스타일이 캐스케이드에서 이기므로, 모든 클래스에 `!important`가 필요하다(Tailwind: `!text-red-900`). important를 여러 곳에 붙이고 있다면 멈추고 — headless로 간다.
4. **Headless** — 자체 JSX로 `toast.custom()`을 쓰되 Sonner의 위치 지정, 스태킹, 스와이프는 유지한다. 디자인 시스템 토스트에 권장되는 방식: 자체 `toast()` 추상화로 감싼다. (`unstyled: true`가 중간 단계로 존재하지만, 같은 노력으로 headless가 더 많은 통제권을 준다.)

**아이콘** — Toaster의 `icons` prop으로 타입별 기본값을 교체하고, 토스트별로는 `icon`, 제거하려면 `null`.

**테마** — `theme`는 기본값이 `'light'`이며 OS를 따라가지 않는다. `theme="system"`을 전달하거나, `next-themes`의 `<Toaster theme={resolvedTheme} />`처럼 테마 provider와 연결한다.

## 문제 해결

| 증상 | 원인 → 해결 |
| --- | --- |
| 토스트가 전혀 안 뜸 | `<Toaster />`가 마운트되지 않았거나 언마운트됨(조건부 렌더링, 페이지별 배치). 루트에 하나 마운트한다. 서버 액션에서 호출하는 경우: `toast()`는 클라이언트 전용 — 액션 결과를 받은 클라이언트에서 호출한다. |
| 같은 토스트가 두 번 뜸 | Toaster가 두 곳(layout **과** page)에 마운트됨 — 하나만 유지. 또는 React StrictMode의 개발 모드 이중 호출로 effect에서 `toast()`가 발화됨 — 이벤트 핸들러에서 발화하거나, 안정적인 `id`를 전달해 두 번째 호출이 중복이 아닌 업데이트가 되게 한다. |
| Tailwind/CSS 클래스가 안 먹힘 | 기본 스타일이 덮어씀. `!important`를 붙이거나 `unstyled` / headless를 사용한다(위 단계 참고). |
| 토스트가 완전히 스타일 없이 렌더링됨(Astro, view transitions에서 흔함) | Sonner가 주입한 스타일시트가 유실됨 — layout에서 명시적으로 임포트: `import 'sonner/dist/styles.css'`. |
| Shadow DOM 안에서 스타일 없음 | 스타일이 shadow root가 아닌 `document.head`에 들어감. `[data-sonner-toaster]`를 포함한 style 태그를 shadow root로 복사한다. |
| 모달/오버레이 뒤에 가려지거나 잘림 | 조상 요소가 스태킹 컨텍스트를 만들거나(`transform`, `filter`, `overflow`) 오버레이의 z-index가 더 높음. `<Toaster />`를 다이얼로그/포털 컨테이너 밖, 문서 루트로 옮긴다. |
| 다크 모드 무시됨 | `theme` 기본값이 `'light'` — `theme="system"`을 설정하거나 resolve된 테마를 전달한다(위 테마 항목 참고). |
| 성공/오류가 녹색/빨강이 아니라 회색 | 기본 동작이다. Toaster에 `richColors`를 추가한다. |
| 토스트가 절대 안 닫힘 | `duration: Infinity`, `dismissible: false`, 또는 절대 settle되지 않는 promise를 쓴 `toast.promise` — loading 토스트가 무한 대기한다. |
| `toast.promise`가 loading에서 멈춤 | 첫 인자로 promise(또는 promise를 반환하는 함수)가 필요하며, 그 promise가 실제로 resolve/reject되어야 한다. |
| 스와이프로 닫기 방향이 반대이거나 안 됨 | 방향은 `position`에서 파생된다. Toaster의 `swipeDirections`로 재정의한다. |
| 모든 toaster에 토스트가 뜸 | 다중 toaster는 지정이 필요하다: 각 Toaster에 `id`를 부여하고 `toast()` 호출에 `toasterId`를 전달한다. |
| 모바일에서 토스트가 화면 가장자리에 너무 붙음 | `offset`(데스크톱, 기본 32px)과 `mobileOffset`(<600px, 기본 16px) — 숫자, CSS 문자열, 또는 방향별 객체로 지정 가능. |
