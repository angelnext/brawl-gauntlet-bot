import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { db } from "../../utils/database.js";

export const on = new SlashCommandBuilder()
	.setName("set")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setDescription("Manually set the values of somebody's profile")
	.addUserOption((option) =>
		option
			.setName("user")
			.setDescription("The user to modify")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("value")
			.setDescription("Value to change")
			.setChoices(
				{
					name: "ELO",
					value: "elo",
				},
				{
					name: "Max ELO",
					value: "maxElo",
				},
				{ name: "Games Played", value: "gamesPlayed" },
				{ name: "Games Won", value: "gamesWon" },
				{ name: "Total Games Played", value: "totalGamesPlayed" },
				{ name: "Total Games Won", value: "totalGamesWon" },
				{ name: "Semis Appearances", value: "semisAppearances" },
				{ name: "Finals Appearances", value: "finalsAppearances" },
				{ name: "Won Tournaments", value: "wonTournaments" },
				{ name: "Games Managed", value: "gamesManaged" },
			)
			.setRequired(true),
	)
	.addIntegerOption((option) =>
		option
			.setName("amount")
			.setDescription("The amount to set")
			.setRequired(true),
	);

export const run = async (interaction) => {
	const user = interaction.options.getUser("user", true);
	const value = interaction.options.getString("value", true);
	const amount = interaction.options.getInteger("amount", true);

	const values = {
		elo,
		maxElo,
		gamesPlayed,
		gamesWon,
		totalGamesPlayed,
		totalGamesWon,
		semisAppearances,
		finalsAppearances,
		wonTournaments,
		gamesManaged,
	};

	await values[value](interaction, user, amount);

	const result = value.replace(/([A-Z])/g, " $1");
	const finalResult = result.charAt(0).toUpperCase() + result.slice(1);

	await interaction.reply({
		content: `${finalResult} from <@${user.id}> has been set to ${amount}`,
		ephemeral: true,
	});
};

const elo = async (interaction, user, amount) => {
	const highestELO =
		(await db.get(`${interaction.guildId}-${user.id}-max_elo`)) || 0;

	await db.set(`${interaction.guildId}-elo.${user.id}`, amount);

	if (amount > highestELO) {
		await db.set(`${interaction.guildId}-${user.id}-max_elo`, amount);
	}
};

const maxElo = async (interaction, user, amount) => {
	await db.set(`${interaction.guildId}-${user.id}-max_elo`, amount);
};

const gamesPlayed = async (interaction, user, amount) => {
	await db.set(`${interaction.guildId}-games_played.${user.id}`, amount);
};

const gamesWon = async (interaction, user, amount) => {
	await db.set(`${interaction.guildId}-games_won.${user.id}`, amount);
};

const totalGamesPlayed = async (interaction, user, amount) => {
	await db.set(`${interaction.guildId}-total_games_played.${user.id}`, amount);
};

const totalGamesWon = async (interaction, user, amount) => {
	await db.set(`${interaction.guildId}-total_games_won.${user.id}`, amount);
};

const semisAppearances = async (interaction, user, amount) => {
	await db.set(`${interaction.guildId}-${user.id}-a_semis`, amount);
};

const finalsAppearances = async (interaction, user, amount) => {
	await db.set(`${interaction.guildId}-${user.id}-a_finals`, amount);
};

const wonTournaments = async (interaction, user, amount) => {
	await db.set(`${interaction.guildId}-${user.id}-a_winner`, amount);
};

const gamesManaged = async (interaction, user, amount) => {
	await db.set(`${interaction.guildId}-managers.${user.id}`, amount);
};
