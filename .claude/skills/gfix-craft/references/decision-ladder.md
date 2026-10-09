# GFix Craft 결정 사다리 — 빠른 체크리스트

코드 작성 전 이 체크리스트를 순서대로 확인한다.

## 체크리스트

```
□ 1. [NEED]    지금 이 기능 없으면 동작 안 되나?
□ 2. [EXIST]   src/lib/, src/hooks/, src/store/, src/components/ui/ 에 있나?
□ 3. [NEXT]    Next.js 내장 (Server Action, Route Handler, next/image 등) 인가?
□ 4. [SUPA]    Supabase (auth, RLS, Storage, Realtime, Edge Functions) 인가?
□ 5. [PKG]     설치된 패키지 (zod, react-hook-form, shadcn/ui 등) 로 되나?
□ 6. [PATTERN] lib/axios/, lib/supabase/ 기존 패턴 확장으로 되나?
□ 7. [INLINE]  10줄 이하, 인라인 처리 가능한가?
□ 8. [SHARED]  두 앱 모두 필요한가? → packages/shared/ 검토 (현재 미존재, 도입 시 turborepo 필요)
□ 9. [BUILD]   위 모두 해당 없을 때만: 최소 구현
```

## 경고 신호 (즉시 중단하고 재검토)

- `yarn add`을 하려는 순간 → 5단계 재확인
- 새 파일을 3개 이상 만들려는 순간 → 9단계 재검토
- "나중에 유용할 것 같아서" 라는 생각 → 1단계 재확인
- 동일 패턴의 코드가 두 번째 등장 → 6단계 또는 8단계 적용
- Supabase 기능을 직접 구현하려는 순간 → 4단계 재확인

## 성과 기준 (gospelfix 목표)

- 코드 라인 54% 감소 목표
- 신규 npm 의존성 0개 (기존 패키지로 해결)
- 새 파일 최소화 (기존 파일 확장 우선)
