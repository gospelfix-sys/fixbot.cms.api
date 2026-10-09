---
name: gfix-gain
description: >
  This skill should be used when the user asks about "performance", "optimization",
  "bundle size", "slow rendering", "unnecessary re-renders", "N+1 queries",
  or "how to make this faster". Analyzes the Next.js/Supabase project for
  performance improvement opportunities.
version: 1.0.0
---

# GFix Gain — 성능 메트릭 분석

## 분석 항목

### 1. Next.js 렌더링 최적화

- **불필요한 Client Component**: `'use client'` 지시문이 있지만 클라이언트 기능(useState, 이벤트)을 사용하지 않는 컴포넌트
  - 해결: Server Component로 변경 → 번들 크기 감소
- **데이터 페칭 위치**: 클라이언트에서 `useEffect` + `axios`로 페칭하는 데이터가 Server Component에서 처리 가능한가?
- **이미지 최적화**: `<img>` 태그 사용 → `next/image`로 교체 (자동 WebP 변환, lazy loading)
- **폰트 최적화**: 외부 폰트 URL 직접 사용 → `next/font`로 교체 (자동 서브셋팅)

### 2. Supabase 쿼리 최적화

- **N+1 쿼리**: 루프 안에서 `supabase.from().select()` 호출
  - 해결: PostgREST 관계 쿼리 (`.select('*, related_table(*)')`)
- **과도한 데이터 선택**: `select('*')` 사용 시 필요한 컬럼만 명시
- **인덱스 누락**: 자주 필터링하는 컬럼에 인덱스가 있는가?
- **Realtime 오남용**: 자주 변경되지 않는 데이터에 실시간 구독 사용

### 3. Recoil 성능 (frontend/)

- **과도한 atom 구독**: 컴포넌트가 변경되지 않는 atom 필드를 포함한 전체 객체를 구독
  - 해결: `selector`로 필요한 필드만 파생
- **selector 캐싱 누락**: 매번 새로운 객체/배열을 반환하는 selector → 불필요한 리렌더링
- **atom 갱신 빈도**: 너무 자주 업데이트되는 atom → 디바운스 적용

### 4. 번들 크기

- **불필요한 라이브러리**: 설치되었지만 거의 사용하지 않는 패키지
- **tree-shaking 불가 임포트**: `import * as` 패턴
- **동적 임포트 기회**: 크고 즉시 필요하지 않은 컴포넌트 → `next/dynamic`

## 출력 형식

```
=== GFix Gain 분석 결과 ===

[HIGH] 클라이언트 컴포넌트 3개 → Server Component 전환 가능
  예상 효과: JS 번들 ~15KB 감소

[MED] N+1 쿼리 발견
  위치: src/app/dashboard/page.tsx:34
  현재: 루프에서 10번 쿼리 → 해결: join 쿼리 1번

[LOW] select('*') 2건 → 필요 컬럼만 선택 권장

총 개선 기회: N건 | 예상 성능 향상: ~27%
```
