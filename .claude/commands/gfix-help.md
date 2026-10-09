---
description: GFix Skills 패키지의 사용법과 커맨드 목록을 보여줍니다
---

# GFix Skills — 빠른 참조

## 슬래시 커맨드

| 커맨드 | 설명 | 예시 |
|--------|------|------|
| `/gfix-craft <기능>` | 결정 사다리 적용 후 최소 구현 | `/gfix-craft 사용자 프로필 수정 기능` |
| `/gfix-review [대상]` | 스택 특화 코드 리뷰 | `/gfix-review src/components/Auth.tsx` |
| `/gfix-audit` | 저장소 전체 감사 | `/gfix-audit` |
| `/gfix-debt` | 기술 부채 리포트 | `/gfix-debt` |
| `/gfix-gain` | 성능 개선 기회 분석 | `/gfix-gain` |
| `/gfix-help` | 이 도움말 | `/gfix-help` |

## GFix Craft 결정 사다리 (요약)

```
1. [NEED]    지금 꼭 필요한가?
2. [EXIST]   이미 있는가?
3. [NEXT]    Next.js 내장인가?
4. [SUPA]    Supabase가 처리하는가?
5. [PKG]     설치된 패키지로 되는가?
6. [PATTERN] 기존 lib/ 패턴 확장인가?
7. [INLINE]  한 줄로 되는가?
8. [SHARED]  두 앱 공유인가?
9. [BUILD]   그때만: 최소 구현
```

## 핵심 원칙

- 새 파일 전에 기존 파일 확장을 먼저 고려
- `yarn add` 전에 5단계 재확인
- "나중에 유용할 것 같아서"는 1단계 위반

## 프로젝트 특화 패턴

- Supabase 클라이언트: `src/lib/supabase/` (frontend), `src/libs/supabase/` (admin)
- Axios 인스턴스: `src/lib/axios/instance.ts` (재사용, 새 인스턴스 생성 금지)
- Recoil: `isAuthenticatedSelector`, `isAdminSelector` (atom 직접 구독 대신 selector 활용)
