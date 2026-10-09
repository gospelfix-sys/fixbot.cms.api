---
description: 코드베이스의 기술 부채를 수집하고 우선순위별 행동 목록을 생성합니다
allowed-tools: Read, Glob, Grep, Bash
---

## 실행 순서

### 1단계: TODO/FIXME 태그 수집

!`grep -rn "TODO\|FIXME\|HACK\|XXX\|TEMP\|@deprecated" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules`

### 2단계: 패키지 버전 불일치 확인

!`node -e "const f=require('./frontend/package.json');const a=require('./admin/package.json');const allDeps={...f.dependencies,...f.devDependencies,...a.dependencies,...a.devDependencies};Object.keys(allDeps).forEach(k=>{const fv=(f.dependencies||{})[k]||(f.devDependencies||{})[k];const av=(a.dependencies||{})[k]||(a.devDependencies||{})[k];if(fv&&av&&fv!==av)console.log('[버전불일치] '+k+': f='+fv+' a='+av)});" 2>/dev/null`

### 3단계: 기술 부채 우선순위 분류 및 보고

수집된 정보를 P1~P4로 분류하여 행동 가능한 부채 레지스터를 출력한다.

```
=== GFix Debt 리포트 (날짜) ===

[P1] 즉시 수정 필요
[P2] 이번 스프린트
[P3] 다음 스프린트
[P4] 백로그

총 부채: N건
```
