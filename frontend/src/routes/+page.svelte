<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dreaming Agri | 농장 운영관리</title>
</svelte:head>

<main>
	<header class="hero">
		<div class="eyebrow"><span></span> 가상데이터 기반 MVP</div>
		<h1>농장 데이터를<br /><strong>다음 작업</strong>으로 연결합니다.</h1>
		<p>
			환경 변화와 생육 상태를 읽고, 준비할 인력과 자재부터 실제 작업 기록까지 하나의 흐름으로
			관리하는 예측형 농장 운영 플랫폼입니다.
		</p>
	</header>

	<section class="flow" aria-labelledby="flow-title">
		<div class="section-heading">
			<p>PRODUCT FLOW</p>
			<h2 id="flow-title">데이터에서 실행까지</h2>
		</div>

		<div class="steps">
			<article>
				<span>01</span>
				<h3>환경·생육 해석</h3>
				<p>가상 환경데이터와 생육단계를 함께 확인합니다.</p>
			</article>
			<article>
				<span>02</span>
				<h3>작업 일정 보정</h3>
				<p>예상 범위와 변경 이유, 신뢰 수준을 제시합니다.</p>
			</article>
			<article>
				<span>03</span>
				<h3>준비·작업 기록</h3>
				<p>인력과 자재를 준비하고 완료·연기 결과를 남깁니다.</p>
			</article>
			<article>
				<span>04</span>
				<h3>다음 계획 갱신</h3>
				<p>수행 결과를 이후 일정과 AI 설명에 다시 반영합니다.</p>
			</article>
		</div>
	</section>

	<section class="systems" aria-label="시스템 구성">
		<article>
			<p>FRONTEND</p>
			<h2>Svelte 5</h2>
			<span>Vercel</span>
		</article>
		<article>
			<p>BACKEND</p>
			<h2>Supabase</h2>
			<span>Postgres · Auth · Storage</span>
		</article>
		<article>
			<p>INTELLIGENCE</p>
			<h2>AI Modules</h2>
			<span>Forecast · RAG · Vision</span>
		</article>
	</section>

	<section class="database" aria-labelledby="database-title">
		<div>
			<p class="database-label">SUPABASE CONNECTION</p>
			<h2 id="database-title">Countries</h2>
			<p class="database-description">SvelteKit 서버에서 Supabase의 공개 테이블을 조회합니다.</p>
		</div>

		{#if !data.supabase.configured}
			<div class="connection-state pending">
				<strong>환경변수 연결 대기 중</strong>
				<span><code>frontend/.env</code>에 Supabase URL과 anon key를 설정하세요.</span>
			</div>
		{:else if data.supabase.error}
			<div class="connection-state error">
				<strong>Supabase 조회 실패</strong>
				<span>{data.supabase.error}</span>
			</div>
		{:else}
			<ul class="country-list">
				{#each data.countries as country}
					<li>
						<span>{String(country.id).padStart(2, '0')}</span>
						<strong>{country.name}</strong>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>

<style>
	main {
		width: min(1160px, calc(100% - 40px));
		margin: 0 auto;
		padding: 72px 0 56px;
	}

	.hero {
		max-width: 780px;
		padding: 48px 0 88px;
	}

	.eyebrow,
	.section-heading > p,
	.systems article > p {
		margin: 0;
		font-size: 0.72rem;
		font-weight: 750;
		letter-spacing: 0.16em;
		color: #3e7650;
	}

	.eyebrow {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.eyebrow span {
		width: 8px;
		height: 8px;
		border-radius: 999px;
		background: #64a75f;
		box-shadow: 0 0 0 5px #dcebd9;
	}

	h1 {
		margin: 22px 0 24px;
		font-size: clamp(2.9rem, 7vw, 5.8rem);
		line-height: 1.02;
		letter-spacing: -0.06em;
		font-weight: 730;
	}

	h1 strong {
		color: #36764b;
		font-weight: inherit;
	}

	.hero > p {
		max-width: 650px;
		margin: 0;
		font-size: clamp(1rem, 2vw, 1.18rem);
		line-height: 1.85;
		color: #5e6962;
	}

	.flow {
		padding: 48px;
		border: 1px solid #dbe3da;
		border-radius: 28px;
		background: rgba(255, 255, 255, 0.76);
		box-shadow: 0 24px 60px rgba(34, 64, 42, 0.08);
	}

	.section-heading {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 20px;
		padding-bottom: 30px;
		border-bottom: 1px solid #dfe6de;
	}

	.section-heading h2 {
		margin: 0;
		font-size: clamp(1.7rem, 4vw, 2.5rem);
		letter-spacing: -0.04em;
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
	}

	.steps article {
		min-height: 240px;
		padding: 32px 24px 0;
		border-left: 1px solid #e5eae4;
	}

	.steps article:first-child {
		padding-left: 0;
		border-left: 0;
	}

	.steps article:last-child {
		padding-right: 0;
	}

	.steps span {
		display: inline-grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		background: #e4f0e1;
		font-size: 0.78rem;
		font-weight: 800;
		color: #36764b;
	}

	.steps h3 {
		margin: 40px 0 12px;
		font-size: 1.04rem;
		letter-spacing: -0.025em;
	}

	.steps p {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.7;
		color: #657068;
	}

	.systems {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		margin-top: 18px;
	}

	.systems article {
		padding: 28px;
		border: 1px solid #dfe6de;
		border-radius: 20px;
		background: #edf3eb;
	}

	.systems h2 {
		margin: 20px 0 6px;
		font-size: 1.45rem;
		letter-spacing: -0.035em;
	}

	.systems span {
		font-size: 0.85rem;
		color: #6a756d;
	}

	.database {
		display: grid;
		grid-template-columns: minmax(220px, 0.8fr) minmax(360px, 1.2fr);
		gap: 64px;
		align-items: start;
		margin-top: 18px;
		padding: 48px;
		border-radius: 28px;
		background: #173d29;
		color: #f5faf5;
	}

	.database-label {
		margin: 0;
		font-size: 0.72rem;
		font-weight: 750;
		letter-spacing: 0.16em;
		color: #9bcda2;
	}

	.database h2 {
		margin: 18px 0 10px;
		font-size: clamp(2rem, 4vw, 3rem);
		letter-spacing: -0.05em;
	}

	.database-description {
		margin: 0;
		line-height: 1.7;
		color: #bad0c0;
	}

	.connection-state {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 24px;
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.06);
	}

	.connection-state strong {
		font-size: 1rem;
	}

	.connection-state span {
		font-size: 0.88rem;
		line-height: 1.6;
		color: #c7d8cc;
	}

	.connection-state code {
		padding: 2px 6px;
		border-radius: 5px;
		background: rgba(255, 255, 255, 0.1);
	}

	.connection-state.error {
		border-color: rgba(255, 152, 136, 0.5);
	}

	.country-list {
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
	}

	.country-list li {
		display: grid;
		grid-template-columns: 48px 1fr;
		gap: 14px;
		align-items: center;
		padding: 18px 4px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.14);
	}

	.country-list span {
		font-size: 0.76rem;
		font-weight: 700;
		color: #88b691;
	}

	.country-list strong {
		font-size: 1.04rem;
	}

	@media (max-width: 800px) {
		main {
			width: min(100% - 28px, 680px);
			padding-top: 34px;
		}

		.hero {
			padding: 36px 6px 64px;
		}

		.flow {
			padding: 30px 24px;
			border-radius: 22px;
		}

		.section-heading {
			align-items: start;
			flex-direction: column;
		}

		.steps {
			grid-template-columns: 1fr;
		}

		.steps article,
		.steps article:first-child,
		.steps article:last-child {
			min-height: auto;
			padding: 24px 0;
			border-left: 0;
			border-top: 1px solid #e5eae4;
		}

		.steps article:first-child {
			border-top: 0;
		}

		.steps h3 {
			margin-top: 20px;
		}

		.systems {
			grid-template-columns: 1fr;
		}

		.database {
			grid-template-columns: 1fr;
			gap: 30px;
			padding: 32px 24px;
			border-radius: 22px;
		}
	}
</style>
