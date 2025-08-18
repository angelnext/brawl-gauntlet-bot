import { SlashCommandBuilder } from "discord.js";
import { run as challenge } from "./challenge.js";
import { run as leaderboard } from "./leaderboard.js";
import { run as profile } from "./profile.js";

export const on = new SlashCommandBuilder()
	.setName("gauntlet")
	.addSubcommand((subcommand) =>
		subcommand
			.setName("profile")
			.setDescription(
				"Displays your gauntlet profile with your seasonal stats and your all-time stats.",
			)
			.addUserOption((option) =>
				option
					.setName("user")
					.setDescription("The user whose profile you want to check."),
			),
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName("leaderboard")
			.setDescription("Removes one map or all of them if you don't pass a name")
			.addStringOption((option) =>
				option.setName("type").setDescription("Type of leaderboard").addChoices(
					{ name: "Gauntlet Leaderboard", value: "gauntletLeaderboard" },
					{
						name: "Played Games Leaderboard",
						value: "gamesPlayedLeaderboard",
					},
					{ name: "Managers Leaderboard", value: "managersLeaderboard" },
				),
			),
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName("challenge")
			.setDescription("Challenge a person in the server to a gauntlet")
			.addUserOption((option) =>
				option
					.setName("user")
					.setDescription("Who you want to challenge")
					.setRequired(true),
			),
	)
	.setDescription("Map manager");

/** @type { SlashCommand } **/
export const run = async (interaction) => {
	const subcommands = {
		profile,
		leaderboard,
		challenge,
	};

	const subcommand = /** @type { keyof subcommands } */ (
		interaction.options.getSubcommand(true)
	);

	subcommands[subcommand]?.(interaction);

	return true;
};
