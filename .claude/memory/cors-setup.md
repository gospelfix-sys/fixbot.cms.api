# CORS 설정

## 구현 위치

| 역할 | 파일 |
|---|---|
| Preflight(OPTIONS) 처리 + 실제 요청 CORS 헤더 주입 | `src/middleware.ts` |
| 개발 전용 진단 엔드포인트 보호 | `src/app/api/debug-env/route.ts` |

> `next.config.mjs`의 `headers()`는 사용하지 않음. 정적 문자열만 지원해 다중 도메인 제어 불가. 모든 CORS 로직은 `middleware.ts` 단일 위치에서 관리.

## 허용 도메인 관리

환경변수 `CORS_ALLOWED_ORIGINS`(콤마 구분 문자열)가 단일 진실 공급원.
설정이 없으면 `http://localhost:3001`만 fallback으로 허용.

```bash
# .env.local 또는 배포 환경변수
CORS_ALLOWED_ORIGINS=https://yourfrontend.com,https://admin.yourfrontend.com
```

도메인 추가/제거 시 **코드 변경 없이 환경변수만 수정**.

## 핵심 구현 규칙

1. **OPTIONS는 API 경로만 처리**
   `isPublicApiPath()` 체크 없이 최상단에 두면 어드민 경로 Preflight도 허용하게 됨.
   비API 경로의 OPTIONS → `405`, 미허용 Origin → `403`.

2. **`Authorization` 헤더 미허용**
   인증은 `X-API-Key`만 사용하므로 `Access-Control-Allow-Headers`에서 제외.
   허용 헤더: `Content-Type, X-API-Key`

3. **`Vary: Origin` 필수**
   CDN/프록시가 Origin별로 캐시를 분리하도록 Preflight + 실제 응답 모두에 첨부.

4. **`Access-Control-Max-Age` 환경별 분기**
   ```ts
   process.env.NODE_ENV === 'production' ? '86400' : '0'
   ```
   개발 중 캐시로 인한 CORS 디버깅 오류 방지.

5. **`Set.has()` 조회**
   `Object.values().includes()` 대신 `Set<string>`으로 O(1) 도메인 조회.

6. **`debug-env` 라우트 가드**
   `NODE_ENV !== 'development'`이면 404 반환. 실서비스에서 환경변수 정보 노출 방지.

## 동작 흐름

```
브라우저 → OPTIONS /api/v1/*
  → middleware: isPublicApiPath? YES
  → getCorsOrigin: 허용 목록에 있으면 origin 반환, 없으면 ''
  → 204 + CORS 헤더 반환 (또는 403 차단)

브라우저 → GET /api/v1/*
  → middleware: CORS 헤더 주입 후 next()
  → route 핸들러: validateApiKey → 데이터 응답
```

## ADMIN_PATHS vs matcher 동기화 주의

`ADMIN_PATHS` 배열과 `config.matcher` 배열이 별도 관리됨.
새 어드민 경로 추가 시 **두 곳을 동시에 수정**해야 미들웨어가 실행되고 보호가 적용됨.
