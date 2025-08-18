import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { db } from "../../utils/database.js";

export const on = new SlashCommandBuilder()
	.setName("reset")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setDescription("Reset everybody's elo");

/** @type {SlashCommand}  */
export const run = async (interaction) => {
	await interaction.deferReply({ ephemeral: true });

	const users = /** @type { Users } */ (
		(await db.get(`${interaction.guildId}.users`)) || {}
	);

	const positionings = Object.entries(users).sort((a, b) => {
		const eloA = a[1].elo || 0;
		const eloB = b[1].elo || 0;

		return eloB - eloA;
	});

	for (const [index, [id]] of positionings.entries()) {
		await db.set(`${interaction.guildId}.users.${id}.elo`, 0);
		await db.set(`${interaction.guildId}.users.${id}.winstreak`, 0);
		await db.set(`${interaction.guildId}.users.${id}.seasonGames`, {
			played: 0,
			won: 0,
		});

		const highestPos = /** @type { number } */ (
			(await db.get(`${interaction.guildId}.users.${id}.highestPosition`)) ??
				Infinity
		);

		if (highestPos > index + 1) {
			await db.set(
				`${interaction.guildId}.users.${id}.highestPosition`,
				index + 1,
			);
		}
	}

	await interaction.editReply({
		content: "Done! Everybody's ELO has been reset to 0",
	});

	return true;
};
