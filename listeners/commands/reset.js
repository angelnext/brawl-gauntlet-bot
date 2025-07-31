import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { db } from "../../utils/database.js";

export const on = new SlashCommandBuilder()
	.setName("reset")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setDescription("Reset everybody's elo");

export const run = async (interaction) => {
	await interaction.deferReply({ ephemeral: true });

	await db.delete(`${interaction.guildId}-games_played`);
	await db.delete(`${interaction.guildId}-games_won`);

	const all = (await db.get(`${interaction.guildId}-elo`)) ?? {};

	const positionings = Object.entries(all).sort(([, a], [, b]) => b - a);

	positionings.forEach(async ([id], index) => {
		const highest =
			(await db.get(`${interaction.guildId}-${id}-max_position`)) ??
			positionings.length;

		await db.set(`${interaction.guildId}-${id}-last_pos`, index + 1);

		if (highest > index + 1)
			await db.set(`${interaction.guildId}-${id}-max_position`, index + 1);
	});

	await db.delete(`${interaction.guildId}-elo`);

	await interaction.editReply({
		content: "Done! Everybody's ELO has been reset to 0",
	});

	return true;
};
