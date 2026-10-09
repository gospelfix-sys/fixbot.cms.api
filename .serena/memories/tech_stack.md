# Tech Stack

- Next.js 14.2 (App Router), React 18, TypeScript 5, Node >=22
- 상태/데이터: @tanstack/react-query 5 (Recoil 완전 제거됨 — package.json에 recoil 의존성 없음, `mem:known_drift` 참고)
- UI: shadcn/ui + Tailwind CSS v4(@tailwindcss/postcss) + tailwindcss-animate/tw-animate-css
- 폼: react-hook-form + Zod + @hookform/resolvers
- 리치 텍스트: Tiptap (starter-kit, link, placeholder, underline) — 블로그/포트폴리오 본문
- 인증/DB: Supabase (@supabase/ssr, @supabase/supabase-js)
- HTTP: axios
- API 문서화: @asteasolutions/zod-to-openapi + swagger-ui-react → /api-docs, /api/openapi.json
- 토스트: sonner
- 배포: Vercel, 포트 3001 (dev/start 스크립트에 하드코딩)