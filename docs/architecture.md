# 아키텍처

## MVP 목표

기획 문서의 핵심 흐름을 다음 한 줄로 유지합니다.

```text
가상·외부 환경데이터 → 생육 상태 해석 → 일정 보정 → 작업 카드 → 수행 기록 → 다음 계획 갱신
```

초기 범위는 작물 1종, 시설 유형 1종, 핵심 생육 단계에 집중합니다. 실제 센서 제어, 완전 자율형 Agent, 범용 병해 진단과 수익 보장은 MVP 범위에 포함하지 않습니다.

## 영역별 책임

### `frontend`

Svelte 5와 SvelteKit으로 사용자 경험을 담당하며 Vercel에 배포합니다.

- 농장과 작기 설정
- 가이드 캘린더와 향후 7일 작업
- 작업 보드와 작업 상세
- 사진, 메모, 작업 완료·연기 기록
- 일정 변경 이력과 변경 근거 표시
- AI 설명 및 질의응답 화면

기능 코드는 `src/lib/features` 아래에서 농장, 작기, 일정, 작업, 기록, AI 도메인 단위로 나눕니다. Supabase의 secret/service-role key나 AI 제공자 키는 클라이언트 코드에 두지 않습니다.

### `backend`

Supabase가 데이터의 최종 원본과 접근 통제를 담당합니다.

- Postgres: 농장, 작기, 환경 관측값, 생육 단계, 작업, 자원, 작업 기록, 일정 변경 이력
- Auth + RLS: 농장 단위 사용자 권한
- Storage: 작업 사진, 음성 메모, 재배 문서
- Realtime: 보드와 작업 상태 동기화
- Edge Functions/RPC: 권한이 필요한 계산 호출, 알림, AI 작업 접수

스키마 변경은 Dashboard에만 남기지 않고 `backend/supabase/migrations`에 저장합니다. 로컬 `db reset`으로 재현 가능한 상태를 유지합니다.

### `ai`

모델 코드와 평가 자산을 제품 코드에서 분리합니다.

- `synthetic-data`: 재현 가능한 가상 환경데이터 생성
- `forecasting`: 생육 단계와 작업 예상 범위 산정
- `rag`: 재배 문서 근거 검색과 답변 구성
- `vision`: 제한된 이미지 상태 확인
- `evaluation`: 정확도, 근거성, 불확실성, 전문가 검토 결과

AI 결과는 확정 명령이 아니라 `제안값 + 신뢰 수준 + 근거 + 추가 확인 행동` 형태로 반환합니다. 모델 출력은 검증된 백엔드 경로를 거쳐 저장하며, 프런트엔드가 모델 서비스에 직접 쓰기 권한을 갖지 않게 합니다.

## 요청 흐름

```text
사용자
  ↓
SvelteKit / Vercel
  ↓  사용자 JWT
Supabase Auth + RLS ──→ Postgres / Storage / Realtime
  ↓ 서버 전용 작업 요청
AI 모듈 또는 AI 실행 서비스
  ↓ 근거·신뢰 수준이 포함된 제안
Supabase 작업/이력 테이블
  ↓
SvelteKit 화면 갱신
```

## 환경변수 원칙

| 위치 | 허용 | 금지 |
| --- | --- | --- |
| 브라우저 | `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | service-role/secret key, AI API key |
| SvelteKit 서버 | 서버 전용 Supabase/AI 키 | `PUBLIC_` 접두사로 비밀 노출 |
| Supabase/AI 런타임 | 필요한 최소 권한의 서버 키 | 저장소에 실제 값 커밋 |

## 다음 구현 순서

1. 농장·작기·작업·작업기록의 최소 스키마와 RLS 정의
2. 가상 환경데이터 시드와 재현 가능한 생성 규칙 정의
3. 농장 설정 → 7일 작업 → 완료/연기 기록 사용자 흐름 구현
4. 일정 보정 로직과 변경 이력 연결
5. 문서 근거형 AI 설명과 평가 체계 연결
