import { Events, GuildMember } from "discord.js";
import { MANAGER_ROLE } from "../../utils/consts.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

/** @type {BotEvent} */
export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("cancel_proceed")) return;

	const { firstPlayer, secondPlayer } = /** @type { Duel } */ (
		await db.get(`${interaction.guildId}.duels.${interaction.channel?.id}`)
	);

	const member = /** @type {GuildMember} */ (interaction.member);

	if (!member.roles.cache.has(MANAGER_ROLE)) {
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

	await db.set(`${interaction.guildId}.users.${firstPlayer}.inGame`, false);
	await db.set(`${interaction.guildId}.users.${secondPlayer}.inGame`, false);

	await db.delete(`${interaction.guildId}.duels.${interaction.channelId}`);

	await interaction.channel?.delete(
		"The duel in this thread has been cancelled",
	);

	return true;
};
