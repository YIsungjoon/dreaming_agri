<script lang="ts">
	import { farmStore } from '$lib/farmStore.svelte';
	import { fetchCropMarketPrice, type MarketPriceInfo } from '$lib/services/marketApiService';

	let market = $state<MarketPriceInfo | null>(null);
	let loading = $state(true);

	// Harvest Revenue Simulator state
	let boxCount = $state<number>(30);

	const currentFarm = $derived(farmStore.currentFarm);

	$effect(() => {
		loadMarketData(currentFarm.crop);
	});

	async function loadMarketData(crop: string) {
		loading = true;
		try {
			market = await fetchCropMarketPrice(crop);
		} finally {
			loading = false;
		}
	}

	const estimatedRevenue = $derived.by(() => {
		if (!market || !boxCount) return 0;
		return boxCount * market.avgPrice;
	});

	const maxRevenue = $derived.by(() => {
		if (!market || !boxCount) return 0;
		return boxCount * market.maxPrice;
	});
</script>

<div class="market-widget-card">
	<div class="widget-header">
		<div class="title-meta">
			<span class="badge-api">💰 aT KAMIS 실시간 도매시세</span>
			<h3>{currentFarm.crop} 도매/경락가 및 출하 매출 시뮬레이션</h3>
		</div>
		<span class="crop-tag">🌱 {currentFarm.crop} ({currentFarm.variety})</span>
	</div>

	{#if loading}
		<div class="loading-box">전국 도매시장 경락가를 조회하는 중입니다...</div>
	{:else if market}
		<div class="market-body-grid">
			<!-- Left: Wholesale Price & Trends -->
			<div class="price-overview-box">
				<div class="main-price-row">
					<div class="price-big">
						<small>전국 평균 도매가 ({market.unit})</small>
						<strong class="price-num">{market.avgPrice.toLocaleString()} <span class="unit-won">원</span></strong>
					</div>
					<div
						class="trend-badge"
						class:trend-up={market.trendStatus === 'up'}
						class:trend-down={market.trendStatus === 'down'}
					>
						{market.trendStatus === 'up' ? '▲' : '▼'} {Math.abs(market.changeRate)}%
					</div>
				</div>

				<div class="price-sub-grid">
					<div class="sub-item">
						<small>최고가</small>
						<span class="val max">{market.maxPrice.toLocaleString()}원</span>
					</div>
					<div class="sub-item">
						<small>최저가</small>
						<span class="val min">{market.minPrice.toLocaleString()}원</span>
					</div>
					<div class="sub-item">
						<small>최고가 형성 시장</small>
						<span class="val market-name">📍 {market.topMarket}</span>
					</div>
				</div>

				<!-- 7-Day History Bars -->
				<div class="weekly-history-box">
					<small class="box-title">📊 최근 7일 시세 추이</small>
					<div class="history-bars">
						{#each market.weeklyHistory as h}
							{@const heightPct = Math.max(30, Math.min(100, (h.price / market.maxPrice) * 100))}
							<div class="history-col" title={`${h.date}: ${h.price.toLocaleString()}원`}>
								<div class="bar-fill" style={`height: ${heightPct}%`}></div>
								<span class="bar-date">{h.date}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Right: Harvest Revenue Simulator -->
			<div class="revenue-simulator-box">
				<h4>⚡ 수확 출하 예상 매출액 계산기</h4>
				<p class="sim-desc">오늘 수확 예정 상자 수를 입력하면 실시간 시세 기준 예상 매출액을 산출합니다.</p>

				<div class="sim-form-group">
					<label for="box-input">수확 예정 물량 ({market.unit})</label>
					<div class="input-with-btn">
						<input id="box-input" type="number" bind:value={boxCount} min="1" max="1000" />
						<span class="input-unit">상자</span>
					</div>
					<div class="quick-btns">
						<button type="button" onclick={() => (boxCount = 10)}>10상자</button>
						<button type="button" onclick={() => (boxCount = 30)}>30상자</button>
						<button type="button" onclick={() => (boxCount = 50)}>50상자</button>
						<button type="button" onclick={() => (boxCount = 100)}>100상자</button>
					</div>
				</div>

				<div class="sim-result-card">
					<div class="sim-row">
						<span>평균 시세 기준 예상 매출:</span>
						<strong class="revenue-val">{estimatedRevenue.toLocaleString()} 원</strong>
					</div>
					<div class="sim-row highlight-max">
						<span>최고가 시장({market.topMarket}) 출하 시:</span>
						<strong class="max-revenue-val">최대 {maxRevenue.toLocaleString()} 원</strong>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.market-widget-card {
		margin-bottom: 24px;
		background: #ffffff;
		border: 1px solid #dce5dc;
		border-radius: 18px;
		padding: 22px;
		box-shadow: 0 6px 20px rgba(23, 61, 41, 0.04);
	}

	.widget-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 12px;
		margin-bottom: 18px;
	}

	.title-meta {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.badge-api {
		font-size: 0.72rem;
		font-weight: 800;
		color: #1e40af;
		background: #dbeafe;
		padding: 2px 8px;
		border-radius: 6px;
		width: fit-content;
	}

	.widget-header h3 {
		margin: 0;
		font-size: 1.1rem;
		color: #173d29;
	}

	.crop-tag {
		font-size: 0.78rem;
		color: #556c5e;
		font-weight: 700;
		background: #f0f7ef;
		padding: 4px 10px;
		border-radius: 6px;
	}

	.loading-box {
		padding: 30px;
		text-align: center;
		color: #6a7f72;
	}

	.market-body-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 20px;
	}

	/* Price Overview */
	.price-overview-box {
		background: #f8faf8;
		border: 1px solid #e1ebe0;
		border-radius: 14px;
		padding: 16px;
	}

	.main-price-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 14px;
		padding-bottom: 12px;
		border-bottom: 1px solid #e1ebe0;
	}

	.price-big small {
		display: block;
		font-size: 0.76rem;
		color: #597062;
		margin-bottom: 2px;
	}

	.price-num {
		font-size: 1.6rem;
		font-weight: 850;
		color: #164228;
	}

	.unit-won { font-size: 1rem; font-weight: 700; }

	.trend-badge {
		font-size: 0.85rem;
		font-weight: 800;
		padding: 4px 10px;
		border-radius: 8px;
	}

	.trend-up { background: #fee2e2; color: #dc2626; }
	.trend-down { background: #dbeafe; color: #2563eb; }

	.price-sub-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		margin-bottom: 16px;
	}

	.sub-item {
		background: #ffffff;
		padding: 8px 10px;
		border-radius: 8px;
		border: 1px solid #e5eee4;
	}

	.sub-item small {
		display: block;
		font-size: 0.7rem;
		color: #6c8274;
	}

	.sub-item .val {
		font-size: 0.85rem;
		font-weight: 800;
	}

	.val.max { color: #dc2626; }
	.val.min { color: #2563eb; }
	.val.market-name { color: #166534; font-size: 0.78rem; }

	/* History Bars */
	.weekly-history-box .box-title {
		font-size: 0.78rem;
		color: #4b6152;
		font-weight: 750;
		display: block;
		margin-bottom: 10px;
	}

	.history-bars {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		height: 60px;
		padding-top: 10px;
	}

	.history-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 12%;
		height: 100%;
		justify-content: flex-end;
	}

	.bar-fill {
		width: 100%;
		background: linear-gradient(180deg, #3b82f6 0%, #93c5fd 100%);
		border-radius: 4px 4px 0 0;
		transition: height 0.3s ease;
	}

	.bar-date {
		font-size: 0.68rem;
		color: #6a7f72;
		margin-top: 4px;
	}

	/* Revenue Simulator */
	.revenue-simulator-box {
		background: #f0f7f0;
		border: 1px solid #cde0ca;
		border-radius: 14px;
		padding: 16px;
	}

	.revenue-simulator-box h4 {
		margin: 0 0 4px;
		font-size: 1rem;
		color: #164228;
	}

	.sim-desc {
		margin: 0 0 14px;
		font-size: 0.78rem;
		color: #556c5e;
		line-height: 1.4;
	}

	.sim-form-group label {
		font-size: 0.8rem;
		font-weight: 750;
		color: #1c522e;
		display: block;
		margin-bottom: 6px;
	}

	.input-with-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.input-with-btn input {
		width: 120px;
		padding: 8px 12px;
		border: 1px solid #b2cbaf;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 800;
		color: #164228;
	}

	.input-unit { font-size: 0.9rem; font-weight: 750; color: #2e593d; }

	.quick-btns {
		display: flex;
		gap: 6px;
		margin-bottom: 14px;
	}

	.quick-btns button {
		padding: 4px 8px;
		border: 1px solid #b2cbaf;
		border-radius: 6px;
		background: #ffffff;
		font-size: 0.75rem;
		font-weight: 700;
		color: #2b5437;
		cursor: pointer;
	}

	.sim-result-card {
		background: #ffffff;
		padding: 14px;
		border-radius: 10px;
		border: 1px solid #b2cbaf;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.sim-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.82rem;
		color: #4b6152;
	}

	.revenue-val {
		font-size: 1.15rem;
		font-weight: 850;
		color: #15803d;
	}

	.highlight-max {
		border-top: 1px dashed #d2ded0;
		padding-top: 6px;
	}

	.max-revenue-val {
		font-size: 0.95rem;
		font-weight: 800;
		color: #b91c1c;
	}
</style>
