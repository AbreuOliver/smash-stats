<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Header from '$lib/Header.svelte';
	import {
		RECORDS_KEY,
		fighters,
		filterRecords,
		fighterName,
		groupByFighter,
		parseMatchRecords,
		summaryByResult,
		type MatchRecord,
		type ResultFilter
	} from '$lib/smash-log';

	let records = $state<MatchRecord[]>([]);
	let selectedResult = $state<ResultFilter>('all');
	let selectedFighter = $state('all');
	let hydrated = $state(false);
	let selectedRecordId = $state<string | null>(null);
	let editMode = $state(false);
	let draft = $state<MatchRecord | null>(null);
	let saveToastVisible = $state(false);

	const filteredRecords = $derived.by(() =>
		filterRecords(records, { result: selectedResult, fighterId: selectedFighter })
	);

	const overallSummary = $derived.by(() => summaryByResult(records));
	const filteredSummary = $derived.by(() => summaryByResult(filteredRecords));
	const fighterBreakdown = $derived.by(() => groupByFighter(filteredRecords));
	const selectedRecord = $derived.by(() => records.find((record) => record.id === selectedRecordId) ?? null);

	function formatDate(timestamp: string) {
		return new Intl.DateTimeFormat(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		}).format(new Date(timestamp));
	}

	function openRecord(record: MatchRecord) {
		selectedRecordId = record.id;
		editMode = false;
		draft = JSON.parse(JSON.stringify(record));
	}

	function closeRecord() {
		selectedRecordId = null;
		editMode = false;
		draft = null;
	}

	function updateLocalRecords(nextRecords: MatchRecord[]) {
		records = nextRecords;
		localStorage.setItem(RECORDS_KEY, JSON.stringify(nextRecords));
	}

	function updateDraft(partial: Partial<MatchRecord>) {
		if (!draft) return;
		draft = { ...draft, ...partial } as MatchRecord;
	}

	function saveDraft() {
		if (!draft || !selectedRecordId) return;

		const nextRecords = records.map((record) => {
			if (record.id !== selectedRecordId) return record;
			return {
				...record,
				...draft,
				id: record.id,
				createdAt: record.createdAt
			};
		});

		updateLocalRecords(nextRecords);
		closeRecord();
	}

	function deleteSelectedRecord() {
		if (!selectedRecordId) return;

		const selected = records.find((record) => record.id === selectedRecordId);
		if (!selected) return;

		const confirmed = window.confirm(
			`Delete ${fighterName(selected.youId)} vs ${fighterName(selected.opponentId)}?`
		);

		if (!confirmed) return;

		updateLocalRecords(records.filter((record) => record.id !== selectedRecordId));
		closeRecord();
	}

	onMount(() => {
		if (!browser) return;

		try {
			const storedRecords = localStorage.getItem(RECORDS_KEY);
			if (storedRecords) records = parseMatchRecords(storedRecords);
		} catch {
			records = [];
		}

		const url = new URL(window.location.href);
		if (url.searchParams.get('saved') === '1') {
			saveToastVisible = true;
			window.history.replaceState({}, '', '/stats');
			window.setTimeout(() => {
				saveToastVisible = false;
			}, 1800);
		}

		hydrated = true;
	});
</script>

<svelte:head>
	<title>Smash Log History</title>
	<meta name="description" content="Local Smash Log stats, filters, and history." />
</svelte:head>

<Header active="history" />

<main class="flex-1 overflow-y-auto px-3 pt-3 pb-4">
			<section class="mb-2.5 grid grid-cols-2 gap-px rounded-2xl border-[1.5px] border-[#2a2a38] bg-[#111119] p-px">
				<div class="rounded-[14px] bg-[#111119] px-3 py-3">
					<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Total Wins</p>
					<p class="mt-1 text-3xl font-black text-[#18d17f]">{overallSummary.wins}</p>
				</div>
				<div class="rounded-[14px] bg-[#111119] px-3 py-3">
					<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Total Losses</p>
					<p class="mt-1 text-3xl font-black text-[#e8192c]">{overallSummary.losses}</p>
				</div>
				<div class="rounded-[14px] bg-[#111119] px-3 py-3">
					<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Matches</p>
					<p class="mt-1 text-3xl font-black text-white">{overallSummary.total}</p>
				</div>
				<div class="rounded-[14px] bg-[#111119] px-3 py-3">
					<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Win Rate</p>
					<p class="mt-1 text-3xl font-black text-white">{Math.round(overallSummary.winRate * 100)}%</p>
				</div>
			</section>

			<section class="mb-2.5 flex flex-row overflow-hidden rounded-2xl border-[1.5px] border-[#2a2a38] bg-[#111119]">
				<div class="relative flex w-7 shrink-0 items-center justify-center border-r border-[#2a2a38] bg-[#12131c]">
					<div class="absolute whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.12em]"
						style="top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-90deg); color: rgb(255, 213, 0);"
					>
						Filters
					</div>
				</div>
				<div class="min-w-0 flex-1 p-3 pb-3.5">
					<div class="grid grid-cols-3 gap-1.5 rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] p-[3px]">
						{#each [
							{ id: 'all', label: 'All' },
							{ id: 'win', label: 'Wins' },
							{ id: 'loss', label: 'Losses' }
						] as option}
							<button
								type="button"
								class={`rounded-lg py-[7px] px-1 text-sm font-bold uppercase tracking-[0.06em] ${
									selectedResult === option.id ? 'bg-[#e8192c] text-white' : 'bg-transparent text-[#555]'
								}`}
								onclick={() => {
									selectedResult = option.id as ResultFilter;
								}}
							>
								{option.label}
							</button>
						{/each}
					</div>

					<label class="mt-3 block">
						<span class="mb-1 block text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">
							Character
						</span>
						<select
							bind:value={selectedFighter}
							class="w-full rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] px-3 py-2.5 text-sm font-bold text-white outline-none"
						>
							<option value="all">All fighters</option>
							{#each fighters as fighter}
								<option value={fighter.id}>{fighter.name}</option>
							{/each}
						</select>
					</label>
				</div>
			</section>

			<section class="mb-2.5 flex flex-row overflow-hidden rounded-2xl border-[1.5px] border-[#2a2a38] bg-[#111119]">
				<div class="relative flex w-7 shrink-0 items-center justify-center border-r border-[#2a2a38] bg-[#12131c]">
					<div class="absolute whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.12em]"
						style="top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-90deg); color: rgb(0, 201, 212);"
					>
						Breakdown
					</div>
				</div>
				<div class="min-w-0 flex-1 p-3 pb-3.5">
					<div class="flex items-center justify-between">
						<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Filtered Rate</p>
						<p class="text-[0.7rem] font-bold text-[#5d6175]">{filteredSummary.total} matches</p>
					</div>
					<p class="mt-1 text-3xl font-black text-white">{Math.round(filteredSummary.winRate * 100)}%</p>
					<p class="mt-1 text-xs font-medium text-[#5d6175]">Win rate for the current filter set.</p>

					<div class="mt-4 h-px bg-[#20222e]"></div>

					<div class="mt-4 flex items-center justify-between">
						<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">By Character</p>
						<p class="text-[0.7rem] font-bold text-[#5d6175]">Historical</p>
					</div>

					<div class="mt-2 space-y-2">
						{#if fighterBreakdown.length}
							{#each fighterBreakdown as entry}
								<div class="overflow-hidden rounded-[14px] border-[1.5px] border-[#2a2a38] bg-[#111119]">
									<div class="flex">
										<div class={`w-1.5 ${entry.winRate >= 0.5 ? 'bg-[#18d17f]' : 'bg-[#e8192c]'}`}></div>
										<div class="flex-1 px-3 py-2.5">
											<div class="flex items-center justify-between gap-3">
												<div class="min-w-0">
													<p class="truncate text-sm font-black text-white">{entry.fighter.name}</p>
													<p class="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#5d6175]">
														{entry.wins}W / {entry.losses}L
													</p>
												</div>
												<div class="text-right">
													<p class={`text-sm font-black ${entry.winRate >= 0.5 ? 'text-[#18d17f]' : 'text-[#e8192c]'}`}>
														{Math.round(entry.winRate * 100)}%
													</p>
													<p class="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#5d6175]">
														{entry.total} matches
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							{/each}
						{:else}
							<div class="rounded-[14px] border-[1.5px] border-[#2a2a38] bg-[#111119] px-3 py-3 text-sm text-[#5d6175]">
								No character data for the current filter.
							</div>
						{/if}
					</div>
				</div>
			</section>

			<section class="mb-2.5 flex flex-row overflow-hidden rounded-2xl border-[1.5px] border-[#2a2a38] bg-[#111119]">
				<div class="relative flex w-7 shrink-0 items-center justify-center border-r border-[#2a2a38] bg-[#12131c]">
					<div class="absolute whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.12em]"
						style="top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-90deg); color: rgb(0, 201, 212);"
					>
						Matches
					</div>
				</div>
				<div class="min-w-0 flex-1 p-3 pb-3.5">
					<div class="flex items-center justify-between">
						<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">History</p>
						<p class="text-[0.7rem] font-bold text-[#5d6175]">{filteredRecords.length} shown</p>
					</div>

					<div class="mt-2 space-y-2">
						{#if filteredRecords.length}
							{#each filteredRecords as record}
								<button
									type="button"
									class="grid w-full grid-cols-[auto_1fr_auto] items-stretch gap-2 rounded-[14px] border-[1.5px] border-[#2a2a38] bg-[#111119] px-3 py-2.5 text-left cursor-pointer touch-manipulation active:bg-[#151722]"
									aria-label={`Open match details for ${fighterName(record.youId)} versus ${fighterName(record.opponentId)}`}
									onclick={(event) => {
										event.preventDefault();
										openRecord(record);
									}}
								>
									<div class={`flex min-w-[3.25rem] items-center justify-center rounded-[10px] px-2 py-1 text-[0.72rem] font-black uppercase tracking-[0.14em] ${
										record.result === 'win' ? 'bg-[#18d17f] text-white' : 'bg-[#e8192c] text-white'
									}`}>
										{record.result === 'win' ? '✓' : '✕'}
									</div>
									<div class="min-w-0">
										<p class="truncate text-sm font-bold text-white">
											{fighterName(record.youId)} vs {fighterName(record.opponentId)}
										</p>
										<p class="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#5d6175]">
											{record.stage.replaceAll('-', ' ')} · {formatDate(record.createdAt)}
										</p>
									</div>
									<div class="text-right">
										<p class="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#5d6175]">Sat.</p>
										<p class="text-sm font-black text-white">{record.satisfaction}/5</p>
									</div>
								</button>
							{/each}
						{:else}
							<div class="rounded-[14px] border-[1.5px] border-[#2a2a38] bg-[#111119] px-3 py-4 text-sm text-[#5d6175]">
								No matches found for this filter.
							</div>
						{/if}
					</div>
				</div>
			</section>

			{#if !hydrated}
				<div class="text-xs font-medium text-[#5d6175]">Loading local data…</div>
			{/if}
</main>

{#if selectedRecord}
			<button
				type="button"
				class="fixed inset-0 z-40 bg-black/80"
				onclick={closeRecord}
				aria-label="Close match details"
			></button>
			<div class="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] rounded-t-[20px] border-t border-[#2a2a38] bg-[#0d0d16] p-4">
				<div class="mx-auto mb-3 h-1 w-16 rounded-full bg-white/15"></div>
				<div class="flex items-start justify-between gap-3">
					<div>
						<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Match</p>
						<h2 class="mt-1 text-xl font-black text-white">
							{fighterName(selectedRecord.youId)} vs {fighterName(selectedRecord.opponentId)}
						</h2>
					</div>
					<div class="flex items-center gap-2">
						<button
							type="button"
							class="rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] px-3 py-2 text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#c7c7d3]"
							onclick={() => {
								editMode = !editMode;
							}}
						>
							{editMode ? 'Viewing' : 'Edit'}
						</button>
						<button
							type="button"
							class="rounded-[10px] border-[1.5px] border-[#e8192c]/50 bg-[#e8192c]/10 px-3 py-2 text-[0.7rem] font-black uppercase tracking-[0.2em] text-[#ff9aa3]"
							onclick={deleteSelectedRecord}
							aria-label="Delete match entry"
						>
							Delete
						</button>
						<button
							type="button"
							class="grid h-10 w-10 place-items-center rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] text-xl text-[#c7c7d3]"
							onclick={closeRecord}
							aria-label="Close match details"
						>
							×
						</button>
					</div>
				</div>

				{#if editMode && draft}
					<div class="mt-3 space-y-2">
						<div class="grid grid-cols-2 gap-px rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] p-[3px]">
							<button
								type="button"
								class={`h-11 rounded-lg border-0 px-3 text-left text-sm font-black uppercase tracking-[0.14em] ${
									draft.result === 'win' ? 'bg-[#18d17f] text-white' : 'bg-[#111119] text-[#8888a0]'
								}`}
								onclick={() => updateDraft({ result: 'win' })}
							>
								Won
							</button>
							<button
								type="button"
								class={`h-11 rounded-lg border-0 px-3 text-left text-sm font-black uppercase tracking-[0.14em] ${
									draft.result === 'loss' ? 'bg-[#e8192c] text-white' : 'bg-[#111119] text-[#8888a0]'
								}`}
								onclick={() => updateDraft({ result: 'loss' })}
							>
								Lost
							</button>
						</div>

						<div class="grid grid-cols-2 gap-2">
							<label class="block">
								<span class="mb-1 block text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">
									Me
								</span>
								<select
									bind:value={draft.youId}
									class="w-full rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] px-3 py-2.5 text-sm font-bold text-white outline-none"
								>
									{#each fighters as fighter}
										<option value={fighter.id}>{fighter.name}</option>
									{/each}
								</select>
							</label>

							<label class="block">
								<span class="mb-1 block text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">
									Opponent
								</span>
								<select
									bind:value={draft.opponentId}
									class="w-full rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] px-3 py-2.5 text-sm font-bold text-white outline-none"
								>
									{#each fighters as fighter}
										<option value={fighter.id}>{fighter.name}</option>
									{/each}
								</select>
							</label>
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
										draft.stage === stageOption.id ? 'bg-[#e8192c] text-white border-[#e8192c]' : 'bg-[#111119] text-[#666] border-[#2a2a38]'
									}`}
									onclick={() => updateDraft({ stage: stageOption.id as MatchRecord['stage'] })}
								>
									{stageOption.label}
								</button>
							{/each}
							</div>
						</div>

						<div class="grid grid-cols-2 gap-2">
							{#each [
								{ key: 'items', label: 'Items' },
								{ key: 'smashMeter', label: 'Smash Meter' },
								{ key: 'hazards', label: 'Hazards' },
								{ key: 'eliteSmash', label: 'Elite Smash' }
							] as toggle}
								<button
									type="button"
									class={`flex h-11 items-center justify-between rounded-[10px] border-[1.5px] px-3 text-left ${
										draft[toggle.key as 'items' | 'smashMeter' | 'hazards' | 'eliteSmash']
											? 'border-[#2a2a38] bg-[#18d17f] text-white'
											: 'border-[#2a2a38] bg-[#111119] text-[#c7c7d3]'
									}`}
									onclick={() => {
										const key = toggle.key as 'items' | 'smashMeter' | 'hazards' | 'eliteSmash';
										const currentDraft = draft;
										if (!currentDraft) return;
										draft = { ...currentDraft, [key]: !currentDraft[key] } as MatchRecord;
									}}
								>
									<span class="text-sm font-black uppercase tracking-[0.12em]">{toggle.label}</span>
									<span class="text-lg">{draft[toggle.key as 'items' | 'smashMeter' | 'hazards' | 'eliteSmash'] ? '●' : '○'}</span>
								</button>
							{/each}
						</div>

						<div class="grid grid-cols-2 gap-px rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] p-[3px]">
							<button
								type="button"
								class={`rounded-lg border-0 px-3 py-2 text-left ${
									!draft.toxic ? 'bg-[#e8192c] text-white' : 'bg-[#111119] text-[#8888a0]'
								}`}
								onclick={() => updateDraft({ toxic: false })}
							>
								<p class="text-[10px] font-black uppercase tracking-[0.35em]">Toxic</p>
								<p class="mt-1 text-lg font-black">No</p>
							</button>
							<button
								type="button"
								class={`rounded-lg border-0 px-3 py-2 text-left ${
									draft.toxic ? 'bg-[#18d17f] text-white' : 'bg-[#111119] text-[#8888a0]'
								}`}
								onclick={() => updateDraft({ toxic: true })}
							>
								<p class="text-[10px] font-black uppercase tracking-[0.35em]">Toxic</p>
								<p class="mt-1 text-lg font-black">Yes</p>
							</button>
						</div>

						<button
							type="button"
							class="w-full rounded-[14px] border border-[#0fd18a] bg-[#0fd18a] px-4 py-3 text-base font-black text-black"
							onclick={saveDraft}
						>
							Save Changes
						</button>
					</div>
				{:else}
					<div class="mt-3 space-y-2 text-sm">
						<div class="grid grid-cols-2 gap-px rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] p-[3px]">
							<div class="rounded-lg bg-[#111119] px-3 py-2">
								<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Result</p>
								<p class={`mt-1 text-lg font-black ${selectedRecord.result === 'win' ? 'text-[#18d17f]' : 'text-[#e8192c]'}`}>
									{selectedRecord.result === 'win' ? 'Won' : 'Lost'}
								</p>
							</div>
							<div class="rounded-lg bg-[#111119] px-3 py-2">
								<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Stage</p>
								<p class="mt-1 text-lg font-black text-white">{selectedRecord.stage.replaceAll('-', ' ')}</p>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-px rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] p-[3px]">
							<div class="rounded-lg bg-[#111119] px-3 py-2">
								<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Me</p>
								<p class="mt-1 text-lg font-black text-white">{fighterName(selectedRecord.youId)}</p>
							</div>
							<div class="rounded-lg bg-[#111119] px-3 py-2">
								<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Opponent</p>
								<p class="mt-1 text-lg font-black text-white">{fighterName(selectedRecord.opponentId)}</p>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-px rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] p-[3px]">
							<div class="rounded-lg bg-[#111119] px-3 py-2">
								<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Saved</p>
								<p class="mt-1 text-sm font-bold text-white">{formatDate(selectedRecord.createdAt)}</p>
							</div>
							<div class="rounded-lg bg-[#111119] px-3 py-2">
								<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Satisfaction</p>
								<p class="mt-1 text-lg font-black text-white">{selectedRecord.satisfaction}/5</p>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-px rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] p-[3px]">
							<div class="rounded-lg bg-[#111119] px-3 py-2">
								<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Items</p>
								<p class="mt-1 text-lg font-black text-white">{selectedRecord.items ? 'On' : 'Off'}</p>
							</div>
							<div class="rounded-lg bg-[#111119] px-3 py-2">
								<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Smash Meter</p>
								<p class="mt-1 text-lg font-black text-white">{selectedRecord.smashMeter ? 'On' : 'Off'}</p>
							</div>
							<div class="rounded-lg bg-[#111119] px-3 py-2">
								<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Hazards</p>
								<p class="mt-1 text-lg font-black text-white">{selectedRecord.hazards ? 'On' : 'Off'}</p>
							</div>
							<div class="rounded-lg bg-[#111119] px-3 py-2">
								<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Elite Smash</p>
								<p class="mt-1 text-lg font-black text-white">{selectedRecord.eliteSmash ? 'Yes' : 'No'}</p>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-px rounded-[10px] border-[1.5px] border-[#2a2a38] bg-[#111119] p-[3px]">
							<div class="rounded-lg bg-[#111119] px-3 py-2">
								<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Toxic</p>
								<p class="mt-1 text-lg font-black text-white">{selectedRecord.toxic ? 'Yes' : 'No'}</p>
							</div>
							<div class="rounded-lg bg-[#111119] px-3 py-2">
								<p class="text-[10px] font-black uppercase tracking-[0.35em] text-[#9c9fb2]">Loss reasons</p>
								<p class="mt-1 text-sm font-bold text-white">
									{selectedRecord.lossReasons.length ? selectedRecord.lossReasons.join(', ') : 'None'}
								</p>
							</div>
						</div>

						<button
							type="button"
							class="w-full rounded-[14px] border border-[#2a2a38] bg-[#111119] px-4 py-3 text-base font-black text-white"
							onclick={() => {
								editMode = true;
							}}
						>
							Edit Match
						</button>
					</div>
				{/if}
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
