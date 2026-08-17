export type Result = 'win' | 'loss';
export type Stage = 'final-destination' | 'battlefield' | 'other';

export type Fighter = {
	id: string;
	name: string;
	image: string;
};

export type MatchRecord = {
	id: string;
	createdAt: string;
	result: Result;
	youId: string;
	opponentId: string;
	stage: Stage;
	items: boolean;
	smashMeter: boolean;
	hazards: boolean;
	eliteSmash: boolean;
	satisfaction: number;
	toxic: boolean;
	lossReasons: string[];
};

export type FormState = Omit<MatchRecord, 'id' | 'createdAt'>;

export type ResultFilter = 'all' | Result;

export const STORAGE_KEY = 'smash-log-form-v1';
export const RECORDS_KEY = 'smash-log-records-v1';

type RosterEntry = {
	id: string;
	name: string;
	codeName: string;
};

const roster: RosterEntry[] = [
	{ id: 'mario', name: 'Mario', codeName: 'mario' },
	{ id: 'donkey_kong', name: 'Donkey Kong', codeName: 'donkey_kong' },
	{ id: 'link', name: 'Link', codeName: 'link' },
	{ id: 'samus', name: 'Samus', codeName: 'samus' },
	{ id: 'dark_samus', name: 'Dark Samus', codeName: 'dark_samus' },
	{ id: 'yoshi', name: 'Yoshi', codeName: 'yoshi' },
	{ id: 'kirby', name: 'Kirby', codeName: 'kirby' },
	{ id: 'fox', name: 'Fox', codeName: 'fox' },
	{ id: 'pikachu', name: 'Pikachu', codeName: 'pikachu' },
	{ id: 'luigi', name: 'Luigi', codeName: 'luigi' },
	{ id: 'ness', name: 'Ness', codeName: 'ness' },
	{ id: 'captain_falcon', name: 'Captain Falcon', codeName: 'captain_falcon' },
	{ id: 'jigglypuff', name: 'Jigglypuff', codeName: 'jigglypuff' },
	{ id: 'peach', name: 'Peach', codeName: 'peach' },
	{ id: 'daisy', name: 'Daisy', codeName: 'daisy' },
	{ id: 'bowser', name: 'Bowser', codeName: 'bowser' },
	{ id: 'ice_climbers', name: 'Ice Climbers', codeName: 'ice_climbers' },
	{ id: 'sheik', name: 'Sheik', codeName: 'sheik' },
	{ id: 'zelda', name: 'Zelda', codeName: 'zelda' },
	{ id: 'dr_mario', name: 'Dr. Mario', codeName: 'dr_mario' },
	{ id: 'pichu', name: 'Pichu', codeName: 'pichu' },
	{ id: 'falco', name: 'Falco', codeName: 'falco' },
	{ id: 'marth', name: 'Marth', codeName: 'marth' },
	{ id: 'lucina', name: 'Lucina', codeName: 'lucina' },
	{ id: 'young_link', name: 'Young Link', codeName: 'young_link' },
	{ id: 'ganondorf', name: 'Ganondorf', codeName: 'ganondorf' },
	{ id: 'mewtwo', name: 'Mewtwo', codeName: 'mewtwo' },
	{ id: 'roy', name: 'Roy', codeName: 'roy' },
	{ id: 'chrom', name: 'Chrom', codeName: 'chrom' },
	{ id: 'mr_game_and_watch', name: 'Mr. Game & Watch', codeName: 'mr_game_and_watch' },
	{ id: 'meta_knight', name: 'Meta Knight', codeName: 'meta_knight' },
	{ id: 'pit', name: 'Pit', codeName: 'pit' },
	{ id: 'dark_pit', name: 'Dark Pit', codeName: 'dark_pit' },
	{ id: 'zero_suit_samus', name: 'Zero Suit Samus', codeName: 'zero_suit_samus' },
	{ id: 'wario', name: 'Wario', codeName: 'wario' },
	{ id: 'snake', name: 'Snake', codeName: 'snake' },
	{ id: 'ike', name: 'Ike', codeName: 'ike' },
	{ id: 'pokemon_trainer', name: 'Pokemon Trainer', codeName: 'pokemon_trainer' },
	{ id: 'sonic', name: 'Sonic', codeName: 'sonic' },
	{ id: 'diddy_kong', name: 'Diddy Kong', codeName: 'diddy_kong' },
	{ id: 'lucas', name: 'Lucas', codeName: 'lucas' },
	{ id: 'lucario', name: 'Lucario', codeName: 'lucario' },
	{ id: 'king_dedede', name: 'King Dedede', codeName: 'king_dedede' },
	{ id: 'olimar', name: 'Olimar', codeName: 'olimar' },
	{ id: 'rob', name: 'R.O.B.', codeName: 'rob' },
	{ id: 'toon_link', name: 'Toon Link', codeName: 'toon_link' },
	{ id: 'wolf', name: 'Wolf', codeName: 'wolf' },
	{ id: 'villager', name: 'Villager', codeName: 'villager' },
	{ id: 'mega_man', name: 'Mega Man', codeName: 'mega_man' },
	{ id: 'wii_fit_trainer', name: 'Wii Fit Trainer', codeName: 'wii_fit_trainer' },
	{ id: 'rosalina_and_luma', name: 'Rosalina & Luma', codeName: 'rosalina_and_luma' },
	{ id: 'little_mac', name: 'Little Mac', codeName: 'little_mac' },
	{ id: 'greninja', name: 'Greninja', codeName: 'greninja' },
	{ id: 'mii_fighter', name: 'Mii Fighter', codeName: 'mii_fighter' },
	{ id: 'palutena', name: 'Palutena', codeName: 'palutena' },
	{ id: 'pac_man', name: 'Pac-Man', codeName: 'pac_man' },
	{ id: 'robin', name: 'Robin', codeName: 'robin' },
	{ id: 'shulk', name: 'Shulk', codeName: 'shulk' },
	{ id: 'bowser_jr', name: 'Bowser Jr.', codeName: 'bowser_jr' },
	{ id: 'duck_hunt', name: 'Duck Hunt', codeName: 'duck_hunt' },
	{ id: 'ryu', name: 'Ryu', codeName: 'ryu' },
	{ id: 'ken', name: 'Ken', codeName: 'ken' },
	{ id: 'cloud', name: 'Cloud', codeName: 'cloud' },
	{ id: 'corrin', name: 'Corrin', codeName: 'corrin' },
	{ id: 'bayonetta', name: 'Bayonetta', codeName: 'bayonetta' },
	{ id: 'inkling', name: 'Inkling', codeName: 'inkling' },
	{ id: 'ridley', name: 'Ridley', codeName: 'ridley' },
	{ id: 'simon', name: 'Simon', codeName: 'simon' },
	{ id: 'richter', name: 'Richter', codeName: 'richter' },
	{ id: 'king_k_rool', name: 'King K. Rool', codeName: 'king_k_rool' },
	{ id: 'isabelle', name: 'Isabelle', codeName: 'shizue' },
	{ id: 'incineroar', name: 'Incineroar', codeName: 'gaogaen' },
	{ id: 'piranha_plant', name: 'Piranha Plant', codeName: 'packun_flower' },
	{ id: 'joker', name: 'Joker', codeName: 'joker' },
	{ id: 'hero', name: 'Hero', codeName: 'dq_hero' },
	{ id: 'banjo_and_kazooie', name: 'Banjo & Kazooie', codeName: 'banjo_and_kazooie' },
	{ id: 'terry', name: 'Terry', codeName: 'terry' },
	{ id: 'byleth', name: 'Byleth', codeName: 'byleth' },
	{ id: 'min_min', name: 'Min Min', codeName: 'minmin' },
	{ id: 'steve', name: 'Steve / Alex', codeName: 'steve' },
	{ id: 'sephiroth', name: 'Sephiroth', codeName: 'sephiroth' },
	{ id: 'pyra_mythra', name: 'Pyra / Mythra', codeName: 'homura' },
	{ id: 'kazuya', name: 'Kazuya', codeName: 'kazuya' },
	{ id: 'sora', name: 'Sora', codeName: 'sora' }
];

const fighterAssetBase = 'https://www.smashbros.com/assets_v2/img/fighter/thumb_h';

function fighterImageUrl(codeName: string) {
	return `${fighterAssetBase.replace('/thumb_h', '')}/${codeName}/main.png`;
}

export const fighters: Fighter[] = roster
	.map(({ id, name, codeName }) => ({
		id,
		name,
		image: fighterImageUrl(codeName)
	}))
	.sort((left, right) => left.name.localeCompare(right.name));

export const lossReasons = [
	'Outplayed',
	'Matchup',
	"Couldn't Adapt",
	'Mistakes',
	'Recovery',
	'SD',
	'Ruleset',
	'Lag',
	'Other'
];

export const defaultYouId = fighters.find((fighter) => fighter.id === 'mario')?.id ?? fighters[0]?.id ?? '';
export const defaultOpponentId = fighters.find((fighter) => fighter.id === 'fox')?.id ?? fighters[1]?.id ?? '';

export const defaultForm: FormState = {
	result: 'win',
	youId: defaultYouId,
	opponentId: defaultOpponentId,
	stage: 'final-destination',
	items: false,
	smashMeter: false,
	hazards: false,
	eliteSmash: false,
	satisfaction: 0,
	toxic: false,
	lossReasons: []
};

export const fighterById = new Map(fighters.map((fighter) => [fighter.id, fighter]));

function isResult(value: unknown): value is Result {
	return value === 'win' || value === 'loss';
}

function isStage(value: unknown): value is Stage {
	return value === 'final-destination' || value === 'battlefield' || value === 'other';
}

function normalizeBoolean(value: unknown, fallback = false) {
	return typeof value === 'boolean' ? value : fallback;
}

function normalizeLossReasons(value: unknown) {
	if (!Array.isArray(value)) return [];
	return value.filter((reason): reason is string => typeof reason === 'string');
}

function normalizeFormSatisfaction(value: unknown, fallback = 0) {
	if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
	return Math.min(5, Math.max(0, Math.round(value)));
}

export function normalizeMatchRecord(value: unknown): MatchRecord | null {
	if (!value || typeof value !== 'object') return null;

	const candidate = value as Partial<MatchRecord>;
	const id = typeof candidate.id === 'string' && candidate.id ? candidate.id : null;
	const createdAt =
		typeof candidate.createdAt === 'string' && !Number.isNaN(Date.parse(candidate.createdAt))
			? candidate.createdAt
			: new Date().toISOString();

	if (!id) return null;

	return {
		id,
		createdAt,
		result: isResult(candidate.result) ? candidate.result : 'win',
		youId: typeof candidate.youId === 'string' && fighterById.has(candidate.youId) ? candidate.youId : defaultYouId,
		opponentId:
			typeof candidate.opponentId === 'string' && fighterById.has(candidate.opponentId)
				? candidate.opponentId
				: defaultOpponentId,
		stage: isStage(candidate.stage) ? candidate.stage : 'other',
		items: normalizeBoolean(candidate.items),
		smashMeter: normalizeBoolean(candidate.smashMeter),
		hazards: normalizeBoolean(candidate.hazards),
		eliteSmash: normalizeBoolean(candidate.eliteSmash),
		satisfaction:
			typeof candidate.satisfaction === 'number'
				? Math.min(5, Math.max(1, Math.round(candidate.satisfaction)))
				: 3,
		toxic: normalizeBoolean(candidate.toxic),
		lossReasons: normalizeLossReasons(candidate.lossReasons)
	};
}

export function parseMatchRecords(raw: string | null) {
	if (!raw) return [];

	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];

		return parsed.map(normalizeMatchRecord).filter((record): record is MatchRecord => Boolean(record));
	} catch {
		return [];
	}
}

export function normalizeFormState(value: unknown): FormState {
	if (!value || typeof value !== 'object') return { ...defaultForm };

	const candidate = value as Partial<FormState>;

	return {
		result: isResult(candidate.result) ? candidate.result : defaultForm.result,
		youId: typeof candidate.youId === 'string' && fighterById.has(candidate.youId) ? candidate.youId : defaultForm.youId,
		opponentId:
			typeof candidate.opponentId === 'string' && fighterById.has(candidate.opponentId)
				? candidate.opponentId
				: defaultForm.opponentId,
		stage: isStage(candidate.stage) ? candidate.stage : defaultForm.stage,
		items: normalizeBoolean(candidate.items, defaultForm.items),
		smashMeter: normalizeBoolean(candidate.smashMeter, defaultForm.smashMeter),
		hazards: normalizeBoolean(candidate.hazards, defaultForm.hazards),
		eliteSmash: normalizeBoolean(candidate.eliteSmash, defaultForm.eliteSmash),
		satisfaction: normalizeFormSatisfaction(candidate.satisfaction, defaultForm.satisfaction),
		toxic: normalizeBoolean(candidate.toxic, defaultForm.toxic),
		lossReasons: normalizeLossReasons(candidate.lossReasons)
	};
}

export function fighterName(id: string) {
	return fighterById.get(id)?.name ?? 'Unknown';
}

export function summaryByResult(records: MatchRecord[]) {
	let wins = 0;
	let losses = 0;

	for (const record of records) {
		if (record.result === 'win') wins += 1;
		else losses += 1;
	}

	return { wins, losses, total: wins + losses, winRate: wins + losses ? wins / (wins + losses) : 0 };
}

export function summaryForToday(records: MatchRecord[], todayStamp: string) {
	const filtered = records.filter((record) => new Date(record.createdAt).toDateString() === todayStamp);
	return summaryByResult(filtered);
}

export function filterRecords(records: MatchRecord[], options: { result: ResultFilter; fighterId: string }) {
	return records.filter((record) => {
		const resultMatches = options.result === 'all' || record.result === options.result;
		const fighterMatches = options.fighterId === 'all' || record.youId === options.fighterId;
		return resultMatches && fighterMatches;
	});
}

export function groupByFighter(records: MatchRecord[]) {
	const aggregates = new Map<string, { wins: number; losses: number; total: number }>();

	for (const record of records) {
		const entry = aggregates.get(record.youId) ?? { wins: 0, losses: 0, total: 0 };
		entry.total += 1;
		if (record.result === 'win') entry.wins += 1;
		else entry.losses += 1;
		aggregates.set(record.youId, entry);
	}

	return fighters
		.map((fighter) => {
			const aggregate = aggregates.get(fighter.id) ?? { wins: 0, losses: 0, total: 0 };
			return {
				fighter,
				...aggregate,
				winRate: aggregate.total ? aggregate.wins / aggregate.total : 0
			};
		})
		.filter((entry) => entry.total > 0)
		.sort((left, right) => right.total - left.total || left.fighter.name.localeCompare(right.fighter.name));
}

let warmupPromise: Promise<void> | null = null;

export function warmFighterImages() {
	if (typeof window === 'undefined') return Promise.resolve();
	if (warmupPromise) return warmupPromise;

	warmupPromise = Promise.all(
		fighters.map((fighter) => {
			return new Promise<void>((resolve) => {
				const image = new Image();
				image.decoding = 'async';
				image.onload = () => resolve();
				image.onerror = () => resolve();
				image.src = fighter.image;
			});
		})
	).then(() => undefined);

	return warmupPromise;
}
