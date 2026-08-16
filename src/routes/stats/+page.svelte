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

	const filteredRecords = $derived.by(() =>
		filterRecords(records, { result: selectedResult, fighterId: selectedFighter })
	);

	const overallSummary = $derived.by(() => summaryByResult(records));
	const filteredSummary = $derived.by(() => summaryByResult(filteredRecords));
	const fighterBreakdown = $derived.by(() => groupByFighter(filteredRecords));

	function formatDate(timestamp: string) {
		return new Intl.DateTimeFormat(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		}).format(new Date(timestamp));
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
						<div class="grid grid-cols-[auto_1fr_auto] items-center gap-2 bg-[#111111] px-3 py-2">
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
						</div>
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
</div>
