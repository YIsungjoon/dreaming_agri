# Dreaming Agri

가상 환경데이터를 농장의 생육 상태, 작업 일정, 준비 자원과 작업 기록으로 연결하는 예측형 농장 운영관리 MVP입니다.

이 저장소는 실행 환경의 책임이 섞이지 않도록 세 영역으로 나눕니다.

```text
dreaming_agri/
├─ frontend/              # Svelte 5 + SvelteKit, Vercel 배포
├─ backend/
│  └─ supabase/           # DB, Auth, Storage, Realtime, Edge Functions
├─ ai/                    # 가상데이터, 일정 예측, RAG, 이미지 분석
├─ docs/                  # 아키텍처와 개발 규칙
└─ ref/                   # 기획 원문 PDF
```

## 빠른 시작

요구사항은 Node.js 20 이상, npm, Docker 호환 런타임입니다.

```bash
# 프런트엔드
npm --prefix frontend install
npm run dev:frontend

# Supabase 로컬 스택 (별도 터미널)
npm --prefix backend install
npm run dev:backend
```

프런트엔드는 `http://localhost:5173`, Supabase Studio는 `http://localhost:54323`에서 확인합니다. `npm run dev:backend`가 출력하는 로컬 URL과 publishable key를 `frontend/.env.example`을 참고해 `frontend/.env`에 설정합니다.

Vercel의 Supabase Integration을 사용하는 경우 `frontend`에서 `npx vercel link`와 `npx vercel env pull .env.development.local`을 실행하면 서버 전용 `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`를 사용할 수 있습니다.

## 배포 경계

- Vercel 프로젝트의 Root Directory는 `frontend`로 지정합니다.
- Supabase 스키마 변경은 `backend/supabase/migrations`에 SQL 마이그레이션으로 기록합니다.
- 브라우저에는 Supabase publishable key만 노출합니다. secret/service-role key와 AI 제공자 키는 서버 전용 환경변수로 관리합니다.
- AI 실행 환경은 모델과 처리시간이 정해진 뒤 선택합니다. 프런트엔드가 AI 제공자를 직접 호출하지 않도록 유지합니다.

세부 책임과 MVP 데이터 흐름은 [docs/architecture.md](docs/architecture.md)를 참고하세요.
