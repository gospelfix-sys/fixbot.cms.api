# GospelFix 개발 철학

이 문서는 GospelFix 프로젝트의 코드 작성 원칙을 정의한다.
모든 구현 결정은 이 철학을 전제로 내려진다.

---

## 핵심 원칙

- **코드는 적을수록 좋다** — 가장 좋은 코드는 작성하지 않은 코드다
- **추상화는 세 번 반복될 때만 허용한다** — 두 번은 복사, 세 번째에 추출
- **Supabase가 할 수 있는 것을 앱 코드로 구현하지 않는다** — RLS, Auth, Storage, Realtime 우선
- **타입은 any 없이** — 타입 안전성은 협상 불가
- **에러는 조용히 삼키지 않는다** — 모든 에러는 처리하거나 전파한다
- **지금 필요한 것만 구현한다** — "나중에 유용할 것 같아서"는 금지

---

## GFix Craft 결정 사다리

코드를 작성하기 전 반드시 9단계를 순서대로 통과해야 한다.
이전 단계에서 해결되면 즉시 멈추고 그 방법을 사용한다.

```
1. [NEED]    지금 이 기능 없으면 동작 안 되나?
2. [EXIST]   frontend/src/lib(hooks/store) 또는 admin/src/libs/ 에 이미 있나?
3. [NEXT]    Next.js 내장 기능으로 처리되나? (Server Actions, Route Handlers 등)
4. [SUPA]    Supabase가 처리하나? (Auth, RLS, Storage, Realtime, Edge Functions)
5. [PKG]     설치된 패키지로 되나? (zod, react-hook-form, shadcn/ui, recoil 등)
6. [PATTERN] 기존 lib/axios/, lib/supabase/ 패턴 확장으로 되나?
7. [INLINE]  10줄 이하 인라인으로 해결되나?
8. [SHARED]  두 앱 모두 필요한가? (packages/shared/ 현재 미존재)
9. [BUILD]   위 모두 해당 없을 때만: 최소 구현, 최소 파일, 최소 의존성
```

스킬: `.claude/skills/gfix-*/` · 커맨드: `.claude/commands/gfix-*.md` · `/gfix-help`로 전체 목록 확인

---

## 경고 신호

아래 상황이 오면 즉시 결정 사다리로 돌아간다:

- `yarn add`를 하려는 순간 → 5단계 재확인
- 새 파일을 3개 이상 만들려는 순간 → 9단계 재검토
- "나중에 유용할 것 같아서" → 1단계 위반
- Supabase 기능을 직접 구현하려는 순간 → 4단계 재확인
- 동일 패턴이 두 번째 등장 → 6단계 또는 8단계 적용
