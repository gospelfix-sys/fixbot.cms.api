---
description: Next.js/Supabase 프로젝트의 성능 개선 기회를 분석합니다
allowed-tools: Read, Glob, Grep, Bash
---

## 실행 순서

### 1단계: 불필요한 Client Component 탐지

!`grep -rn "'use client'" --include="*.tsx" . 2>/dev/null | grep -v node_modules`

각 파일을 읽어 `useState`, `useEffect`, `onClick` 등 클라이언트 기능 없이 `'use client'`만 있는지 확인한다.

### 2단계: N+1 쿼리 탐지

!`grep -rn "supabase.from" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules`

루프 내부에서 반복 호출되는 패턴을 식별한다.

### 3단계: select('*') 탐지

!`grep -rn "select(['\"]\\*['\"])" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules`

### 4단계: img 태그 탐지 (next/image 미사용)

!`grep -rn "<img " --include="*.tsx" . 2>/dev/null | grep -v node_modules`

### 5단계: 성능 분석 결과 출력

발견된 개선 기회를 HIGH/MED/LOW 우선순위로 정리하여 보고한다.

```
=== GFix Gain 분석 결과 ===
[HIGH] ...
[MED]  ...
[LOW]  ...
총 개선 기회: N건
```
