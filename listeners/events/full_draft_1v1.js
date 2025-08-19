import {
	ActionRowBuilder,
	ButtonBuilder,
	Events,
	StringSelectMenuBuilder,
} from "discord.js";
import { setAllButtonsToDisabled } from "../../utils/buttons.js";
import { CLASSES } from "../../utils/consts.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

/** @type { BotEvent } */
export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("full_draft_1v1")) return;

	const { firstPlayer, manager } = /** @type { Duel } */ (
		await db.get(`${interaction.guildId}.duels.${interaction.channel?.id}`)
	);

	if (interaction.user.id !== manager) {
		interaction.reply({
			embeds: [embeds.error("You aren't the manager of this game")],
			ephemeral: true,
		});
		return;
	}

	const classMenu = new StringSelectMenuBuilder()
		.setCustomId(`firstban-${interaction.id}`)
		.addOptions(CLASSES.map((c) => ({ label: c, value: c })));

	const selectMenuActionRow =
		/** @type {ActionRowBuilder<StringSelectMenuBuilder>} */ (
			new ActionRowBuilder().addComponents(classMenu)
		);

	await interaction.reply({
		content: `Select Class to Ban <@${firstPlayer}>`,
		components: [selectMenuActionRow],
	});

	const row = setAllButtonsToDisabled(interaction.message.components[0]);

	await interaction.message.edit({ components: [row] });

	return true;
};
