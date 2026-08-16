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
{@render children()}
