import type { ChatInputCommandInteraction, Interaction } from "discord.js";

declare global {
	type SlashCommand = (
		interaction: ChatInputCommandInteraction,
	) => Promise<boolean>;

	type SlashSubcommand<T = void> = (
		interaction: ChatInputCommandInteraction,
	) => Promise<T>;

	type SlashOption<U = undefined, T = void> = (
		interaction: ChatInputCommandInteraction,
		args: U,
	) => Promise<T>;

	type BotEvent = (interaction: Interaction) => Promise<boolean | undefined>;

	type Server = {
		duels?: Duels;
		draftChannel?: string;
		maps?: Maps;
		bannedBrawlers?: BannedBrawlers;
		changedClassBrawlers?: ChangedClassBrawlers;
		managers?: Managers;
		users?: Users;
	};

	type Round = {
		class?: string;
		map?: string;
		bans?: string[];
	};

	type Rounds = {
		first?: Round;
		second?: Round;
		third?: Round;
	};

	type Duel = {
		firstPlayer?: string;
		secondPlayer?: string;
		winner: string;
		loser: string;
		sweep: boolean;
		classBans?: string[];
		mapBans?: string[];
		manager?: string;
		rounds?: Rounds;
	};

	type Duels = Record<string, Duel>;

	type Maps = string[];

	type ChangedClassBrawlers = string[];
	type BannedBrawlers = string[];

	type Manager = {
		games?: number;
	};

	type Managers = Record<string, Manager>;

	type DbUser = {
		elo?: number;
		highestElo?: number;
		winstreak?: number;
		highestWinstreak?: number;
		highestPosition?: number;
		inGame: boolean;
		seasonGames?: {
			played?: number;
			won?: number;
		};
		totalGames?: {
			played?: number;
			won?: number;
		};
		tournament?: {
			semifinals?: number;
			finals?: number;
			won?: number;
		};
	};

	type Users = Record<string, DbUser>;
}
