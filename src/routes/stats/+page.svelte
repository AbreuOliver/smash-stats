<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import {
		RECORDS_KEY,
		fighters,
		filterRecords,
		fighterName,
		groupByFighter,
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

	onMount(() => {
		if (!browser) return;

		try {
			const storedRecords = localStorage.getItem(RECORDS_KEY);
			if (storedRecords) {
				records = JSON.parse(storedRecords);
			}
		} catch {
			records = [];
		}

		hydrated = true;
	});
</script>

<svelte:head>
	<title>Smash Log Stats</title>
	<meta name="description" content="Local Smash Log stats, filters, and history." />
</svelte:head>

<div class="min-h-dvh bg-[#050505] text-white">
	<div class="mx-auto flex min-h-dvh w-full max-w-[460px] flex-col px-1 pb-4 pt-1">
		<header class="border border-white/10 bg-black px-2 py-2">
			<div class="flex items-center justify-between gap-2">
				<div class="min-w-0">
					<p class="text-[10px] font-black uppercase tracking-[0.45em] text-zinc-500">Local Stats</p>
					<h1 class="text-[1.7rem] font-black tracking-[-0.07em] text-white">HISTORY</h1>
				</div>

				<a
					href="/"
					class="border border-white/10 bg-[#0b0b0b] px-3 py-2 text-[0.75rem] font-black uppercase tracking-[0.2em] text-zinc-300"
				>
					Back
				</a>
			</div>
		</header>

		<section class="mt-1 grid grid-cols-2 gap-px bg-white/10 p-px">
			<div class="bg-[#0b0b0b] px-3 py-3">
				<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Total Wins</p>
				<p class="mt-1 text-3xl font-black text-emerald-400">{overallSummary.wins}</p>
			</div>
			<div class="bg-[#0b0b0b] px-3 py-3">
				<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Total Losses</p>
				<p class="mt-1 text-3xl font-black text-red-500">{overallSummary.losses}</p>
			</div>
			<div class="bg-[#0b0b0b] px-3 py-3">
				<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Matches</p>
				<p class="mt-1 text-3xl font-black text-white">{overallSummary.total}</p>
			</div>
			<div class="bg-[#0b0b0b] px-3 py-3">
				<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Win Rate</p>
				<p class="mt-1 text-3xl font-black text-white">
					{Math.round(overallSummary.winRate * 100)}%
				</p>
			</div>
		</section>

		<section class="mt-1 border border-white/10 bg-[#0b0b0b] px-2 py-2">
			<div class="grid grid-cols-3 gap-px bg-white/10 p-px">
				{#each [
					{ id: 'all', label: 'All' },
					{ id: 'win', label: 'Wins' },
					{ id: 'loss', label: 'Losses' }
				] as option}
					<button
						type="button"
						class={`h-10 border-0 px-2 text-[0.75rem] font-black uppercase tracking-[0.14em] ${
							selectedResult === option.id ? 'bg-white text-black' : 'bg-[#111111] text-zinc-300'
						}`}
						onclick={() => {
							selectedResult = option.id as ResultFilter;
						}}
					>
						{option.label}
					</button>
				{/each}
			</div>

			<label class="mt-2 block">
				<span class="mb-1 block text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">
					Character
				</span>
				<select
					bind:value={selectedFighter}
					class="w-full border border-white/10 bg-[#111111] px-3 py-2.5 text-sm font-bold text-white outline-none"
				>
					<option value="all">All fighters</option>
					{#each fighters as fighter}
						<option value={fighter.id}>{fighter.name}</option>
					{/each}
				</select>
			</label>
		</section>

		<section class="mt-1 border border-white/10 bg-[#0b0b0b] px-2 py-2">
			<div class="flex items-center justify-between">
				<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Filtered Rate</p>
				<p class="text-[0.7rem] font-bold text-zinc-500">{filteredSummary.total} matches</p>
			</div>
			<p class="mt-1 text-3xl font-black text-white">{Math.round(filteredSummary.winRate * 100)}%</p>
			<p class="mt-1 text-xs font-medium text-zinc-500">Win rate for the current filter set.</p>
		</section>

		<section class="mt-1 border border-white/10 bg-[#0b0b0b] px-2 py-2">
			<div class="flex items-center justify-between">
				<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">By Character</p>
				<p class="text-[0.7rem] font-bold text-zinc-500">Historical</p>
			</div>

			<div class="mt-2 space-y-px bg-white/10 p-px">
				{#if fighterBreakdown.length}
					{#each fighterBreakdown as entry}
						<div class="flex items-center justify-between gap-3 bg-[#111111] px-3 py-2">
							<div class="min-w-0">
								<p class="truncate text-sm font-black text-white">{entry.fighter.name}</p>
								<p class="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">
									{entry.wins}W / {entry.losses}L
								</p>
							</div>
							<div class="text-right">
								<p class="text-sm font-black text-white">{Math.round(entry.winRate * 100)}%</p>
								<p class="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">
									{entry.total} matches
								</p>
							</div>
						</div>
					{/each}
				{:else}
					<div class="bg-[#111111] px-3 py-3 text-sm text-zinc-500">
						No character data for the current filter.
					</div>
				{/if}
			</div>
		</section>

		<section class="mt-1 border border-white/10 bg-[#0b0b0b] px-2 py-2">
			<div class="flex items-center justify-between">
				<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Matches</p>
				<p class="text-[0.7rem] font-bold text-zinc-500">{filteredRecords.length} shown</p>
			</div>

			<div class="mt-2 space-y-px bg-white/10 p-px">
				{#if filteredRecords.length}
					{#each filteredRecords as record}
						<button
							type="button"
							class="grid grid-cols-[auto_1fr_auto] items-center gap-2 bg-[#111111] px-3 py-2 text-left"
							onclick={() => openRecord(record)}
						>
							<div
								class={`text-sm font-black uppercase tracking-[0.18em] ${
									record.result === 'win' ? 'text-emerald-400' : 'text-red-500'
								}`}
							>
								{record.result}
							</div>
							<div class="min-w-0">
								<p class="truncate text-sm font-bold text-white">
									{fighterName(record.youId)} vs {fighterName(record.opponentId)}
								</p>
								<p class="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">
									{record.stage.replaceAll('-', ' ')} · {formatDate(record.createdAt)}
								</p>
							</div>
							<div class="text-right">
								<p class="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">Sat.</p>
								<p class="text-sm font-black text-white">{record.satisfaction}/5</p>
							</div>
						</button>
					{/each}
				{:else}
					<div class="bg-[#111111] px-3 py-4 text-sm text-zinc-500">
						No matches found for this filter.
					</div>
				{/if}
			</div>
		</section>

		{#if !hydrated}
			<div class="mt-2 text-xs font-medium text-zinc-500">Loading local data…</div>
		{/if}
	</div>

	{#if selectedRecord}
		<button
			type="button"
			class="fixed inset-0 z-40 bg-black/80"
			onclick={closeRecord}
			aria-label="Close match details"
		></button>
		<div class="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[460px] border border-white/10 bg-black p-3">
			<div class="mx-auto mb-2 h-1 w-20 bg-white/15"></div>
			<div class="flex items-start justify-between gap-3">
				<div>
					<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Match</p>
					<h2 class="mt-1 text-xl font-black text-white">
						{fighterName(selectedRecord.youId)} vs {fighterName(selectedRecord.opponentId)}
					</h2>
				</div>
				<div class="flex items-center gap-2">
					<button
						type="button"
						class="border border-white/10 bg-[#101010] px-3 py-2 text-[0.7rem] font-black uppercase tracking-[0.2em] text-zinc-300"
						onclick={() => {
							editMode = !editMode;
						}}
					>
						{editMode ? 'Viewing' : 'Edit'}
					</button>
					<button
						type="button"
						class="grid h-10 w-10 place-items-center border border-white/10 bg-[#101010] text-xl text-zinc-300"
						onclick={closeRecord}
						aria-label="Close match details"
					>
						×
					</button>
				</div>
			</div>

			{#if editMode && draft}
				<div class="mt-3 space-y-2">
					<div class="grid grid-cols-2 gap-px bg-white/10 p-px">
						<button
							type="button"
							class={`h-11 border-0 px-3 text-left text-sm font-black uppercase tracking-[0.14em] ${
								draft.result === 'win' ? 'bg-emerald-500 text-white' : 'bg-[#111111] text-zinc-300'
							}`}
							onclick={() => updateDraft({ result: 'win' })}
						>
							Won
						</button>
						<button
							type="button"
							class={`h-11 border-0 px-3 text-left text-sm font-black uppercase tracking-[0.14em] ${
								draft.result === 'loss' ? 'bg-red-500 text-white' : 'bg-[#111111] text-zinc-300'
							}`}
							onclick={() => updateDraft({ result: 'loss' })}
						>
							Lost
						</button>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<label class="block">
							<span class="mb-1 block text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">
								Me
							</span>
							<select
								bind:value={draft.youId}
								class="w-full border border-white/10 bg-[#111111] px-3 py-2.5 text-sm font-bold text-white outline-none"
							>
								{#each fighters as fighter}
									<option value={fighter.id}>{fighter.name}</option>
								{/each}
							</select>
						</label>

						<label class="block">
							<span class="mb-1 block text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">
								Opponent
							</span>
							<select
								bind:value={draft.opponentId}
								class="w-full border border-white/10 bg-[#111111] px-3 py-2.5 text-sm font-bold text-white outline-none"
							>
								{#each fighters as fighter}
									<option value={fighter.id}>{fighter.name}</option>
								{/each}
							</select>
						</label>
					</div>

					<div class="grid grid-cols-3 gap-px bg-white/10 p-px">
						{#each [
							{ id: 'final-destination', label: 'Final Destination' },
							{ id: 'battlefield', label: 'Battlefield' },
							{ id: 'other', label: 'Other' }
						] as stageOption}
							<button
								type="button"
								class={`h-11 border-0 px-2 text-[0.75rem] font-bold uppercase tracking-[0.14em] ${
									draft.stage === stageOption.id ? 'bg-red-500 text-white' : 'bg-[#111111] text-zinc-300'
								}`}
								onclick={() => updateDraft({ stage: stageOption.id as MatchRecord['stage'] })}
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
								class={`flex h-11 items-center justify-between border-0 px-3 text-left ${
									draft[toggle.key as 'items' | 'smashMeter' | 'hazards' | 'eliteSmash']
										? 'bg-white text-black'
										: 'bg-[#111111] text-zinc-300'
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

					<div class="grid grid-cols-2 gap-px bg-white/10 p-px">
						<button
							type="button"
							class={`border-0 px-3 py-2 text-left ${
								!draft.toxic ? 'bg-red-500 text-white' : 'bg-[#111111] text-zinc-400'
							}`}
							onclick={() => updateDraft({ toxic: false })}
						>
							<p class="text-[10px] font-black uppercase tracking-[0.35em]">Toxic</p>
							<p class="mt-1 text-lg font-black">No</p>
						</button>
						<button
							type="button"
							class={`border-0 px-3 py-2 text-left ${
								draft.toxic ? 'bg-red-500 text-white' : 'bg-[#111111] text-zinc-400'
							}`}
							onclick={() => updateDraft({ toxic: true })}
						>
							<p class="text-[10px] font-black uppercase tracking-[0.35em]">Toxic</p>
							<p class="mt-1 text-lg font-black">Yes</p>
						</button>
					</div>

					<button
						type="button"
						class="w-full border border-emerald-500 bg-emerald-500 px-4 py-3 text-base font-black text-black"
						onclick={saveDraft}
					>
						Save Changes
					</button>
				</div>
			{:else}
				<div class="mt-3 space-y-2 text-sm">
					<div class="grid grid-cols-2 gap-px bg-white/10 p-px">
						<div class="bg-[#111111] px-3 py-2">
							<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Result</p>
							<p class={`mt-1 text-lg font-black ${selectedRecord.result === 'win' ? 'text-emerald-400' : 'text-red-500'}`}>
								{selectedRecord.result === 'win' ? 'Won' : 'Lost'}
							</p>
						</div>
						<div class="bg-[#111111] px-3 py-2">
							<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Stage</p>
							<p class="mt-1 text-lg font-black text-white">{selectedRecord.stage.replaceAll('-', ' ')}</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-px bg-white/10 p-px">
						<div class="bg-[#111111] px-3 py-2">
							<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Me</p>
							<p class="mt-1 text-lg font-black text-white">{fighterName(selectedRecord.youId)}</p>
						</div>
						<div class="bg-[#111111] px-3 py-2">
							<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Opponent</p>
							<p class="mt-1 text-lg font-black text-white">{fighterName(selectedRecord.opponentId)}</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-px bg-white/10 p-px">
						<div class="bg-[#111111] px-3 py-2">
							<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Saved</p>
							<p class="mt-1 text-sm font-bold text-white">{formatDate(selectedRecord.createdAt)}</p>
						</div>
						<div class="bg-[#111111] px-3 py-2">
							<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Satisfaction</p>
							<p class="mt-1 text-lg font-black text-white">{selectedRecord.satisfaction}/5</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-px bg-white/10 p-px">
						<div class="bg-[#111111] px-3 py-2">
							<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Items</p>
							<p class="mt-1 text-lg font-black text-white">{selectedRecord.items ? 'On' : 'Off'}</p>
						</div>
						<div class="bg-[#111111] px-3 py-2">
							<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Smash Meter</p>
							<p class="mt-1 text-lg font-black text-white">{selectedRecord.smashMeter ? 'On' : 'Off'}</p>
						</div>
						<div class="bg-[#111111] px-3 py-2">
							<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Hazards</p>
							<p class="mt-1 text-lg font-black text-white">{selectedRecord.hazards ? 'On' : 'Off'}</p>
						</div>
						<div class="bg-[#111111] px-3 py-2">
							<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Elite Smash</p>
							<p class="mt-1 text-lg font-black text-white">{selectedRecord.eliteSmash ? 'Yes' : 'No'}</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-px bg-white/10 p-px">
						<div class="bg-[#111111] px-3 py-2">
							<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Toxic</p>
							<p class="mt-1 text-lg font-black text-white">{selectedRecord.toxic ? 'Yes' : 'No'}</p>
						</div>
						<div class="bg-[#111111] px-3 py-2">
							<p class="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Loss reasons</p>
							<p class="mt-1 text-sm font-bold text-white">
								{selectedRecord.lossReasons.length ? selectedRecord.lossReasons.join(', ') : 'None'}
							</p>
						</div>
					</div>

					<button
						type="button"
						class="w-full border border-white/10 bg-[#111111] px-4 py-3 text-base font-black text-white"
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
</div>
