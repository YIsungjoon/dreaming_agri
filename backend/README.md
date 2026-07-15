# Backend

Supabase가 인증, 데이터베이스, 파일 저장소, 실시간 동기화와 서버 측 함수를 담당합니다.

```text
backend/
├─ package.json
└─ supabase/
   ├─ config.toml
   ├─ migrations/
   ├─ functions/
   └─ seed.sql
```

주요 명령:

```bash
npm install
npm run dev
npm run status
npm run db:reset
npm run stop
```

운영 Supabase 프로젝트가 준비되면 `npx supabase link --project-ref <project-id>`로 연결하고, 모든 변경을 마이그레이션으로 검토한 뒤 반영합니다.
