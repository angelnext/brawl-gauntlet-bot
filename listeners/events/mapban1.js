import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Events,
} from "discord.js";
import { db } from "../../utils/database.js";
import * as embeds from "../../utils/embeds.js";

export const on = Events.InteractionCreate;

/** @type {BotEvent} */
export const run = async (interaction) => {
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.startsWith("1mapban")) return;

	const { firstPlayer, secondPlayer } = /** @type { Duel } */ (
		await db.get(`${interaction.guildId}.duels.${interaction.channel?.id}`)
	);
	if (interaction.user.id !== secondPlayer) {
		await interaction.reply({
			content: `Only <@${secondPlayer}> can select this`,
			ephemeral: true,
		});
		return;
	}

	await interaction.deferReply();

	const ban = interaction.values[0];
	await db.push(
		`${interaction.guildId}.duels.${interaction.channel?.id}.mapBans`,
		ban,
	);

	const button = new ButtonBuilder()
		.setCustomId(`ban_button-${interaction.id}`)
		.setLabel("Start the bans")
		.setStyle(ButtonStyle.Danger);

	const actionRow = /** @type {ActionRowBuilder<ButtonBuilder>} */ (
		new ActionRowBuilder().addComponents(button)
	);

	await interaction.editReply({
		content: `Press this button to ban brawlers from each class <@${firstPlayer}>`,
		components: [actionRow],
	});

	await interaction.message?.edit({
		content: "",
		embeds: [
			embeds.success(
				`The map **${ban}** has been banned by <@${interaction.user.id}>`,
			),
		],
		components: [],
	});

	return true;
};
