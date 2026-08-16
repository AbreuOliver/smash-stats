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

const fighterImages = import.meta.glob('/node_modules/smash-ultimate-assets/portraits/small/*.png', {
	eager: true,
	import: 'default'
}) as Record<string, string>;

const fighterLabelOverrides: Record<string, string> = {
	bayonetta: 'Bayonetta',
	bowser_jr: 'Bowser Jr.',
	captain_falcon: 'Captain Falcon',
	dark_pit: 'Dark Pit',
	dark_samus: 'Dark Samus',
	diddy_kong: 'Diddy Kong',
	donkey_kong: 'Donkey Kong',
	dr_mario: 'Dr. Mario',
	duck_hunt: 'Duck Hunt',
	ice_climbers: 'Ice Climbers',
	king_dedede: 'King Dedede',
	king_k_rool: 'King K. Rool',
	little_mac: 'Little Mac',
	mii_brawler: 'Mii Brawler',
	mii_gunner: 'Mii Gunner',
	mii_swordfighter: 'Mii Swordfighter',
	meta_knight: 'Meta Knight',
	mr_game_and_watch: 'Mr. Game & Watch',
	pac_man: 'Pac-Man',
	piranha_plant: 'Piranha Plant',
	pokemon_trainer: 'Pokémon Trainer',
	rosalina_and_luma: 'Rosalina & Luma',
	rob: 'R.O.B.',
	wii_fit_trainer: 'Wii Fit Trainer',
	zero_suit_samus: 'Zero Suit Samus'
};

export const fighters: Fighter[] = Object.entries(fighterImages)
	.map(([path, image]) => {
		const slug = path.split('/').pop()?.replace('.png', '') ?? '';
		const name =
			fighterLabelOverrides[slug] ??
			slug
				.split('_')
				.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
				.join(' ');

		return { id: slug, name, image };
	})
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
	satisfaction: 3,
	toxic: false,
	lossReasons: []
};

export const fighterById = new Map(fighters.map((fighter) => [fighter.id, fighter]));

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
