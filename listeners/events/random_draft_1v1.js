import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Events,
} from "discord.js";
import { setAllButtonsToDisabled } from "../../utils/buttons.js";
import { CLASSES } from "../../utils/consts.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

/** @type { BotEvent } */
export const run = async (interaction) => {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith("random_draft_1v1")) return;

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

	const maps = /** @type { Maps } */ (
		(await db.get(`${interaction.guildId}.maps`)) ?? []
	);

	const [class1, class2, class3] = CLASSES.sort(() => Math.random() - 0.5);
	const [map1, map2, map3] = maps.sort(() => Math.random() - 0.5);

	await db.set(
		`${interaction.guildId}.duels.${interaction.channel?.id}.rounds`,
		/** @type { Rounds } */ ({
			first: {
				map: map1,
				class: class1,
			},
			second: {
				map: map2,
				class: class2,
			},
			third: {
				map: map3,
				class: class3,
			},
		}),
	);

	const button = new ButtonBuilder()
		.setCustomId(`ban_button-${interaction.id}`)
		.setLabel("Start the bans")
		.setStyle(ButtonStyle.Danger);

	const buttonActionRow = /** @type {ActionRowBuilder<ButtonBuilder>} */ (
		new ActionRowBuilder().addComponents(button)
	);

	await interaction.reply({
		content: `Press this button to ban brawlers from each class <@${firstPlayer}>`,
		components: [buttonActionRow],
	});

	const row = setAllButtonsToDisabled(interaction.message.components[0]);

	await interaction.message.edit({ components: [row] });

	return true;
};
