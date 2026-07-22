<script lang="ts">
	import { browser } from '$app/environment';

	const navigation = [
		{
			id: 'overview',
			label: '개요',
			path: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'
		},
		{
			id: 'flow',
			label: '운영 흐름',
			path: 'M5 6h9M11 3l3 3-3 3M19 18h-9M13 15l-3 3 3 3M5 6v5a3 3 0 0 0 3 3h8a3 3 0 0 1 3 3v1'
		},
		{
			id: 'systems',
			label: '시스템',
			path: 'M12 3v5M12 16v5M4.2 7.5l4.3 2.5M15.5 14l4.3 2.5M4.2 16.5 8.5 14M15.5 10l4.3-2.5M12 8l3.5 2v4L12 16l-3.5-2v-4z'
		},
		{
			id: 'weather',
			label: '농장 날씨',
			path: 'M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0'
		}
	];

	let mobileOpen = $state(false);
	let activeSection = $state('overview');

	$effect(() => {
		if (!browser) return;

		const sections = navigation
			.map((item) => document.getElementById(item.id))
			.filter((section): section is HTMLElement => section !== null);
		const observer = new IntersectionObserver(
			(entries) => {
				const visibleEntry = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

				if (visibleEntry) activeSection = visibleEntry.target.id;
			},
			{ rootMargin: '-18% 0px -62% 0px', threshold: [0, 0.15, 0.4] }
		);

		for (const section of sections) observer.observe(section);

		return () => observer.disconnect();
	});

	function selectSection(id: string) {
		activeSection = id;
		mobileOpen = false;
	}
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && (mobileOpen = false)} />

<header class="mobile-bar">
	<a class="mobile-brand" href="#overview" onclick={() => selectSection('overview')}>
		<span class="brand-mark" aria-hidden="true"><i></i></span>
		<strong>Dreaming Agri</strong>
	</a>
	<button
		type="button"
		class="menu-button"
		aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
		aria-expanded={mobileOpen}
		aria-controls="app-sidebar"
		onclick={() => (mobileOpen = !mobileOpen)}
	>
		<span></span><span></span><span></span>
	</button>
</header>

<button
	type="button"
	class:visible={mobileOpen}
	class="backdrop"
	aria-label="메뉴 닫기"
	tabindex={mobileOpen ? 0 : -1}
	onclick={() => (mobileOpen = false)}
></button>

<aside id="app-sidebar" class:open={mobileOpen} aria-label="주요 탐색">
	<a class="brand" href="#overview" onclick={() => selectSection('overview')}>
		<span class="brand-mark" aria-hidden="true"><i></i></span>
		<span>
			<strong>Dreaming Agri</strong>
			<small>Farm operations</small>
		</span>
	</a>

	<div class="farm-context">
		<span class="farm-icon" aria-hidden="true">김</span>
		<span>
			<small>현재 농장</small>
			<strong>김제 가상농장</strong>
		</span>
		<i aria-hidden="true"></i>
	</div>

	<nav aria-label="페이지 섹션">
		<p>MENU</p>
		<ul>
			{#each navigation as item}
				<li>
					<a
						href={`#${item.id}`}
						class:active={activeSection === item.id}
						aria-current={activeSection === item.id ? 'location' : undefined}
						onclick={() => selectSection(item.id)}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d={item.path}></path>
						</svg>
						<span>{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="sidebar-footer">
		<div class="status-row">
			<span aria-hidden="true"></span>
			<strong>날씨 자동 수집</strong>
		</div>
		<p>매일 00 · 06 · 12 · 18시</p>
	</div>
</aside>

<style>
	:global(:root) {
		--sidebar-width: 272px;
	}

	aside {
		position: fixed;
		z-index: 40;
		inset: 0 auto 0 0;
		display: flex;
		width: var(--sidebar-width);
		padding: 28px 20px 24px;
		flex-direction: column;
		overflow-y: auto;
		background:
			radial-gradient(circle at 20% 8%, rgba(119, 183, 112, 0.15), transparent 32%),
			#123322;
		color: #f4f8f4;
		box-shadow: 12px 0 40px rgba(18, 51, 34, 0.08);
	}

	.brand,
	.mobile-brand {
		display: flex;
		align-items: center;
		gap: 12px;
		text-decoration: none;
	}

	.brand {
		padding: 0 8px;
	}

	.brand-mark {
		position: relative;
		display: grid;
		width: 36px;
		height: 36px;
		flex: 0 0 auto;
		place-items: center;
		border-radius: 11px;
		background: #dff0d9;
	}

	.brand-mark::before,
	.brand-mark i {
		position: absolute;
		content: '';
		background: #39774a;
	}

	.brand-mark::before {
		width: 12px;
		height: 17px;
		border-radius: 12px 2px 12px 2px;
		transform: translate(-3px, -2px) rotate(-10deg);
	}

	.brand-mark i {
		width: 2px;
		height: 13px;
		border-radius: 2px;
		transform: translate(4px, 7px) rotate(30deg);
	}

	.brand > span:last-child {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 2px;
	}

	.brand strong,
	.mobile-brand strong {
		font-size: 0.98rem;
		letter-spacing: -0.02em;
	}

	.brand small {
		font-size: 0.64rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #91aa99;
	}

	.farm-context {
		display: grid;
		grid-template-columns: 38px 1fr 8px;
		gap: 11px;
		align-items: center;
		margin-top: 36px;
		padding: 13px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.055);
	}

	.farm-icon {
		display: grid;
		width: 38px;
		height: 38px;
		place-items: center;
		border-radius: 12px;
		background: #2f6842;
		font-size: 0.76rem;
		font-weight: 800;
		color: #dff0d9;
	}

	.farm-context > span:nth-child(2) {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 3px;
	}

	.farm-context small {
		font-size: 0.66rem;
		color: #8ca493;
	}

	.farm-context strong {
		overflow: hidden;
		font-size: 0.82rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.farm-context i {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #7dc879;
		box-shadow: 0 0 0 4px rgba(125, 200, 121, 0.12);
	}

	nav {
		margin-top: 34px;
	}

	nav > p {
		margin: 0 12px 10px;
		font-size: 0.62rem;
		font-weight: 800;
		letter-spacing: 0.16em;
		color: #718a79;
	}

	nav ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	nav li + li {
		margin-top: 4px;
	}

	nav a {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		border-radius: 12px;
		font-size: 0.86rem;
		font-weight: 650;
		color: #aebfb3;
		text-decoration: none;
		transition:
			background 150ms ease,
			color 150ms ease,
			transform 150ms ease;
	}

	nav a:hover {
		background: rgba(255, 255, 255, 0.055);
		color: #f4f8f4;
		transform: translateX(2px);
	}

	nav a.active {
		background: #dff0d9;
		color: #235c38;
	}

	nav svg {
		width: 19px;
		height: 19px;
		flex: 0 0 auto;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.7;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.sidebar-footer {
		margin-top: auto;
		padding: 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.status-row {
		display: flex;
		align-items: center;
		gap: 9px;
	}

	.status-row span {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #7dc879;
		box-shadow: 0 0 0 4px rgba(125, 200, 121, 0.12);
	}

	.status-row strong {
		font-size: 0.78rem;
	}

	.sidebar-footer p {
		margin: 7px 0 0 16px;
		font-size: 0.7rem;
		color: #82998a;
	}

	.mobile-bar,
	.backdrop {
		display: none;
	}

	@media (max-width: 960px) {
		aside {
			width: min(82vw, 312px);
			transform: translateX(-105%);
			transition: transform 220ms ease;
		}

		aside.open {
			transform: translateX(0);
		}

		.mobile-bar {
			position: sticky;
			z-index: 30;
			top: 0;
			display: flex;
			height: 66px;
			padding: 0 18px;
			align-items: center;
			justify-content: space-between;
			border-bottom: 1px solid #dde5dc;
			background: rgba(244, 247, 242, 0.92);
			backdrop-filter: blur(14px);
		}

		.mobile-brand {
			color: #173d29;
		}

		.mobile-brand .brand-mark {
			width: 32px;
			height: 32px;
		}

		.menu-button {
			display: grid;
			width: 40px;
			height: 40px;
			padding: 10px;
			place-content: center;
			gap: 4px;
			border: 1px solid #d7e1d6;
			border-radius: 12px;
			background: #fff;
			cursor: pointer;
		}

		.menu-button span {
			display: block;
			width: 17px;
			height: 2px;
			border-radius: 2px;
			background: #245b38;
		}

		.backdrop {
			position: fixed;
			z-index: 35;
			inset: 0;
			display: block;
			padding: 0;
			border: 0;
			background: rgba(9, 28, 18, 0.48);
			opacity: 0;
			pointer-events: none;
			transition: opacity 180ms ease;
		}

		.backdrop.visible {
			opacity: 1;
			pointer-events: auto;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		aside,
		nav a,
		.backdrop {
			transition: none;
		}
	}
</style>
