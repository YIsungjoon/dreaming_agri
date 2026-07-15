# Frontend

Svelte 5와 SvelteKit 기반 웹 애플리케이션입니다. `@sveltejs/adapter-vercel`을 명시적으로 사용합니다.

```bash
cp .env.example .env
npm install
npm run dev
```

Vercel에서는 이 `frontend` 폴더를 Root Directory로 지정하고 `.env.example`의 공개 Supabase 변수를 프로젝트 환경변수로 등록합니다. 실제 secret/service-role key와 AI API key에는 `PUBLIC_` 접두사를 사용하지 않습니다.
