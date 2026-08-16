<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import {
		RECORDS_KEY,
		STORAGE_KEY,
		defaultForm,
		fighters,
		fighterById,
		lossReasons,
		summaryForToday,
		type FormState,
		type Fighter,
		type MatchRecord,
		type Stage
	} from '$lib/smash-log';

	type Slot = 'you' | 'opponent';

	let form = $state<FormState>(defaultForm);
	let records = $state<MatchRecord[]>([]);
	let drawerOpen = $state(false);
	let activeSlot = $state<Slot>('you');
	let search = $state('');
	let hydrated = $state(false);
	let menuOpen = $state(false);

	const todayStamp = () => new Date().toDateString();

	const selectedFighter = (slot: Slot) => fighterById.get(slot === 'you' ? form.youId : form.opponentId);

	const filteredFighters = $derived.by(() => {
		const query = search.trim().toLowerCase();

		if (!query) return fighters;

		return fighters.filter((fighter) => {
			return (
				fighter.name.toLowerCase().includes(query) ||
				fighter.id.replaceAll('_', ' ').toLowerCase().includes(query)
			);
		});
	});

	const todaySummary = $derived.by(() => summaryForToday(records, todayStamp()));

	function openDrawer(slot: Slot) {
		activeSlot = slot;
		search = '';
		drawerOpen = true;
	}

	function closeDrawer() {
		drawerOpen = false;
	}

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}

	function pickFighter(fighter: Fighter) {
		if (activeSlot === 'you') {
			form.youId = fighter.id;
		} else {
			form.opponentId = fighter.id;
		}

		closeDrawer();
	}

	function toggleReason(reason: string) {
		form.lossReasons = form.lossReasons.includes(reason)
			? form.lossReasons.filter((entry) => entry !== reason)
			: [...form.lossReasons, reason];
	}

	function toggleFeature(key: 'items' | 'smashMeter' | 'hazards' | 'eliteSmash') {
		form[key] = !form[key];
	}

	function saveMatch() {
		if (!form.youId || !form.opponentId) return;

		const entry: MatchRecord = {
			id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
			createdAt: new Date().toISOString(),
			...JSON.parse(JSON.stringify(form))
		};

		records = [entry, ...records].slice(0, 300);
	}

	onMount(() => {
		if (!browser) return;

		try {
			const storedForm = localStorage.getItem(STORAGE_KEY);
			const storedRecords = localStorage.getItem(RECORDS_KEY);

			if (storedForm) {
				form = { ...defaultForm, ...JSON.parse(storedForm) };
			}

			if (storedRecords) {
				records = JSON.parse(storedRecords);
			}
		} catch {
			form = defaultForm;
			records = [];
		}

		hydrated = true;
	});

	$effect(() => {
		if (!browser || !hydrated) return;

		localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
		localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
	});
</script>

<svelte:head>
	<title>Smash Log</title>
	<meta
		name="description"
		content="Fast, offline-first Super Smash Bros. Ultimate match logger with local storage."
	/>
</svelte:head>

<div class="min-h-dvh bg-[#050505] bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.035)_0,rgba(255,255,255,0.035)_1px,transparent_1px,transparent_7px)] text-white">
	<div class="mx-auto flex min-h-dvh w-full max-w-[460px] flex-col px-1 pb-20 pt-1">
		<header class="relative z-40 mb-1 overflow-visible border border-white/10 bg-black px-2 py-2">
			<div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%),linear-gradient(135deg,transparent_0,transparent_50%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.04)_51%,transparent_51%)]"></div>
			<div class="relative flex items-start gap-2">
				<div class="relative">
					<button
						type="button"
						class="grid h-10 w-10 place-items-center border border-white/10 bg-[#0b0b0b] text-zinc-300"
						onclick={toggleMenu}
						aria-label="Open menu"
						aria-expanded={menuOpen}
					>
						<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>

					{#if menuOpen}
						<div
							class="absolute left-0 top-full z-[200] mt-px w-52 border border-white/10 bg-black shadow-[0_16px_30px_rgba(0,0,0,0.5)]"
							transition:slide|local={{ duration: 150 }}
						>
							<a
								href="/stats"
								class="block border-b border-white/10 px-3 py-3 text-sm font-black uppercase tracking-[0.18em] text-white"
								onclick={closeMenu}
							>
								Stats & history
							</a>
							<div class="px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-zinc-500">
								Local data only
							</div>
						</div>
					{/if}
				</div>

				<div class="flex min-w-0 flex-1 items-center gap-2">
					<div class="relative grid h-12 w-12 place-items-center overflow-hidden bg-[#1b1b1b]">
						<div class="absolute inset-0 bg-[conic-gradient(from_90deg,#16a34a_0_25%,#0f0f0f_25%_50%,#16a34a_50%_75%,#0f0f0f_75%_100%)] opacity-95"></div>
						<div class="absolute inset-[10px] rounded-full bg-[#0b0b0b]"></div>
						<div class="absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#16a34a]"></div>
					</div>
					<div class="min-w-0">
						<p class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Smash Log</p>
						<h1 class="mt-0 text-[1.55rem] font-black tracking-[-0.07em]">
							<span class="text-white">Smash</span><span class="text-red-600">Stats</span>
						</h1>
					</div>
				</div>

				<div class="w-28 border border-white/10 bg-[#8c8c8c] px-2 py-1 text-center text-black">
					<p class="text-[0.58rem] font-black uppercase tracking-[0.3em] text-black/70">Today</p>
					<div class="mt-0.5 flex items-end justify-center gap-1">
						<div class="text-lg font-black leading-none">{todaySummary.wins}</div>
						<div class="pb-0.5 text-[0.7rem] font-black leading-none text-black/70">/</div>
						<div class="text-lg font-black leading-none">{todaySummary.losses}</div>
					</div>
					<p class="mt-0.5 text-[0.55rem] font-black uppercase tracking-[0.22em] text-black/70">
						Wins / Losses
					</p>
				</div>
			</div>
		</header>

		<section class="mt-1 space-y-2">
			<div class="grid grid-cols-2 gap-px bg-white/10 p-px">
				<button
					type="button"
					class={`flex h-12 items-center gap-2 border-0 px-3 text-left transition ${
						form.result === 'win' ? 'bg-emerald-500 text-white' : 'bg-[#0b0b0b] text-zinc-300'
					}`}
					onclick={() => {
						form.result = 'win';
					}}
					>
						<span class="text-lg">🏆</span>
						<span class="text-base font-black tracking-wide">Won</span>
					</button>

				<button
					type="button"
					class={`flex h-12 items-center gap-2 border-0 px-3 text-left transition ${
						form.result === 'loss' ? 'bg-red-500 text-white' : 'bg-[#0b0b0b] text-zinc-300'
					}`}
					onclick={() => {
						form.result = 'loss';
					}}
					>
						<span class="text-lg">☹</span>
						<span class="text-base font-black tracking-wide">Lost</span>
					</button>
			</div>

			<div class="grid grid-cols-2 gap-px bg-white/10 p-px">
				<button
					type="button"
					class={`min-h-24 border-0 px-2 py-2 text-left transition ${
						form.youId ? 'bg-[#111111]' : 'bg-[#0b0b0b]'
					}`}
					onclick={() => openDrawer('you')}
				>
					<p class="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Me</p>
					<div class="mt-2 flex items-end gap-2">
						{#if selectedFighter('you')}
							<img
								src={selectedFighter('you')?.image}
								alt={selectedFighter('you')?.name ?? 'Your fighter'}
								class="h-16 w-16 border border-white/20 object-cover"
							/>
						{/if}
						<div class="pb-1">
							<p class="text-[1.1rem] font-black leading-none text-white">
								{selectedFighter('you')?.name ?? 'Pick fighter'}
							</p>
							<p class="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">
								Tap to change
							</p>
						</div>
					</div>
				</button>

				<button
					type="button"
					class={`min-h-24 border-0 px-2 py-2 text-left transition ${
						form.opponentId ? 'bg-[#111111]' : 'bg-[#0b0b0b]'
					}`}
					onclick={() => openDrawer('opponent')}
				>
					<p class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Opponent</p>
					<div class="mt-2 flex items-end gap-2">
						{#if selectedFighter('opponent')}
							<img
								src={selectedFighter('opponent')?.image}
								alt={selectedFighter('opponent')?.name ?? 'Opponent fighter'}
								class="h-16 w-16 border border-white/20 object-cover"
							/>
						{/if}
						<div class="pb-1">
							<p class="text-[1.1rem] font-black leading-none text-white">
								{selectedFighter('opponent')?.name ?? 'Pick fighter'}
							</p>
							<p class="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">
								Tap to change
							</p>
						</div>
					</div>
				</button>
			</div>

			<div class="my-2 grid grid-cols-3 gap-px bg-white/10 p-px">
				{#each [
					{ id: 'final-destination', label: 'Final Destination' },
					{ id: 'battlefield', label: 'Battlefield' },
					{ id: 'other', label: 'Other' }
				] as stageOption}
					<button
						type="button"
						class={`h-14 border-0 px-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] transition ${
							form.stage === stageOption.id ? 'bg-red-500 text-white' : 'bg-[#0b0b0b] text-zinc-300'
						}`}
						onclick={() => {
							form.stage = stageOption.id as Stage;
						}}
					>
						{stageOption.label}
					</button>
				{/each}
			</div>

			<div class="grid grid-cols-2 gap-px bg-white/10 p-px">
				{#each [
					{ key: 'items', label: 'Items' },
					{ key: 'smashMeter', label: 'Smash Meter' },
					{ key: 'hazards', label: 'Hazards' },
					{ key: 'eliteSmash', label: 'Elite Smash' }
				] as toggle}
					<button
						type="button"
						class={`flex h-12 items-center justify-between border-0 px-3 text-left transition ${
							form[toggle.key as 'items' | 'smashMeter' | 'hazards' | 'eliteSmash']
								? 'bg-white text-black'
								: 'bg-[#0b0b0b] text-zinc-300'
						}`}
						onclick={() => toggleFeature(toggle.key as 'items' | 'smashMeter' | 'hazards' | 'eliteSmash')}
					>
						<span class="text-sm font-black uppercase tracking-[0.12em]">{toggle.label}</span>
						<span
							class={`flex h-5 w-9 items-center border border-white/20 px-0.5 transition ${
								form[toggle.key as 'items' | 'smashMeter' | 'hazards' | 'eliteSmash']
									? 'bg-emerald-400'
									: 'bg-zinc-800'
							}`}
						>
							<span
								class={`h-3.5 w-3.5 bg-white transition ${
									form[toggle.key as 'items' | 'smashMeter' | 'hazards' | 'eliteSmash']
										? 'translate-x-3.5'
										: 'translate-x-0'
								}`}
							></span>
						</span>
					</button>
				{/each}
			</div>

			<div class="border border-white/10 bg-[#0b0b0b] px-2 py-2">
				<div class="mb-1 flex items-center justify-between">
					<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Satisfaction</p>
					<span class="text-[0.7rem] font-bold text-zinc-500">{form.satisfaction}/5</span>
				</div>
				<div class="grid grid-cols-5 gap-px bg-white/10 p-px">
					{#each [1, 2, 3, 4, 5] as rating}
						<button
							type="button"
							class="grid h-9 place-items-center border-0 bg-[#0b0b0b] text-lg transition"
							onclick={() => {
								form.satisfaction = rating;
							}}
							aria-label={`Set satisfaction to ${rating}`}
						>
							<span class={rating <= form.satisfaction ? 'text-amber-400' : 'text-zinc-700'}>★</span>
						</button>
					{/each}
				</div>
			</div>

			<div class="grid grid-cols-2 gap-px bg-white/10 p-px">
				<button
					type="button"
					class={`border-0 px-3 py-2 text-left transition ${
						!form.toxic ? 'bg-red-500 text-white' : 'bg-[#0b0b0b] text-zinc-400'
					}`}
					onclick={() => {
						form.toxic = false;
					}}
				>
					<p class="text-[10px] font-black uppercase tracking-[0.35em]">Toxic</p>
					<p class="mt-1 text-lg font-black">No</p>
				</button>

				<button
					type="button"
					class={`border-0 px-3 py-2 text-left transition ${
						form.toxic ? 'bg-red-500 text-white' : 'bg-[#0b0b0b] text-zinc-400'
					}`}
					onclick={() => {
						form.toxic = true;
					}}
				>
					<p class="text-[10px] font-black uppercase tracking-[0.35em]">Toxic</p>
					<p class="mt-1 text-lg font-black">Yes</p>
				</button>
			</div>

			{#if form.result === 'loss'}
				<section class="border border-white/10 bg-[#0b0b0b] px-2 py-2">
					<div class="flex items-center justify-between gap-2">
						<div>
							<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-400">
								Why did you lose?
							</p>
							<p class="mt-1 text-[0.7rem] font-medium text-zinc-500">Select all that apply</p>
						</div>
						<div class="border border-white/10 bg-black px-2 py-1 text-[0.7rem] font-bold text-zinc-400">
							{form.lossReasons.length} selected
						</div>
					</div>

					<div class="mt-2 grid grid-cols-2 gap-px bg-white/10 p-px">
						{#each lossReasons as reason}
							<button
								type="button"
								class={`border-0 px-2 py-2 text-left text-[0.75rem] font-bold transition ${
									form.lossReasons.includes(reason)
										? 'bg-white text-black'
										: 'bg-[#111111] text-zinc-300'
								}`}
								onclick={() => toggleReason(reason)}
							>
								{reason}
							</button>
						{/each}
					</div>
				</section>
			{/if}

		</section>
	</div>

		<button
			type="button"
			class="fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[460px] items-center justify-center gap-3 border border-emerald-500 bg-emerald-500 px-4 py-3 text-base font-black text-black"
			onclick={saveMatch}
		>
		<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.9">
			<path d="M5 4h11l3 3v13H5z" />
			<path d="M8 4v6h8V4" />
			<path d="M8 18h8" />
		</svg>
		Save Match
	</button>

	{#if drawerOpen}
		<button
			type="button"
			class="fixed inset-0 z-40 bg-black/80"
			onclick={closeDrawer}
			aria-label="Close fighter drawer"
		></button>
		<div class="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[460px] border border-white/10 bg-black p-3">
			<div class="mx-auto mb-2 h-1 w-20 bg-white/15"></div>
			<div class="mb-4 flex items-start justify-between gap-3">
				<div>
					<p class="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400">
						{activeSlot === 'you' ? 'You' : 'Opponent'}
					</p>
					<h2 class="mt-1 text-xl font-black tracking-[-0.04em] text-white">Pick fighter</h2>
				</div>
				<button
					type="button"
					class="grid h-10 w-10 place-items-center border border-white/10 bg-[#101010] text-xl text-zinc-300"
					onclick={closeDrawer}
					aria-label="Close fighter drawer"
				>
					×
				</button>
			</div>

			<input
				type="search"
				class="w-full border border-white/10 bg-[#101010] px-3 py-2.5 text-base font-medium text-white outline-none ring-0 placeholder:text-zinc-500"
				placeholder="Search fighter..."
				bind:value={search}
			/>

			<div class="mt-3 max-h-[62dvh] overflow-y-auto pb-2">
				<div class="grid grid-cols-3 gap-2">
					{#each filteredFighters as fighter}
						<button
							type="button"
							class={`border p-2 text-center transition ${
								(fighter.id === form.youId && activeSlot === 'you') ||
								(fighter.id === form.opponentId && activeSlot === 'opponent')
									? 'border-red-500 bg-[#151515]'
									: 'border-white/10 bg-[#0d0d0d]'
							}`}
							onclick={() => pickFighter(fighter)}
						>
							<img
								src={fighter.image}
								alt={fighter.name}
								class="mx-auto h-14 w-14 border-2 border-white object-cover"
							/>
							<p class="mt-2 text-[12px] font-bold text-white">{fighter.name}</p>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<div class="fixed bottom-14 left-1 z-20 pointer-events-none">
		<div class="flex items-center gap-2 border border-white/10 bg-black/90 px-2 py-1">
			<div class="relative grid h-8 w-8 place-items-center overflow-hidden bg-[#1b1b1b]">
				<div class="absolute inset-0 bg-[conic-gradient(from_90deg,#16a34a_0_25%,#0f0f0f_25%_50%,#16a34a_50%_75%,#0f0f0f_75%_100%)]"></div>
				<div class="absolute inset-[8px] rounded-full bg-[#0b0b0b]"></div>
			</div>
			<div class="leading-none">
				<p class="text-[0.55rem] font-black uppercase tracking-[0.28em] text-zinc-500">Smash</p>
				<p class="text-[0.65rem] font-black uppercase tracking-[0.18em] text-white">Stats</p>
			</div>
		</div>
	</div>
</div>
