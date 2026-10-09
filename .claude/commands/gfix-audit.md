---
description: 저장소 전체를 감사하여 중복, 불일치, 미사용 코드를 탐지합니다
allowed-tools: Read, Glob, Grep, Bash
---

## 실행 순서

### 1단계: 저장소 구조 파악

!`find . -path ./node_modules -prune -o -name "package.json" -print | grep -v node_modules`

### 2단계: frontend ↔ admin 중복 탐지

!`diff <(ls frontend/src/lib/supabase/ 2>/dev/null) <(ls admin/src/libs/supabase/ 2>/dev/null)`

### 3단계: 패키지 버전 비교

!`node -e "const f=require('./frontend/package.json');const a=require('./admin/package.json');const keys=Object.keys({...f.dependencies,...f.devDependencies});keys.forEach(k=>{const fv=(f.dependencies||{})[k]||(f.devDependencies||{})[k];const av=(a.dependencies||{})[k]||(a.devDependencies||{})[k];if(fv&&av&&fv!==av)console.log(k+': frontend='+fv+' admin='+av)});" 2>/dev/null`

### 4단계: 하드코딩 탐지

!`grep -rn "https\?://" --include="*.ts" --include="*.tsx" frontend/src/ admin/src/ 2>/dev/null | grep -v ".env" | grep -v "supabase.co" | head -20`

### 5단계: 감사 결과 출력

발견된 이슈를 우선순위별로 정리하여 보고한다.
```
=== GFix Audit 결과 ===
[중복] N건
[불일치] N건  
[하드코딩] N건
총 이슈: N건
```

> TODO/FIXME 추적은 `/gfix-debt` 커맨드를 사용한다.
