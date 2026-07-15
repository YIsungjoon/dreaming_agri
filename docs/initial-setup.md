# 초기 설정 작업 기록

작성일: 2026-07-15
상태: 완료

## 1. 완료 범위

프로젝트 기획 PDF를 검토하고 다음 초기 개발·배포 환경을 구성했습니다.

- Svelte 5 + SvelteKit 프런트엔드 생성
- Vercel 배포 어댑터와 GitHub 자동 배포 연결
- Supabase 프로젝트, 데이터베이스 마이그레이션과 RLS 연결
- 프런트엔드, 백엔드, AI 영역의 최상위 폴더 분리
- 환경변수와 비밀키 관리 원칙 정의
- 초기 연결 상태를 확인할 수 있는 소개 화면 구현

## 2. 저장소 구조

```text
dreaming_agri/
├─ frontend/                 # SvelteKit 애플리케이션, Vercel 배포 단위
├─ backend/
│  └─ supabase/              # Supabase 설정, migration, seed, functions
├─ ai/                       # 가상데이터, 예측, RAG, Vision, 평가
├─ docs/                     # 아키텍처와 작업 기록
└─ ref/                      # 기획 원문 PDF
```

실행 환경별 상세 책임은 [architecture.md](architecture.md)를 참고합니다.

## 3. 주요 기술과 버전

| 구분 | 구성 | 초기 설정 버전 |
| --- | --- | --- |
| UI | Svelte | `^5.56.1` |
| Web framework | SvelteKit | `^2.63.0` |
| Deployment adapter | `@sveltejs/adapter-vercel` | `^6.3.4` |
| Supabase client | `@supabase/supabase-js` | `^2.110.5` |
| Supabase SSR helper | `@supabase/ssr` | `^0.12.3` |
| Supabase CLI | `supabase` | `^2.109.1` |

Node.js 20 이상과 npm을 기준으로 합니다. 로컬 Supabase 전체 스택을 실행하려면 Docker Desktop 또는 Docker API 호환 런타임이 필요합니다.

## 4. Vercel 구성

- GitHub 저장소: `YIsungjoon/dreaming_agri`
- Production branch: `main`
- Root Directory: `frontend`
- Framework Preset: SvelteKit
- Build, Install, Output 설정: 프레임워크 기본값 사용
- `@sveltejs/adapter-vercel`을 명시적으로 설치해 배포 버전을 고정
- `main` push 시 Production 자동 배포

저장소 루트를 Vercel Root Directory로 사용하면 루트 `npm install`에서 프런트엔드 의존성이 설치되지 않아 `npm run build`가 exit code 127로 실패합니다. 반드시 `frontend`를 Root Directory로 지정합니다.

Windows 로컬 환경에서는 Vercel 어댑터가 symlink를 생성하는 마지막 패키징 단계에서 `EPERM`이 발생할 수 있습니다. Svelte 컴파일과 타입 검사가 성공하고 Vercel Linux 배포가 성공한다면 애플리케이션 코드 오류는 아닙니다. 필요하면 Windows 개발자 모드나 WSL에서 로컬 패키징을 검증합니다.

## 5. Supabase 구성

| 항목 | 값 |
| --- | --- |
| 프로젝트 이름 | `MYPROJECT_DB` |
| Project ref | `apaetauqwflxzhhdeqap` |
| Project URL | `https://apaetauqwflxzhhdeqap.supabase.co` |
| Postgres major | 17 |
| 연결 방식 | Vercel Storage / Supabase Integration |

로컬 CLI 설정은 다음 원격 프로젝트에 연결되어 있습니다.

```bash
cd backend
npx supabase link --project-ref apaetauqwflxzhhdeqap
```

### 초기 마이그레이션

파일: `backend/supabase/migrations/202607150001_create_countries.sql`

적용 내용:

- `public.countries` 테이블 생성
- Canada, United States, Mexico 샘플 데이터 입력
- Row Level Security 활성화
- `anon`, `authenticated` 역할에 읽기 권한 부여
- 공개 읽기 정책 `public can read countries` 생성

원격 DB에 `supabase db push`로 적용했으며, publishable key를 사용한 REST 조회에서 3개 행이 반환되는 것을 확인했습니다.

## 6. 환경변수와 비밀키

### Production과 Preview

Vercel Supabase Integration이 필요한 환경변수를 Vercel에 자동으로 동기화합니다. 저장소에 실제 값을 작성하지 않습니다.

현재 애플리케이션이 사용하는 값:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

레거시 프로젝트와의 호환을 위해 서버 클라이언트는 `SUPABASE_ANON_KEY`도 인식합니다.

### Local

로컬에서 원격 Supabase를 사용할 때만 다음 명령으로 Vercel 환경변수를 내려받을 수 있습니다.

```bash
cd frontend
npx vercel link
npx vercel env pull .env.development.local
```

`.env`, `.env.local`, `.env.development.local`은 Git에서 제외됩니다. Git에는 변수 이름과 예시만 포함한 `frontend/.env.example`만 저장합니다.

### 보안 원칙

- publishable key는 RLS가 적용되는 사용자용 요청에만 사용합니다.
- `SUPABASE_SECRET_KEY`, service-role key, DB 비밀번호는 브라우저 코드에 사용하지 않습니다.
- 관리자 권한이 필요한 기능이 생기기 전에는 secret key를 애플리케이션 환경변수에 추가하지 않습니다.
- `PUBLIC_` 접두사가 붙은 SvelteKit 환경변수에는 비밀값을 저장하지 않습니다.
- Supabase CLI access token은 CLI 인증 저장소에서 관리하며 Git에 저장하지 않습니다.

## 7. 주요 명령

저장소 루트 기준:

```bash
# 프런트엔드 개발 서버
npm run dev:frontend

# 타입 및 Svelte 검사
npm run check

# 프로덕션 빌드
npm run build

# Supabase 로컬 스택
npm run dev:backend
npm run stop:backend
```

백엔드 마이그레이션:

```bash
cd backend
npm run db:new -- migration_name
npm run db:reset
npm run db:push
```

## 8. 검증 결과

- `svelte-check`: 오류 0건, 경고 0건
- Supabase CLI 원격 프로젝트 연결: 성공
- `countries` 마이그레이션 적용: 성공
- publishable key + RLS REST 조회: 3개 행 반환
- GitHub `main` push: 성공
- Vercel Production 배포: 성공
- 실제 `.env` 파일 Git 제외: 확인
- 저장소 내 Supabase secret key 값: 없음

초기 설정 완료 커밋:

- `0d1e3ed` - `Initialize SvelteKit, Supabase, and AI workspace`
- `7f53dcb` - `Support Supabase publishable key`

## 9. 다음 작업

1. 농장, 작기, 작업, 작업기록 데이터 모델 정의
2. 농장 단위 사용자 권한과 RLS 정책 작성
3. 작물 1종을 대상으로 가상 환경데이터와 작업 템플릿 구성
4. 향후 7일 작업 및 완료·연기 기록 화면 구현
5. 일정 변경 이력과 AI 설명 계약 정의
