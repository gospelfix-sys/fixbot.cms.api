# Supabase 내장 기능 목록 (4단계 [SUPA] 참조)

직접 구현 전 Supabase가 이미 제공하는지 확인한다.

## 인증 (Auth)

| 필요 기능 | Supabase 방법 | 직접 구현 불필요 |
|-----------|--------------|-----------------|
| 이메일/비밀번호 로그인 | `supabase.auth.signInWithPassword()` | ✓ |
| 회원가입 | `supabase.auth.signUp()` | ✓ |
| 로그아웃 | `supabase.auth.signOut()` | ✓ |
| 소셜 로그인 | `supabase.auth.signInWithOAuth()` | ✓ |
| 세션 가져오기 | `supabase.auth.getSession()` | ✓ |
| 현재 유저 | `supabase.auth.getUser()` | ✓ |
| 비밀번호 재설정 | `supabase.auth.resetPasswordForEmail()` | ✓ |
| 이메일 변경 | `supabase.auth.updateUser()` | ✓ |
| 세션 갱신 | `supabase.auth.refreshSession()` | ✓ |
| 인증 상태 구독 | `supabase.auth.onAuthStateChange()` | ✓ |
| 매직 링크 | `supabase.auth.signInWithOtp()` | ✓ |

## 데이터베이스 (PostgREST)

| 필요 기능 | Supabase 방법 |
|-----------|--------------|
| 데이터 조회 | `supabase.from('table').select()` |
| 조건 필터 | `.eq()`, `.gt()`, `.lt()`, `.like()`, `.in()` |
| 정렬 | `.order('column', { ascending: false })` |
| 페이지네이션 | `.range(0, 9)` |
| 단일 행 | `.single()` |
| 삽입 | `.insert({})` |
| 수정 | `.update({}).eq('id', id)` |
| 삭제 | `.delete().eq('id', id)` |
| Upsert | `.upsert({})` |

## 접근 제어 (RLS)

- 행 단위 권한은 RLS 정책으로 처리 — 애플리케이션 코드에서 권한 체크 로직 구현 불필요
- `auth.uid()` 함수로 현재 유저 ID를 SQL 정책에서 직접 사용

```sql
-- 예시: 본인 데이터만 조회 허용
CREATE POLICY "users_own_data" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

## 실시간 (Realtime)

| 필요 기능 | Supabase 방법 |
|-----------|--------------|
| 테이블 변경 구독 | `supabase.channel().on('postgres_changes', ...)` |
| Presence (온라인 상태) | `supabase.channel().track()` |
| Broadcast | `supabase.channel().send()` |

## 파일 저장 (Storage)

| 필요 기능 | Supabase 방법 |
|-----------|--------------|
| 파일 업로드 | `supabase.storage.from('bucket').upload()` |
| 파일 다운로드 URL | `.getPublicUrl()` |
| 서명된 URL | `.createSignedUrl()` |
| 파일 삭제 | `.remove()` |

## 서버 로직 (Edge Functions)

- 복잡한 비즈니스 로직, 외부 API 호출, 크론 작업 → Supabase Edge Functions (Deno)
- Next.js API Route Handler 대신 사용 가능

## 이 프로젝트의 Supabase 클라이언트 패턴

```typescript
// 클라이언트 컴포넌트 → src/lib/supabase/client.ts
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// 서버 컴포넌트 → src/lib/supabase/server.ts
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// admin 앱 → src/libs/supabase/client.ts (libs, 복수형 주의)
```
