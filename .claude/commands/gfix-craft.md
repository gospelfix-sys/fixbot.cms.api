---
description: GFix Craft 결정 사다리를 적용하여 최소 구현으로 기능을 완성합니다
argument-hint: <구현할 기능 설명>
allowed-tools: Read, Glob, Grep, Bash
---

구현 요청: $ARGUMENTS

## 실행 순서

### 1단계: 기존 코드베이스 스캔

기존에 비슷한 코드가 있는지 확인한다. (Claude가 Grep 툴로 직접 검색)

!`find frontend/src admin/src -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | head -50`

### 2단계: GFix Craft 결정 사다리 적용

아래 9단계를 순서대로 확인하고, 해당되는 단계에서 즉시 중단한다.

```
□ 1. [NEED]    지금 이 기능 없으면 동작 안 되나?
□ 2. [EXIST]   src/lib/, src/hooks/, src/store/, src/components/ui/ 에 있나?
□ 3. [NEXT]    Next.js 내장 기능으로 처리되는가?
□ 4. [SUPA]    Supabase 기능으로 처리되는가?
□ 5. [PKG]     이미 설치된 패키지로 가능한가?
□ 6. [PATTERN] 기존 lib/ 패턴 확장으로 처리되는가?
□ 7. [INLINE]  한 줄 / 한 함수로 해결되는가?
□ 8. [SHARED]  두 앱 모두 필요한가?
□ 9. [BUILD]   위 모두 해당 없을 때만 최소 구현
```

### 3단계: 결정 결과 보고

```
[NEED]   ✓/✗
[EXIST]  ✓/✗ (해당 시 파일 경로 명시)
[NEXT]   ✓/✗ (해당 시 내장 기능 명시)
[SUPA]   ✓/✗ (해당 시 API 명시)
[PKG]    ✓/✗ (해당 시 패키지명 명시)
...
결론: N단계에서 해결. [이유]
```

### 4단계: 구현

결정 사다리 결과에 따라 최소한의 코드를 작성한다.
- 새 파일 생성 전 기존 파일 확장 가능한지 재확인
- `yarn add` 전 5단계 재확인 필수
