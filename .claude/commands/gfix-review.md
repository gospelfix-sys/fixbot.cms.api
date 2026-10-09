---
description: Next.js + Supabase 스택에 특화된 코드 리뷰를 수행합니다
argument-hint: "[파일 경로 또는 기능 설명] (비우면 최근 변경 파일 자동 감지)"
allowed-tools: Read, Glob, Grep, Bash
---

리뷰 대상: $ARGUMENTS

## 실행 순서

### 1단계: 리뷰 대상 파악

- `$ARGUMENTS`가 있으면 해당 파일/기능을 리뷰
- 없으면 최근 변경 파일을 자동 파악:

!`git diff --name-only HEAD~1 2>/dev/null || git status --short`

### 2단계: 코드 읽기

리뷰 대상 파일과 관련 컨텍스트(타입 정의, import 모듈)를 읽는다.

### 3단계: GFix Review 체크리스트 적용

1. **GFix Craft 위반**: 불필요한 의존성, 중복 구현 여부
2. **Next.js 패턴**: Server/Client 컴포넌트 구분, Link/Image 사용
3. **Supabase 패턴**: 올바른 클라이언트 선택, RLS 의존, 에러 처리
4. **Recoil 성능**: 과도한 구독, selector 미활용
5. **Axios 패턴**: 인터셉터 활용, 엔드포인트 관리
6. **일반 품질**: 타입 안전성, 에러 처리, 하드코딩

### 4단계: 리뷰 결과 출력

```
파일: [파일 경로]

[카테고리] ✓/✗ 내용
...

개선 필요: N건 | 통과: N건
판정: APPROVED / NEEDS REVISION
```
