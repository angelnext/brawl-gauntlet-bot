import {
	ActionRowBuilder,
	EmbedBuilder,
	Events,
	GuildMember,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import { setAllButtonsToDisabled } from "../../utils/buttons.js";
import { MANAGER_ROLE } from "../../utils/consts.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

/** @type {BotEvent} */
export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("eval_button")) return;

	const member = /** @type {GuildMember} */ (interaction.member);

	if (!member.roles.cache.has(MANAGER_ROLE)) {
		interaction.reply({
			embeds: [
				embeds.error(
					"You aren't a Gauntlet Manager and therefore cannot evaluate a game",
				),
			],
			ephemeral: true,
		});
		return;
	}

	const { firstPlayer, secondPlayer } = /** @type { Duel } */ (
		await db.get(`${interaction.guildId}.duels.${interaction.channelId}`)
	);

	const d1 = await interaction.guild?.members.fetch(firstPlayer ?? "");
	const d2 = await interaction.guild?.members.fetch(secondPlayer ?? "");

	const embed = new EmbedBuilder()
		.setDescription("Select Winner")
		.setColor(0xffffff);
	const select = new StringSelectMenuBuilder()
		.setCustomId(`eval_select-${interaction.id}`)
		.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel(d1?.user.username || "First Player")
				.setValue(`${firstPlayer}-${interaction.id}`),
			new StringSelectMenuOptionBuilder()
				.setLabel(d2?.user.username || "Second Player")
				.setValue(`${secondPlayer}-${interaction.id}`),
		);

	const selectRow = /** @type {ActionRowBuilder<StringSelectMenuBuilder>} */ (
		new ActionRowBuilder().addComponents(select)
	);

	await interaction.reply({ embeds: [embed], components: [selectRow] });

	const row = setAllButtonsToDisabled(interaction.message.components[0]);

	await interaction.message.edit({ components: [row] });

	return true;
};
