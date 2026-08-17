<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import {
		RECORDS_KEY,
		STORAGE_KEY,
		defaultForm,
		fighters,
		fighterById,
		lossReasons,
		summaryForToday,
		type Fighter,
		type FormState,
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
	let saveToastVisible = $state(false);
	let saveToastTimer: ReturnType<typeof setTimeout> | undefined;

	const todayStamp = () => new Date().toDateString();
	const selectedFighter = (slot: Slot) => fighterById.get(slot === 'you' ? form.youId : form.opponentId);
	const historyCount = $derived.by(() => records.length);

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

	function pickFighter(fighter: Fighter) {
		if (activeSlot === 'you') form.youId = fighter.id;
		else form.opponentId = fighter.id;
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
		if (saveToastVisible) return;

		const entry: MatchRecord = {
			id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
			createdAt: new Date().toISOString(),
			...JSON.parse(JSON.stringify(form))
		};

		records = [entry, ...records].slice(0, 300);
		saveToastVisible = true;

		if (saveToastTimer) clearTimeout(saveToastTimer);
		saveToastTimer = setTimeout(() => {
			saveToastVisible = false;
		}, 1800);
	}

	onMount(() => {
		if (!browser) return;

		try {
			const storedForm = localStorage.getItem(STORAGE_KEY);
			const storedRecords = localStorage.getItem(RECORDS_KEY);

			if (storedForm) form = { ...defaultForm, ...JSON.parse(storedForm) };
			if (storedRecords) records = JSON.parse(storedRecords);
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

<div class="min-h-dvh bg-[#08090e] bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.03)_0,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_10px)] text-white">
	<div class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-2.5 pb-24 pt-4">
		<header class="flex items-start justify-between gap-3">
			<div class="min-w-0">
				<div class="flex items-end gap-2">
					<h1 class="text-[2.15rem] font-black leading-none tracking-[-0.085em]">
						<span class="text-[#ff5a18]">SMASH</span><span class="text-[#ffbf2f]"> LOG</span>
					</h1>
					<span class="pb-0.5 text-[0.6rem] font-black uppercase tracking-[0.42em] text-[#5d6175]">
						Ultimate
					</span>
				</div>
			</div>

			<a href="/stats" class="w-28 rounded-[12px] border border-white/10 bg-[#949494] px-2 py-1 text-center text-black">
				<p class="text-[0.58rem] font-black uppercase tracking-[0.3em] text-black/70">Today</p>
				<div class="mt-0.5 flex items-end justify-center gap-1">
					<div class="text-lg font-black leading-none">{todaySummary.wins}</div>
					<div class="pb-0.5 text-[0.7rem] font-black leading-none text-black/70">/</div>
					<div class="text-lg font-black leading-none">{todaySummary.losses}</div>
				</div>
				<p class="mt-0.5 text-[0.55rem] font-black uppercase tracking-[0.22em] text-black/70">
					Wins / Losses
				</p>
			</a>
		</header>

		<nav class="mt-4 grid grid-cols-2 gap-px rounded-[18px] border border-[#2a2c39] bg-[#11131a] p-px">
			<div class="rounded-[15px] bg-[#ea2036] px-4 py-3 text-center text-sm font-black uppercase tracking-[0.22em] text-white">
				Log Match
			</div>
			<a href="/stats" class="rounded-[15px] bg-[#11131a] px-4 py-3 text-center text-sm font-black uppercase tracking-[0.22em] text-[#666978]">
				History ({historyCount})
			</a>
		</nav>

		<section class="mt-5 space-y-3">
			<section class="grid grid-cols-[12px_1fr] overflow-hidden rounded-[22px] border border-[#2a2c39] bg-[#12141c]">
				<div class="flex items-center justify-center border-r border-[#2a2c39] py-4">
					<span class="-rotate-90 text-[0.62rem] font-black uppercase tracking-[0.45em] text-[#ff2a31]">
						Fighters
					</span>
				</div>
				<div class="p-3">
					<div class="rounded-[18px] border border-[#2a2c39] bg-[#13151d] p-3">
						<button
							type="button"
							class="flex w-full items-center gap-3 rounded-[16px] border border-[#2a2c39] bg-[#151724] px-3 py-3 text-left"
							onclick={() => openDrawer('you')}
						>
							<div class="grid h-12 w-12 place-items-center rounded-[12px] bg-[#2b2d3e]">
								{#if selectedFighter('you')}
									<img
										src={selectedFighter('you')?.image}
										alt={selectedFighter('you')?.name ?? 'Your fighter'}
										class="h-full w-full object-contain object-center"
									/>
								{:else}
									<span class="text-xl font-black text-[#8a8f9f]">?</span>
								{/if}
							</div>
							<div class="min-w-0 flex-1">
								<p class="text-[0.72rem] font-black uppercase tracking-[0.28em] text-[#70758b]">You</p>
								<p class="truncate text-[1.02rem] font-black text-[#575c70]">
									{selectedFighter('you')?.name ?? 'Select Fighter'}
								</p>
							</div>
							<span class="text-[#70758b]">⌄</span>
						</button>

						<div class="my-3 flex items-center gap-3">
							<div class="h-px flex-1 bg-[#2a2c39]"></div>
							<span class="text-[0.7rem] font-black uppercase tracking-[0.35em] text-[#595f74]">VS</span>
							<div class="h-px flex-1 bg-[#2a2c39]"></div>
						</div>

						<button
							type="button"
							class="flex w-full items-center gap-3 rounded-[16px] border border-[#2a2c39] bg-[#151724] px-3 py-3 text-left"
							onclick={() => openDrawer('opponent')}
						>
							<div class="grid h-12 w-12 place-items-center rounded-[12px] bg-[#2b2d3e]">
								{#if selectedFighter('opponent')}
									<img
										src={selectedFighter('opponent')?.image}
										alt={selectedFighter('opponent')?.name ?? 'Opponent fighter'}
										class="h-full w-full object-contain object-center"
									/>
								{:else}
									<span class="text-xl font-black text-[#8a8f9f]">?</span>
								{/if}
							</div>
							<div class="min-w-0 flex-1">
								<p class="text-[0.72rem] font-black uppercase tracking-[0.28em] text-[#70758b]">Opponent</p>
								<p class="truncate text-[1.02rem] font-black text-[#575c70]">
									{selectedFighter('opponent')?.name ?? 'Select Fighter'}
								</p>
							</div>
							<span class="text-[#70758b]">⌄</span>
						</button>
					</div>
				</div>
			</section>

			<section class="grid grid-cols-[12px_1fr] overflow-hidden rounded-[22px] border border-[#2a2c39] bg-[#12141c]">
				<div class="flex items-center justify-center border-r border-[#2a2c39] py-4">
					<span class="-rotate-90 text-[0.62rem] font-black uppercase tracking-[0.45em] text-[#f2c400]">
						Result
					</span>
				</div>
				<div class="p-3">
					<div class="grid grid-cols-2 gap-px rounded-[18px] border border-[#2a2c39] bg-[#11131a] p-px">
						<button
							type="button"
							class={`h-12 rounded-[14px] border-0 text-sm font-black uppercase tracking-[0.3em] ${
								form.result === 'win' ? 'bg-[#18d17f] text-white' : 'bg-[#11131a] text-[#646979]'
							}`}
							onclick={() => (form.result = 'win')}
						>
							Win
						</button>
						<button
							type="button"
							class={`h-12 rounded-[14px] border-0 text-sm font-black uppercase tracking-[0.3em] ${
								form.result === 'loss' ? 'bg-[#ea2036] text-white' : 'bg-[#11131a] text-[#646979]'
							}`}
							onclick={() => (form.result = 'loss')}
						>
							Loss
						</button>
					</div>
				</div>
			</section>

			<section class="grid grid-cols-[12px_1fr] overflow-hidden rounded-[22px] border border-[#2a2c39] bg-[#12141c]">
				<div class="flex items-center justify-center border-r border-[#2a2c39] py-4">
					<span class="-rotate-90 text-[0.62rem] font-black uppercase tracking-[0.45em] text-[#5b64ff]">
						Stage
					</span>
				</div>
				<div class="p-3">
					<div class="grid grid-cols-3 gap-2">
						{#each [
							{ id: 'final-destination', label: 'Final Destination' },
							{ id: 'battlefield', label: 'Battlefield' },
							{ id: 'other', label: 'Other' }
						] as stageOption}
							<button
								type="button"
								class={`h-12 rounded-[14px] border border-[#2a2c39] px-2 text-[0.73rem] font-black uppercase tracking-[0.12em] ${
									form.stage === stageOption.id ? 'bg-[#11131a] text-white' : 'bg-[#11131a] text-[#646979]'
								}`}
								onclick={() => (form.stage = stageOption.id as Stage)}
							>
								{stageOption.label}
							</button>
						{/each}
					</div>
				</div>
			</section>

			<section class="grid grid-cols-[12px_1fr] overflow-hidden rounded-[22px] border border-[#2a2c39] bg-[#12141c]">
				<div class="flex items-center justify-center border-r border-[#2a2c39] py-4">
					<span class="-rotate-90 text-[0.62rem] font-black uppercase tracking-[0.45em] text-[#f49a00]">
						Rules
					</span>
				</div>
				<div class="p-3">
					<div class="space-y-0">
						{#each [
							{ key: 'items', label: 'Items' },
							{ key: 'smashMeter', label: 'Smash Meter' },
							{ key: 'hazards', label: 'Stage Hazards' }
						] as toggle}
							<button
								type="button"
								class="flex w-full items-center justify-between border-b border-[#2a2c39] py-4 text-left last:border-b-0"
								onclick={() => toggleFeature(toggle.key as 'items' | 'smashMeter' | 'hazards' | 'eliteSmash')}
							>
								<span class="text-[1rem] font-medium text-[#c8cbda]">{toggle.label}</span>
								<span
									class={`flex h-10 w-24 items-center justify-between rounded-[10px] border border-[#3a3d4d] px-2 text-[0.72rem] font-black uppercase ${
										form[toggle.key as 'items' | 'smashMeter' | 'hazards' | 'eliteSmash']
											? 'bg-[#11131a] text-white'
											: 'bg-[#11131a] text-[#646979]'
									}`}
								>
									<span>Off</span>
									<span>On</span>
								</span>
							</button>
						{/each}
					</div>
				</div>
			</section>

			<section class="grid grid-cols-[12px_1fr] overflow-hidden rounded-[22px] border border-[#2a2c39] bg-[#12141c]">
				<div class="flex items-center justify-center border-r border-[#2a2c39] py-4">
					<span class="-rotate-90 text-[0.62rem] font-black uppercase tracking-[0.45em] text-[#17c9e6]">
						Match Meta
					</span>
				</div>
				<div class="p-3">
					<div class="space-y-4">
						<div class="flex items-center justify-between border-b border-[#2a2c39] pb-4">
							<span class="text-[1rem] font-medium text-[#c8cbda]">Elite Smash</span>
							<div class="grid grid-cols-2 gap-px rounded-[10px] border border-[#3a3d4d] bg-[#11131a] p-px">
								<button
									type="button"
									class={`h-10 w-14 rounded-[10px] border-0 text-[0.72rem] font-black uppercase ${
										!form.eliteSmash ? 'bg-[#11131a] text-[#646979]' : 'bg-[#11131a] text-[#646979]'
									}`}
									onclick={() => {
										form.eliteSmash = false;
									}}
								>
									No
								</button>
								<button
									type="button"
									class={`h-10 w-14 rounded-[10px] border-0 text-[0.72rem] font-black uppercase ${
										form.eliteSmash ? 'bg-[#19cfe6] text-white' : 'bg-[#11131a] text-[#646979]'
									}`}
									onclick={() => {
										form.eliteSmash = true;
									}}
								>
									Yes
								</button>
							</div>
						</div>

						<div>
							<div class="mb-2 flex items-center justify-between">
								<span class="text-[1rem] font-medium text-[#c8cbda]">Satisfaction</span>
								<span class="text-[0.7rem] font-bold text-[#646979]">{form.satisfaction}/5</span>
							</div>
							<div class="flex gap-2">
								{#each [1, 2, 3, 4, 5] as rating}
									<button
										type="button"
										class="text-3xl leading-none transition"
										onclick={() => {
											form.satisfaction = rating;
										}}
										aria-label={`Set satisfaction to ${rating}`}
									>
										<span class={rating <= form.satisfaction ? 'text-[#4c4a7a]' : 'text-[#2b2d42]'}>☆</span>
									</button>
								{/each}
							</div>
						</div>

						<div class="border-t border-[#2a2c39] pt-4">
							<div class="flex items-center justify-between">
								<span class="text-[1rem] font-medium text-[#c8cbda]">Toxic Opponent?</span>
								<div class="grid grid-cols-2 gap-px rounded-[10px] border border-[#3a3d4d] bg-[#11131a] p-px">
									<button
										type="button"
										class={`h-10 w-14 rounded-[10px] border-0 text-[0.72rem] font-black uppercase ${
											!form.toxic ? 'bg-[#ea2036] text-white' : 'bg-[#11131a] text-[#646979]'
										}`}
										onclick={() => {
											form.toxic = false;
										}}
									>
										No
									</button>
									<button
										type="button"
										class={`h-10 w-14 rounded-[10px] border-0 text-[0.72rem] font-black uppercase ${
											form.toxic ? 'bg-[#11131a] text-[#646979]' : 'bg-[#11131a] text-[#646979]'
										}`}
										onclick={() => {
											form.toxic = true;
										}}
									>
										Yes
									</button>
								</div>
							</div>
						</div>

						{#if form.result === 'loss'}
							<div class="border-t border-[#2a2c39] pt-4">
								<div class="mb-2 flex items-center justify-between gap-2">
									<div>
										<p class="text-[0.72rem] font-black uppercase tracking-[0.28em] text-[#ff2a31]">
											Why did you lose?
										</p>
										<p class="mt-1 text-[0.72rem] text-[#646979]">Select all that apply</p>
									</div>
									<div class="text-[0.72rem] font-black uppercase tracking-[0.2em] text-[#646979]">
										{form.lossReasons.length} selected
									</div>
								</div>
								<div class="grid grid-cols-2 gap-2">
									{#each lossReasons as reason}
										<button
											type="button"
											class={`rounded-[999px] border border-[#2f3240] px-3 py-2 text-left text-[0.75rem] font-bold ${
												form.lossReasons.includes(reason)
													? 'bg-[#11131a] text-[#c9cdd9]'
													: 'bg-[#11131a] text-[#595f74]'
											}`}
											onclick={() => toggleReason(reason)}
										>
											{reason}
										</button>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			</section>
		</section>
	</div>

	<div class="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0a0b11] px-3 py-3">
		<div class="mx-auto w-full max-w-[430px]">
			<button
				type="button"
				class={`flex h-14 w-full items-center justify-center gap-3 rounded-[14px] border-0 text-[0.95rem] font-black uppercase tracking-[0.2em] ${
					!form.youId || !form.opponentId || saveToastVisible
						? 'bg-[#262836] text-zinc-500'
						: 'bg-[#0fd18a] text-black'
				}`}
				onclick={saveMatch}
				disabled={!form.youId || !form.opponentId || saveToastVisible}
			>
				<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.9">
					<path d="M5 4h11l3 3v13H5z" />
					<path d="M8 4v6h8V4" />
					<path d="M8 18h8" />
				</svg>
				{!form.youId || !form.opponentId ? 'Fill Required Fields' : 'Save Match'}
			</button>
			<p class="mt-2 text-center text-[0.66rem] font-medium text-zinc-500">
				Fighters · Stage · Satisfaction required
			</p>
		</div>
	</div>

	{#if drawerOpen}
		<button
			type="button"
			class="fixed inset-0 z-40 bg-black/85"
			onclick={closeDrawer}
			aria-label="Close fighter drawer"
		></button>
		<div class="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] rounded-t-[20px] border-t border-[#2a2c39] bg-[#0b0c12] p-4">
			<div class="mx-auto mb-3 h-1 w-16 bg-white/20"></div>
			<div class="mb-4 flex items-start justify-between gap-3">
				<div>
					<p class="text-[0.72rem] font-black uppercase tracking-[0.3em] text-[#70758b]">
						{activeSlot === 'you' ? 'You' : 'Opponent'}
					</p>
					<h2 class="mt-1 text-xl font-black text-white">Select Fighter</h2>
				</div>
				<button
					type="button"
					class="grid h-10 w-10 place-items-center border border-[#2a2c39] bg-[#171924] text-xl text-zinc-300"
					onclick={closeDrawer}
					aria-label="Close fighter drawer"
				>
					×
				</button>
			</div>

			<input
				type="search"
				class="w-full border border-[#2a2c39] bg-[#151722] px-3 py-3 text-base font-medium text-white outline-none ring-0 placeholder:text-[#646979]"
				placeholder="Search fighter..."
				bind:value={search}
			/>

			<div class="mt-3 max-h-[58dvh] overflow-y-auto pb-2">
				<div class="grid grid-cols-2 gap-2">
					{#each filteredFighters as fighter}
						<button
							type="button"
							class={`rounded-[14px] border border-white/10 bg-[#11131b] p-2 text-left ${
								(fighter.id === form.youId && activeSlot === 'you') ||
								(fighter.id === form.opponentId && activeSlot === 'opponent')
									? 'border-red-500'
									: ''
							}`}
							onclick={() => pickFighter(fighter)}
						>
							<img
								src={fighter.image}
								alt={fighter.name}
								class="aspect-[16/9] w-full bg-[#07080d] object-contain object-center"
							/>
							<p class="mt-2 text-[0.78rem] font-black text-white">{fighter.name}</p>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	{#if saveToastVisible}
		<div
			class="fixed inset-x-0 bottom-20 z-[60] mx-auto w-fit max-w-[90vw] rounded-[12px] border border-[#0fd18a] bg-[#0fd18a] px-4 py-2 text-center text-sm font-black text-black shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
			role="status"
			aria-live="polite"
		>
			Match saved
		</div>
	{/if}
</div>
