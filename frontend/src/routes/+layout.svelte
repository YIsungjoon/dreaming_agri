<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Dreaming Agri</title>
	<meta
		name="description"
		content="가상 환경데이터를 농작업 계획과 기록으로 연결하는 예측형 농장 운영관리 플랫폼"
	/>
</svelte:head>

<AppSidebar />

<div class="app-content">
	{@render children()}
</div>

<style>
	.app-content {
		min-width: 0;
		margin-left: var(--sidebar-width);
	}

	@media (max-width: 960px) {
		.app-content {
			margin-left: 0;
		}
	}
</style>
