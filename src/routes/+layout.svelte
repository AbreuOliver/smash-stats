<script lang="ts">
	import { onMount } from 'svelte';
	import { warmFighterImages } from '$lib/smash-log';
	import './layout.css';

	let { children } = $props();

	onMount(() => {
		if ('serviceWorker' in navigator) {
			void navigator.serviceWorker.register('/service-worker.js');
		}

		void warmFighterImages();
	});
</script>

<svelte:head>
	<link rel="icon" href="/smash-stats-icon.jpg" />
	<link rel="apple-touch-icon" href="/smash-stats-icon.jpg" />
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="theme-color" content="#0f172a" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
</svelte:head>
<div class="scanlines min-h-dvh bg-[#08080f] text-white">
	<div
		class="relative z-10 mx-auto flex min-h-dvh w-full max-w-[430px] flex-col"
		style="padding-top: env(safe-area-inset-top);"
	>
		{@render children()}
	</div>
</div>
