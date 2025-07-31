import { ButtonInteraction, Events } from "discord.js";
import { db } from "../../utils/database.js";
import { embeds } from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

/** @param {ButtonInteraction} interaction */
export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("cancel_draft")) return;

	const [_, first, second] = interaction.customId.split("-");

	if (!interaction.member.roles.cache.has("1262159706047119401")) {
		interaction.reply({
			embeds: [
				embeds.error(
					"You aren't a Gauntlet Manager and therefore cannot cancel this game",
				),
			],
			ephemeral: true,
		});
		return;
	}

	await interaction.deferUpdate();

	await db.set(`${interaction.guildId}-${first}-in_game`, false);
	await db.set(`${interaction.guildId}-${second}-in_game`, false);

	await interaction.channel.delete();

	return true;
};
