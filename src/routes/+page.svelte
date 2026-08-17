	<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Header from '$lib/Header.svelte';
	import {
		RECORDS_KEY,
		STORAGE_KEY,
		defaultForm,
		fighters,
		fighterById,
		lossReasons,
		normalizeFormState,
		parseMatchRecords,
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
			void goto('/stats?saved=1');
		}, 1000);
	}

	onMount(() => {
		if (!browser) return;

		try {
			const storedForm = localStorage.getItem(STORAGE_KEY);
			const storedRecords = localStorage.getItem(RECORDS_KEY);

			if (storedForm) form = normalizeFormState(JSON.parse(storedForm));
			if (storedRecords) records = parseMatchRecords(storedRecords);
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

<Header active="log" />

<main class="flex-1 overflow-y-auto px-3 pt-3 pb-[104px]">
			<section class="mb-2.5 flex flex-row overflow-hidden rounded-2xl border-[1.5px] border-[#2a2a38] bg-[#111119]">
				<div class="relative flex w-7 shrink-0 items-center justify-center border-r border-[#2a2a38] bg-[#12131c]">
					<div class="absolute whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.12em]"
						style="top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-90deg); color: rgb(232, 25, 44);"
					>
						Fighters
					</div>
				</div>
				<div class="min-w-0 flex-1 p-3 pb-3.5">
					<div class="flex flex-col gap-2.5">
						<button
							type="button"
							class="flex w-full cursor-pointer items-center gap-[10px] rounded-xl border-[1.5px] border-[#2a2a38] bg-[#111119] p-[10px_14px] text-left transition-[border-color,background] duration-150"
							onclick={() => openDrawer('you')}
						>
							<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2a2a38] text-sm font-extrabold tracking-[0.03em] text-[#666]">
								{#if selectedFighter('you')}
									<img
										src={selectedFighter('you')?.image}
										alt={selectedFighter('you')?.name ?? 'Your fighter'}
										class="h-full w-full rounded-lg object-contain object-center"
									/>
								{:else}
									?
								{/if}
							</div>
							<div class="min-w-0 flex-1 text-left">
								<div class="mb-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#8888a0]">
									You
								</div>
								<div class="truncate text-base font-bold tracking-[0.02em] text-[#444]">
									{selectedFighter('you')?.name ?? 'Select Fighter'}
								</div>
							</div>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="shrink-0">
								<path d="M4 6l4 4 4-4" stroke="#8888A0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
							</svg>
						</button>

						<div class="flex items-center gap-2">
							<div class="h-px flex-1 bg-[#2a2a38]"></div>
							<span class="text-[11px] font-bold uppercase tracking-[0.12em] text-[#444]">VS</span>
							<div class="h-px flex-1 bg-[#2a2a38]"></div>
						</div>

						<button
							type="button"
							class="flex w-full cursor-pointer items-center gap-[10px] rounded-xl border-[1.5px] border-[#2a2a38] bg-[#111119] p-[10px_14px] text-left transition-[border-color,background] duration-150"
							onclick={() => openDrawer('opponent')}
						>
							<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2a2a38] text-sm font-extrabold tracking-[0.03em] text-[#666]">
								{#if selectedFighter('opponent')}
									<img
										src={selectedFighter('opponent')?.image}
										alt={selectedFighter('opponent')?.name ?? 'Opponent fighter'}
										class="h-full w-full rounded-lg object-contain object-center"
									/>
								{:else}
									?
								{/if}
							</div>
							<div class="min-w-0 flex-1 text-left">
								<div class="mb-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#8888a0]">
									Opponent
								</div>
								<div class="truncate text-base font-bold tracking-[0.02em] text-[#444]">
									{selectedFighter('opponent')?.name ?? 'Select Fighter'}
								</div>
							</div>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="shrink-0">
								<path d="M4 6l4 4 4-4" stroke="#8888A0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
							</svg>
						</button>
					</div>
				</div>
			</section>

			<section class="mb-2.5 flex flex-row overflow-hidden rounded-2xl border-[1.5px] border-[#2a2a38] bg-[#111119]">
				<div class="relative flex w-7 shrink-0 items-center justify-center border-r border-[#2a2a38] bg-[#12131c]">
					<div class="absolute whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.12em]"
						style="top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-90deg); color: rgb(255, 213, 0);"
					>
						Result
					</div>
				</div>
				<div class="min-w-0 flex-1 p-3 pb-3.5">
					<div class="grid grid-cols-2 rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] p-[3px]">
						<button
							type="button"
							class={`rounded-lg py-2 px-1 text-[15px] font-bold uppercase tracking-[0.04em] ${
								form.result === 'win' ? 'bg-[#00c97a] text-white' : 'bg-transparent text-[#8888a0]'
							}`}
							onclick={() => {
								form.result = 'win';
							}}
						>
							Win
						</button>
						<button
							type="button"
							class={`rounded-lg py-2 px-1 text-[15px] font-bold uppercase tracking-[0.04em] ${
								form.result === 'loss' ? 'bg-[#e8192c] text-white' : 'bg-transparent text-[#8888a0]'
							}`}
							onclick={() => {
								form.result = 'loss';
							}}
						>
							Loss
						</button>
					</div>
				</div>
			</section>

			<section class="mb-2.5 flex flex-row overflow-hidden rounded-2xl border-[1.5px] border-[#2a2a38] bg-[#111119]">
				<div class="relative flex w-7 shrink-0 items-center justify-center border-r border-[#2a2a38] bg-[#12131c]">
					<div class="absolute whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.12em]"
						style="top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-90deg); color: rgb(108, 99, 255);"
					>
						Stage
					</div>
				</div>
				<div class="flex-1 p-3 pb-3.5 min-w-0">
					<div class="grid grid-cols-3 gap-1.5">
						{#each [
							{ id: 'final-destination', label: 'Final Destination' },
							{ id: 'battlefield', label: 'Battlefield' },
							{ id: 'other', label: 'Other' }
						] as stageOption}
							<button
								type="button"
								class={`rounded-[9px] py-[9px] px-1 font-display font-bold text-[12px] tracking-[0.04em] uppercase cursor-pointer transition-all duration-[120ms] leading-tight border-[1.5px] ${
									form.stage === stageOption.id
										? 'bg-[#111119] text-white border-[#2a2a38]'
										: 'bg-[#111119] text-[#666] border-[#2a2a38]'
								}`}
								onclick={() => {
									form.stage = stageOption.id as Stage;
								}}
							>
								{stageOption.label}
							</button>
						{/each}
					</div>
				</div>
			</section>

			<section class="mb-2.5 flex flex-row overflow-hidden rounded-2xl border-[1.5px] border-[#2a2a38] bg-[#111119]">
				<div class="relative flex w-7 shrink-0 items-center justify-center border-r border-[#2a2a38] bg-[#12131c]">
					<div class="absolute whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.12em]"
						style="top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-90deg); color: rgb(255, 140, 0);"
					>
						Rules
					</div>
				</div>
				<div class="min-w-0 flex-1 p-3 pb-3.5">
					<div class="flex flex-col gap-2.5">
						{#each [
							{ key: 'items', label: 'Items' },
							{ key: 'smashMeter', label: 'Smash Meter' },
							{ key: 'hazards', label: 'Stage Hazards' }
						] as toggle}
							<div class="flex items-center gap-3">
								<div class="flex-1 text-sm font-medium text-[#c7c7d3]">{toggle.label}</div>
								<div class="flex gap-1">
									<button
										type="button"
										class={`rounded-[7px] border-[1.5px] px-3 py-[5px] text-[13px] font-bold uppercase ${
											form[toggle.key as 'items' | 'smashMeter' | 'hazards' | 'eliteSmash']
												? 'border-[#444] bg-transparent text-[#555]'
												: 'border-[#444] bg-[#2a2a38] text-[#f0f0f8]'
										}`}
										onclick={() => {
											const key = toggle.key as 'items' | 'smashMeter' | 'hazards' | 'eliteSmash';
											form[key] = false;
										}}
									>
										Off
									</button>
									<button
										type="button"
										class={`rounded-[7px] border-[1.5px] px-3 py-[5px] text-[13px] font-bold uppercase ${
											form[toggle.key as 'items' | 'smashMeter' | 'hazards' | 'eliteSmash']
												? 'border-[#444] bg-[#2a2a38] text-[#f0f0f8]'
												: 'border-[#2a2a38] bg-transparent text-[#555]'
										}`}
										onclick={() => {
											const key = toggle.key as 'items' | 'smashMeter' | 'hazards' | 'eliteSmash';
											form[key] = true;
										}}
									>
										On
									</button>
								</div>
							</div>
							<div class="h-px bg-[#20222e]"></div>
						{/each}
					</div>
				</div>
			</section>

			<section class="mb-2.5 flex flex-row overflow-hidden rounded-2xl border-[1.5px] border-[#2a2a38] bg-[#111119]">
				<div class="relative flex w-7 shrink-0 items-center justify-center border-r border-[#2a2a38] bg-[#12131c]">
					<div class="absolute whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.12em]"
						style="top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-90deg); color: rgb(0, 201, 212);"
					>
						Match Meta
					</div>
				</div>
				<div class="min-w-0 flex-1 p-3 pb-3.5">
					<div class="flex flex-col gap-3">
						<div class="flex items-center gap-3">
							<div class="flex-1 text-sm font-medium text-[#c7c7d3]">Elite Smash</div>
							<div class="flex gap-1">
								<button
									type="button"
									class={`rounded-[7px] border-[1.5px] px-3 py-[5px] text-[13px] font-bold uppercase ${
										!form.eliteSmash
											? 'border-[#444] bg-[#2a2a38] text-[#f0f0f8]'
											: 'border-[#2a2a38] bg-transparent text-[#555]'
									}`}
									onclick={() => {
										form.eliteSmash = false;
									}}
								>
									No
								</button>
								<button
									type="button"
									class={`rounded-[7px] border-[1.5px] px-3 py-[5px] text-[13px] font-bold uppercase ${
										form.eliteSmash
											? 'border-[#19cfe6] bg-[#19cfe6] text-white'
											: 'border-[#2a2a38] bg-transparent text-[#555]'
									}`}
									onclick={() => {
										form.eliteSmash = true;
									}}
								>
									Yes
								</button>
							</div>
						</div>

						<div class="h-px bg-[#20222e]"></div>

						<div>
							<div class="mb-2 text-sm font-medium text-[#c7c7d3]">Satisfaction</div>
							<div class="flex gap-1.5">
								{#each [1, 2, 3, 4, 5] as rating}
									<button
										type="button"
										class="border-none bg-transparent p-0 transition-transform duration-100"
										style={`transform: scale(${rating <= form.satisfaction ? 1 : 1})`}
										onclick={() => {
											form.satisfaction = rating;
										}}
										aria-label={`Set satisfaction to ${rating}`}
									>
										<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={rating <= form.satisfaction ? '#3A3A50' : '#3A3A50'} stroke-width="1.5">
											<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
										</svg>
									</button>
								{/each}
							</div>
						</div>

						<div class="h-px bg-[#20222e]"></div>

						<div class="flex items-center gap-3">
							<div class="flex-1 text-sm font-medium text-[#c7c7d3]">Toxic Opponent?</div>
							<div class="flex gap-1">
								<button
									type="button"
									class={`rounded-[7px] border-[1.5px] px-3 py-[5px] text-[13px] font-bold uppercase ${
										!form.toxic ? 'border-[#444] bg-[#2a2a38] text-[#f0f0f8]' : 'border-[#2a2a38] bg-transparent text-[#555]'
									}`}
									onclick={() => {
										form.toxic = false;
									}}
								>
									No
								</button>
								<button
									type="button"
									class={`rounded-[7px] border-[1.5px] px-3 py-[5px] text-[13px] font-bold uppercase ${
										form.toxic ? 'border-[#444] bg-[#2a2a38] text-[#f0f0f8]' : 'border-[#2a2a38] bg-transparent text-[#555]'
									}`}
									onclick={() => {
										form.toxic = true;
									}}
								>
									Yes
								</button>
							</div>
						</div>

						{#if form.result === 'loss'}
							<div class="h-px bg-[#20222e]"></div>
							<div>
								<div class="mb-2 flex items-center justify-between gap-2">
									<div class="text-[13px] font-medium text-[#c7c7d3]">Why did you lose?</div>
									<div class="text-[11px] font-bold uppercase tracking-[0.12em] text-[#444]">
										{form.lossReasons.length} selected
									</div>
								</div>
								<div class="flex flex-wrap gap-2">
									{#each lossReasons as reason}
										<button
											type="button"
											class={`rounded-full border-[1.5px] px-4 py-[7px] text-sm font-medium ${
												form.lossReasons.includes(reason)
													? 'border-[#444] bg-[#2a2a38] text-[#f0f0f8]'
													: 'border-[#2a2a38] bg-transparent text-[#555]'
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
	</main>

	<div class="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#08080f] via-[#08080f]/95 to-transparent px-3 pt-3 pb-5">
			<div class="mx-auto max-w-[430px]">
				<button
					type="button"
					class={`w-full rounded-[14px] py-[15px] text-[17px] font-extrabold uppercase tracking-[0.12em] ${
						!form.youId || !form.opponentId || saveToastVisible
							? 'cursor-not-allowed bg-[#1a1a26] text-[#333] shadow-none'
							: 'bg-[#0fd18a] text-black'
					}`}
					onclick={saveMatch}
					disabled={!form.youId || !form.opponentId || saveToastVisible}
				>
					{!form.youId || !form.opponentId ? 'Fill Required Fields' : 'Save Match'}
				</button>
				<div class="mt-1.5 text-center text-[11px] font-body text-[#333]">
					Fighters · Stage · Satisfaction required
				</div>
			</div>
		</div>

	{#if drawerOpen}
			<button
				type="button"
				class="fixed inset-0 z-40 bg-black/80"
				onclick={closeDrawer}
				aria-label="Close fighter drawer"
			></button>
			<div class="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] rounded-t-[20px] border-t border-[#2a2a38] bg-[#0d0d16] p-4">
				<div class="mx-auto mb-3 h-1 w-16 rounded-full bg-white/15"></div>
				<div class="mb-4 flex items-start justify-between gap-3">
					<div>
						<p class="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8888a0]">
							{activeSlot === 'you' ? 'You' : 'Opponent'}
						</p>
						<h2 class="mt-1 text-lg font-bold text-white">Select Fighter</h2>
					</div>
					<button
						type="button"
						class="grid h-10 w-10 place-items-center rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] text-xl text-[#8888a0]"
						onclick={closeDrawer}
						aria-label="Close fighter drawer"
					>
						×
					</button>
				</div>

				<input
					type="search"
					class="w-full rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] px-3 py-3 text-base text-white outline-none placeholder:text-[#555]"
					placeholder="Search fighter..."
					bind:value={search}
				/>

				<div class="mt-3 max-h-[58dvh] overflow-y-auto pb-2">
					<div class="grid grid-cols-2 gap-2">
						{#each filteredFighters as fighter}
							<button
								type="button"
								class={`rounded-[14px] border-[1.5px] p-2 text-left ${
									(fighter.id === form.youId && activeSlot === 'you') ||
									(fighter.id === form.opponentId && activeSlot === 'opponent')
										? 'border-[#e8192c] bg-[#111119]'
										: 'border-[#2a2a38] bg-[#111119]'
								}`}
								onclick={() => pickFighter(fighter)}
							>
								<img
									src={fighter.image}
									alt={fighter.name}
									class="aspect-[16/9] w-full rounded-[10px] bg-[#07080d] object-contain object-center"
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
				class="fixed left-1/2 top-20 z-[200] -translate-x-1/2 whitespace-nowrap rounded-[10px] bg-[#0fd18a] px-[18px] py-[9px] text-[15px] font-bold uppercase tracking-[0.06em] text-white shadow-[0_4px_20px_rgba(0,201,122,0.4)]"
				role="status"
				aria-live="polite"
			>
				✓ Match Saved
			</div>
	{/if}
