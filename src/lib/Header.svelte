<script lang="ts">
	import { goto } from '$app/navigation';

	type ActiveTab = 'log' | 'history';

	let {
		active = 'log'
	}: {
		active?: ActiveTab;
	} = $props();
</script>

<header
	class="sticky top-0 z-50 border-b border-[#2a2a38] bg-[#0d0d16] px-4 pb-3"
	style="padding-top: calc(env(safe-area-inset-top) + 14px);"
>
	<div class="mb-2.5 flex items-center gap-2">
		<img src="/super-smash-bros-removebg-preview.png" alt="" class="h-6 w-6 shrink-0 brightness-0 invert" />
		<!-- <img src="/Smash-Bros-Symbol-Photoroom.png" alt="" class="h-6 w-6 shrink-0 brightness-0 invert" /> -->
		<div class="flex items-baseline gap-2">
			<div
				class="bg-clip-text text-[26px] font-black tracking-[0.06em] text-transparent"
				style="background-image: linear-gradient(135deg, rgb(232, 25, 44) 0%, rgb(255, 174, 0) 100%);"
			>
			    SmashStats
			</div>
			<div class="mb-px text-[12px] font-semibold uppercase tracking-[0.12em] text-[#5d6175]">
				Online
			</div>
		</div>
	</div>

	<div class="grid grid-cols-2 rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] p-[3px]">
		<button
			type="button"
			class={`rounded-lg px-1 py-[7px] text-center text-sm font-bold uppercase tracking-[0.06em] ${
				active === 'log' ? 'bg-[#e8192c] text-white' : 'bg-transparent text-[#555]'
			}`}
			onclick={() => {
				void goto('/');
			}}
		>
			Log Match
		</button>
		<button
			type="button"
			class={`rounded-lg px-1 py-[7px] text-center text-sm font-bold uppercase tracking-[0.06em] ${
				active === 'history' ? 'bg-[#e8192c] text-white' : 'bg-transparent text-[#555]'
			}`}
			onclick={() => {
				void goto('/stats');
			}}
		>
			History
		</button>
	</div>
</header>
